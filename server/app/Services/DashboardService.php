<?php

namespace App\Services;

use App\Models\CourseGroup;
use App\Models\Exam;
use App\Models\ExamAssignment;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\Role;
use App\Models\User;
use App\Policies\DashboardPolicy;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class DashboardService
{
    private const STATISTICS_FUNCTIONS = [
        'learning-outcomes' => 'thong_ke_ket_qua',
        'exams' => 'thong_ke_de_thi',
        'classes' => 'thong_ke_lop_hoc',
        'questions' => 'thong_ke_cau_hoi',
    ];

    public function __construct(private DashboardPolicy $dashboardPolicy)
    {
    }

    public function getAdminSummary(User $actor): array
    {
        abort_unless($this->dashboardPolicy->viewAdminSummary($actor), 403);

        $now = Carbon::now();
        $studentRoleIds = $this->studentRoleIds();
        $hasLegacyStudentFlag = Schema::hasColumn('users', 'is_student');

        return [
            'stats' => [
                'total_students' => $this->studentQuery($studentRoleIds, $hasLegacyStudentFlag)->count(),
                'active_classes' => CourseGroup::query()
                    ->where('is_deleted', false)
                    ->where('is_hidden', false)
                    ->count(),
                'active_exams' => ExamAssignment::query()
                    ->where('start_time', '<=', $now)
                    ->where('end_time', '>', $now)
                    ->whereHas('exam', fn ($query) => $query
                        ->where('is_deleted', false)
                        ->where('start_time', '<=', $now)
                        ->where('end_time', '>', $now))
                    ->whereHas('courseGroup', fn ($query) => $query
                        ->where('is_deleted', false)
                        ->where('is_hidden', false))
                    ->distinct()
                    ->count('exam_id'),
                'question_bank' => Question::query()->where('is_deleted', false)->count(),
            ],
            'recent_classes' => CourseGroup::query()
                ->with('subject:id,subject_name')
                ->withCount([
                    'students as active_student_count' => function ($query) use (
                        $studentRoleIds,
                        $hasLegacyStudentFlag
                    ): void {
                        $query->where('users.is_deleted', false);
                        $this->constrainToStudentUsers(
                            $query,
                            $studentRoleIds,
                            $hasLegacyStudentFlag
                        );
                    },
                ])
                ->where('is_deleted', false)
                ->where('is_hidden', false)
                ->orderByDesc('id')
                ->limit(5)
                ->get(['id', 'group_name', 'subject_id'])
                ->map(fn (CourseGroup $courseGroup) => [
                    'id' => (int) $courseGroup->id,
                    'group_name' => $courseGroup->group_name,
                    'subject_name' => $courseGroup->subject?->subject_name,
                    'student_count' => (int) ($courseGroup->active_student_count ?? 0),
                ])
                ->values(),
            'upcoming_exams' => Exam::query()
                ->join('exam_assignments', 'exam_assignments.exam_id', '=', 'exams.id')
                ->join('course_groups', 'course_groups.id', '=', 'exam_assignments.course_group_id')
                ->where('exams.is_deleted', false)
                ->where('course_groups.is_deleted', false)
                ->where('course_groups.is_hidden', false)
                ->where(function ($query) use ($now): void {
                    $query->where('exam_assignments.start_time', '>', $now)
                        ->orWhere('exams.start_time', '>', $now);
                })
                ->where('exam_assignments.end_time', '>', $now)
                ->where('exams.end_time', '>', $now)
                ->whereColumn('exam_assignments.end_time', '>', 'exams.start_time')
                ->whereColumn('exams.end_time', '>', 'exam_assignments.start_time')
                ->groupBy('exams.id', 'exams.exam_name')
                ->select('exams.id', 'exams.exam_name')
                ->selectRaw(
                    'MIN(CASE WHEN exam_assignments.start_time > exams.start_time THEN exam_assignments.start_time ELSE exams.start_time END) AS start_time'
                )
                ->orderBy('start_time')
                ->limit(5)
                ->get(),
        ];
    }

    public function getAdminStatistics(
        User $actor,
        string $report,
        string $periodType = 'month',
        string $periodValue = '',
        ?string $periodStartDate = null,
        ?string $periodEndDate = null
    ): array
    {
        $functionName = self::STATISTICS_FUNCTIONS[$report] ?? null;
        abort_unless(
            $functionName !== null
                && $this->dashboardPolicy->viewStatistics($actor, $functionName),
            403
        );

        $now = Carbon::now();
        if ($periodValue === '') {
            $periodValue = match ($periodType) {
                'quarter' => $now->format('Y') . '-Q' . $now->quarter,
                'year' => $now->format('Y'),
                'custom' => '',
                default => $now->format('Y-m'),
            };
        }
        [$periodStart, $periodEnd] = $this->statisticsPeriodRange(
            $periodType,
            $periodValue,
            $periodStartDate,
            $periodEndDate
        );

        $studentRoleIds = $this->studentRoleIds();
        $hasLegacyStudentFlag = Schema::hasColumn('users', 'is_student');
        $periodClassIds = $this->scheduledAssignmentsWithinPeriod($periodStart, $periodEnd)
            ->pluck('course_group_id')
            ->unique()
            ->values();
        $activeExam = fn ($query) => $query->where('is_deleted', false);
        $submittedAttempts = ExamAttempt::query()
            ->where('status', 'SUBMITTED')
            ->where('start_time', '>=', $periodStart)
            ->where('start_time', '<', $periodEnd)
            ->whereHas('exam', $activeExam);
        $allAttempts = ExamAttempt::query()
            ->where('status', '!=', 'CANCELLED')
            ->where('start_time', '>=', $periodStart)
            ->where('start_time', '<', $periodEnd)
            ->whereHas('exam', $activeExam);

        $usesDailyTrend = $periodType === 'month'
            || ($periodType === 'custom' && $periodStart->diffInDays($periodEnd) <= 62);
        $trendBucketExpression = $usesDailyTrend
            ? 'DATE(start_time)'
            : "DATE_FORMAT(start_time, '%Y-%m')";
        $trendRows = (clone $allAttempts)
            ->selectRaw(
                "{$trendBucketExpression} AS bucket, COUNT(*) AS attempts, " .
                "AVG(CASE WHEN status = 'SUBMITTED' THEN total_score ELSE NULL END) AS average_score"
            )
            ->groupByRaw($trendBucketExpression)
            ->get()
            ->keyBy('bucket');

        $trendBuckets = [];
        $bucketCursor = $usesDailyTrend
            ? $periodStart->copy()
            : $periodStart->copy()->startOfMonth();
        for ($cursor = $bucketCursor; $cursor < $periodEnd;) {
            $trendBuckets[] = $usesDailyTrend
                ? $cursor->format('Y-m-d')
                : $cursor->format('Y-m');
            $usesDailyTrend ? $cursor->addDay() : $cursor->addMonth();
        }
        $attemptTrend = collect($trendBuckets)
            ->map(function (string $bucket) use ($trendRows): array {
                $row = $trendRows->get($bucket);

                return [
                    'bucket' => $bucket,
                    'attempt_count' => (int) ($row->attempts ?? 0),
                    'average_score' => isset($row->average_score)
                        ? round((float) $row->average_score, 2)
                        : null,
                ];
            })
            ->values();

        $scoreCounts = (clone $submittedAttempts)
            ->whereNotNull('total_score')
            ->selectRaw(
                'SUM(CASE WHEN total_score >= 0 AND total_score < 2 THEN 1 ELSE 0 END) AS score_0_2,
                SUM(CASE WHEN total_score >= 2 AND total_score < 4 THEN 1 ELSE 0 END) AS score_2_4,
                SUM(CASE WHEN total_score >= 4 AND total_score < 6 THEN 1 ELSE 0 END) AS score_4_6,
                SUM(CASE WHEN total_score >= 6 AND total_score < 8 THEN 1 ELSE 0 END) AS score_6_8,
                SUM(CASE WHEN total_score >= 8 THEN 1 ELSE 0 END) AS score_8_10'
            )
            ->first();

        $scoreDistribution = collect([
            ['range' => '0–2', 'key' => 'score_0_2'],
            ['range' => '2–4', 'key' => 'score_2_4'],
            ['range' => '4–6', 'key' => 'score_4_6'],
            ['range' => '6–8', 'key' => 'score_6_8'],
            ['range' => '8–10', 'key' => 'score_8_10'],
        ])->map(fn (array $bucket) => [
            'range' => $bucket['range'],
            'attempt_count' => (int) ($scoreCounts->{$bucket['key']} ?? 0),
        ])->values();

        $subjectEnrollment = DB::table('subjects')
            ->leftJoin('course_groups', function ($join) use ($periodClassIds): void {
                $join->on('course_groups.subject_id', '=', 'subjects.id')
                    ->where('course_groups.is_deleted', false)
                    ->where('course_groups.is_hidden', false)
                    ->whereIn('course_groups.id', $periodClassIds);
            })
            ->leftJoin('course_group_students', 'course_group_students.course_group_id', '=', 'course_groups.id')
            ->leftJoin('users', function ($join) use ($studentRoleIds, $hasLegacyStudentFlag): void {
                $join->on('users.id', '=', 'course_group_students.student_id')
                    ->where('users.is_deleted', false);
                $this->constrainToStudentUsers(
                    $join,
                    $studentRoleIds,
                    $hasLegacyStudentFlag
                );
            })
            ->where('subjects.is_deleted', false)
            ->groupBy('subjects.id', 'subjects.subject_name')
            ->select('subjects.id', 'subjects.subject_name')
            ->selectRaw('COUNT(DISTINCT course_groups.id) AS class_count')
            ->selectRaw('COUNT(DISTINCT users.id) AS student_count')
            ->havingRaw('COUNT(DISTINCT course_groups.id) > 0')
            ->orderByDesc('student_count')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'subject_id' => (int) $row->id,
                'subject_name' => $row->subject_name,
                'class_count' => (int) $row->class_count,
                'student_count' => (int) $row->student_count,
            ])
            ->values();

        $largestClasses = CourseGroup::query()
            ->with('subject:id,subject_name')
            ->withCount([
                'students as active_student_count' => function ($query) use (
                    $studentRoleIds,
                    $hasLegacyStudentFlag
                ): void {
                    $query->where('users.is_deleted', false);
                    $this->constrainToStudentUsers(
                        $query,
                        $studentRoleIds,
                        $hasLegacyStudentFlag
                    );
                },
            ])
            ->where('is_deleted', false)
            ->where('is_hidden', false)
            ->whereIn('id', $periodClassIds)
            ->orderByDesc('active_student_count')
            ->orderBy('group_name')
            ->limit(8)
            ->get(['id', 'group_name', 'subject_id'])
            ->map(fn (CourseGroup $courseGroup) => [
                'id' => (int) $courseGroup->id,
                'class_name' => $courseGroup->group_name,
                'subject_name' => $courseGroup->subject?->subject_name,
                'student_count' => (int) ($courseGroup->active_student_count ?? 0),
            ])
            ->values();

        $averageScoreBySubject = DB::table('subjects')
            ->join('exams', function ($join): void {
                $join->on('exams.subject_id', '=', 'subjects.id')
                    ->where('exams.is_deleted', false);
            })
            ->join('exam_attempts', function ($join) use ($periodStart, $periodEnd): void {
                $join->on('exam_attempts.exam_id', '=', 'exams.id')
                    ->where('exam_attempts.status', 'SUBMITTED')
                    ->whereNotNull('exam_attempts.total_score')
                    ->where('exam_attempts.start_time', '>=', $periodStart)
                    ->where('exam_attempts.start_time', '<', $periodEnd);
            })
            ->where('subjects.is_deleted', false)
            ->groupBy('subjects.id', 'subjects.subject_name')
            ->select('subjects.id', 'subjects.subject_name')
            ->selectRaw('COUNT(exam_attempts.id) AS attempt_count')
            ->selectRaw('AVG(exam_attempts.total_score) AS average_score')
            ->orderByDesc('average_score')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'subject_id' => (int) $row->id,
                'subject_name' => $row->subject_name,
                'attempt_count' => (int) $row->attempt_count,
                'average_score' => round((float) $row->average_score, 2),
            ])
            ->values();

        $topExams = DB::table('exams')
            ->leftJoin('subjects', 'subjects.id', '=', 'exams.subject_id')
            ->leftJoin('exam_attempts', function ($join) use ($periodStart, $periodEnd): void {
                $join->on('exam_attempts.exam_id', '=', 'exams.id')
                    ->where('exam_attempts.status', '!=', 'CANCELLED')
                    ->where('exam_attempts.start_time', '>=', $periodStart)
                    ->where('exam_attempts.start_time', '<', $periodEnd);
            })
            ->where('exams.is_deleted', false)
            ->groupBy('exams.id', 'exams.exam_name', 'subjects.subject_name')
            ->select('exams.id', 'exams.exam_name', 'subjects.subject_name')
            ->selectRaw('COUNT(exam_attempts.id) AS attempt_count')
            ->selectRaw("SUM(CASE WHEN exam_attempts.status = 'SUBMITTED' THEN 1 ELSE 0 END) AS submitted_count")
            ->selectRaw(
                "AVG(CASE WHEN exam_attempts.status = 'SUBMITTED' " .
                'THEN exam_attempts.total_score ELSE NULL END) AS average_score'
            )
            ->havingRaw('COUNT(exam_attempts.id) > 0')
            ->orderByDesc('attempt_count')
            ->orderBy('exams.exam_name')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'exam_name' => $row->exam_name,
                'subject_name' => $row->subject_name,
                'attempt_count' => (int) $row->attempt_count,
                'submitted_count' => (int) $row->submitted_count,
                'average_score' => $row->average_score === null
                    ? null
                    : round((float) $row->average_score, 2),
            ])
            ->values();

        $totalEnrollments = DB::table('course_group_students')
            ->join('course_groups', function ($join) use ($periodClassIds): void {
                $join->on('course_groups.id', '=', 'course_group_students.course_group_id')
                    ->where('course_groups.is_deleted', false)
                    ->where('course_groups.is_hidden', false)
                    ->whereIn('course_groups.id', $periodClassIds);
            })
            ->join('users', function ($join) use ($studentRoleIds, $hasLegacyStudentFlag): void {
                $join->on('users.id', '=', 'course_group_students.student_id')
                    ->where('users.is_deleted', false);
                $this->constrainToStudentUsers(
                    $join,
                    $studentRoleIds,
                    $hasLegacyStudentFlag
                );
            })
            ->count();

        $questionTotals = DB::table('questions')
            ->where('is_deleted', false)
            ->where('created_at', '>=', $periodStart)
            ->where('created_at', '<', $periodEnd)
            ->selectRaw('COUNT(*) AS total_questions')
            ->selectRaw("SUM(CASE WHEN status = 'public' THEN 1 ELSE 0 END) AS public_questions")
            ->selectRaw("SUM(CASE WHEN status = 'private' THEN 1 ELSE 0 END) AS private_questions")
            ->selectRaw("SUM(CASE WHEN status = 'archive' THEN 1 ELSE 0 END) AS archived_questions")
            ->first();

        // Older bulk inserts left pivot timestamps null, so attribute those uses to the exam creation date.
        $totalQuestionExamUses = DB::table('exam_questions')
            ->join('questions', function ($join): void {
                $join->on('questions.id', '=', 'exam_questions.question_id')
                    ->where('questions.is_deleted', false);
            })
            ->join('exams', function ($join): void {
                $join->on('exams.id', '=', 'exam_questions.exam_id')
                    ->where('exams.is_deleted', false);
            })
            ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) >= ?', [$periodStart])
            ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) < ?', [$periodEnd])
            ->count();

        $difficultyDistribution = DB::table('questions')
            ->leftJoin('difficulties', 'difficulties.id', '=', 'questions.difficulty_id')
            ->where('questions.is_deleted', false)
            ->where('questions.created_at', '>=', $periodStart)
            ->where('questions.created_at', '<', $periodEnd)
            ->groupBy('difficulties.id', 'difficulties.difficulty_name')
            ->select('difficulties.difficulty_name')
            ->selectRaw('COUNT(questions.id) AS question_count')
            ->orderBy('difficulties.id')
            ->get()
            ->map(fn ($row) => [
                'difficulty_name' => $row->difficulty_name,
                'question_count' => (int) $row->question_count,
            ])
            ->values();

        $questionCountExpression =
            'COUNT(DISTINCT CASE WHEN questions.created_at >= ? AND questions.created_at < ? THEN questions.id END)';
        $subjectQuestionBank = DB::table('subjects')
            ->leftJoin('questions', function ($join): void {
                $join->on('questions.subject_id', '=', 'subjects.id')
                    ->where('questions.is_deleted', false);
            })
            ->leftJoin('exam_questions', 'exam_questions.question_id', '=', 'questions.id')
            ->leftJoin('exams', function ($join) use ($periodStart, $periodEnd): void {
                $join->on('exams.id', '=', 'exam_questions.exam_id')
                    ->where('exams.is_deleted', false)
                    ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) >= ?', [$periodStart])
                    ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) < ?', [$periodEnd]);
            })
            ->where('subjects.is_deleted', false)
            ->groupBy('subjects.id', 'subjects.subject_name')
            ->select('subjects.id', 'subjects.subject_name')
            ->selectRaw(
                "{$questionCountExpression} AS question_count",
                [$periodStart, $periodEnd]
            )
            ->selectRaw('COUNT(exams.id) AS usage_count')
            ->havingRaw(
                "{$questionCountExpression} > 0",
                [$periodStart, $periodEnd]
            )
            ->orderByDesc('question_count')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'subject_id' => (int) $row->id,
                'subject_name' => $row->subject_name,
                'question_count' => (int) $row->question_count,
                'usage_count' => (int) $row->usage_count,
            ])
            ->values();

        $mostUsedQuestions = Question::query()
            ->with(['subject:id,subject_name', 'difficulty:id,difficulty_name'])
            ->withCount(['exams as exam_usage_count' => fn ($query) => $query
                ->where('exams.is_deleted', false)
                ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) >= ?', [$periodStart])
                ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) < ?', [$periodEnd])])
            ->where('is_deleted', false)
            ->whereHas('exams', fn ($query) => $query
                ->where('exams.is_deleted', false)
                ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) >= ?', [$periodStart])
                ->whereRaw('COALESCE(exam_questions.created_at, exams.created_at) < ?', [$periodEnd]))
            ->orderByDesc('exam_usage_count')
            ->orderBy('id')
            ->limit(8)
            ->get(['id', 'subject_id', 'difficulty_id'])
            ->map(fn (Question $question) => [
                'id' => (int) $question->id,
                'subject_name' => $question->subject?->subject_name,
                'difficulty_name' => $question->difficulty?->difficulty_name,
                'usage_count' => (int) $question->exam_usage_count,
            ])
            ->values();

        $totalAttempts = (clone $allAttempts)->count();
        $submittedCount = (clone $submittedAttempts)->count();
        $activeClasses = CourseGroup::query()
            ->where('is_deleted', false)
            ->where('is_hidden', false)
            ->whereIn('id', $periodClassIds)
            ->count();
        $activeSubjects = DB::table('course_groups')
            ->join('subjects', function ($join): void {
                $join->on('subjects.id', '=', 'course_groups.subject_id')
                    ->where('subjects.is_deleted', false);
            })
            ->where('course_groups.is_deleted', false)
            ->where('course_groups.is_hidden', false)
            ->whereIn('course_groups.id', $periodClassIds)
            ->distinct()
            ->count('course_groups.subject_id');
        $scheduledAssignments = $this->scheduledAssignmentsWithinPeriod($periodStart, $periodEnd);
        $activeExams = (clone $scheduledAssignments)
            ->distinct()
            ->count('exam_id');

        $upcomingExams = (clone $scheduledAssignments)
            ->where(function ($query) use ($now): void {
                $query->where('exam_assignments.start_time', '>', $now)
                    ->orWhereHas('exam', fn ($examQuery) => $examQuery
                        ->where('start_time', '>', $now));
            })
            ->distinct()
            ->count('exam_id');

        $averageScore = (clone $submittedAttempts)->whereNotNull('total_score')->avg('total_score');

        $statistics = [
            'summary' => [
                'total_students' => $this->studentQuery($studentRoleIds, $hasLegacyStudentFlag)->count(),
                'total_teachers' => $this->teacherQuery()->count(),
                'active_classes' => $activeClasses,
                'active_exams' => $activeExams,
                'upcoming_exams' => $upcomingExams,
                'total_exams' => Exam::query()
                    ->where('is_deleted', false)
                    ->where('created_at', '>=', $periodStart)
                    ->where('created_at', '<', $periodEnd)
                    ->count(),
                'question_bank' => Question::query()->where('is_deleted', false)->count(),
                'submitted_attempts' => $submittedCount,
                'students_with_submissions' => (clone $submittedAttempts)
                    ->distinct()
                    ->count('student_id'),
                'in_progress_attempts' => (clone $allAttempts)
                    ->whereIn('status', ['IN_PROGRESS', 'SAVED'])
                    ->count(),
                'completion_rate' => $totalAttempts > 0
                    ? round(($submittedCount / $totalAttempts) * 100, 1)
                    : 0,
                'average_score' => $averageScore === null ? null : round((float) $averageScore, 2),
            ],
            'class_stats' => [
                'active_classes' => $activeClasses,
                'active_subjects' => $activeSubjects,
                'total_enrollments' => $totalEnrollments,
                'average_class_size' => $activeClasses > 0
                    ? round($totalEnrollments / $activeClasses, 1)
                    : 0,
            ],
            'question_stats' => [
                'total_questions' => (int) ($questionTotals->total_questions ?? 0),
                'public_questions' => (int) ($questionTotals->public_questions ?? 0),
                'private_questions' => (int) ($questionTotals->private_questions ?? 0),
                'archived_questions' => (int) ($questionTotals->archived_questions ?? 0),
                'total_usage' => $totalQuestionExamUses,
            ],
            'attempt_trend' => $attemptTrend,
            'subject_enrollment' => $subjectEnrollment,
            'score_distribution' => $scoreDistribution,
            'largest_classes' => $largestClasses,
            'average_score_by_subject' => $averageScoreBySubject,
            'top_exams' => $topExams,
            'difficulty_distribution' => $difficultyDistribution,
            'subject_question_bank' => $subjectQuestionBank,
            'most_used_questions' => $mostUsedQuestions,
        ];

        return array_replace(
            $this->scopeStatisticsToReport($statistics, $report),
            [
                'period' => [
                    'type' => $periodType,
                    'value' => $periodType === 'custom'
                        ? $periodStart->toDateString() . '/' . $periodEnd->copy()->subDay()->toDateString()
                        : $periodValue,
                    'start_date' => $periodStart->toDateString(),
                    'end_date' => $periodEnd->copy()->subDay()->toDateString(),
                ],
            ]
        );
    }

    private function statisticsPeriodRange(
        string $type,
        string $value,
        ?string $periodStartDate,
        ?string $periodEndDate
    ): array
    {
        if ($type === 'custom' && $periodStartDate !== null && $periodEndDate !== null) {
            $start = Carbon::parse($periodStartDate)->startOfDay();
            $end = Carbon::parse($periodEndDate)->startOfDay();

            if (
                $start->toDateString() !== $periodStartDate
                || $end->toDateString() !== $periodEndDate
                || (int) $start->format('Y') < 1000
                || (int) $end->format('Y') > 9998
                || $end->lt($start)
                || $start->diffInDays($end) > 3660
            ) {
                throw ValidationException::withMessages([
                    'end_date' => ['The selected date range must be valid and no longer than 10 years.'],
                ]);
            }

            return [$start, $end->addDay()];
        }

        if (
            $type === 'month'
            && preg_match('/^(\d{4})-(0[1-9]|1[0-2])$/', $value, $matches)
            && (int) $matches[1] >= 1000
            && (int) $matches[1] <= 9998
        ) {
            $start = Carbon::create((int) $matches[1], (int) $matches[2], 1)->startOfDay();
            return [$start, $start->copy()->addMonth()];
        }

        if (
            $type === 'quarter'
            && preg_match('/^(\d{4})-Q([1-4])$/', $value, $matches)
            && (int) $matches[1] >= 1000
            && (int) $matches[1] <= 9998
        ) {
            $startMonth = (((int) $matches[2]) - 1) * 3 + 1;
            $start = Carbon::create((int) $matches[1], $startMonth, 1)->startOfDay();
            return [$start, $start->copy()->addMonths(3)];
        }

        if (
            $type === 'year'
            && preg_match('/^(\d{4})$/', $value, $matches)
            && (int) $matches[1] >= 1000
            && (int) $matches[1] <= 9998
        ) {
            $start = Carbon::create((int) $matches[1], 1, 1)->startOfDay();
            return [$start, $start->copy()->addYear()];
        }

        throw ValidationException::withMessages([
            'period_value' => ['The selected value does not match the selected period type.'],
        ]);
    }

    private function scheduledAssignmentsWithinPeriod(Carbon $periodStart, Carbon $periodEnd)
    {
        return ExamAssignment::query()
            ->where('exam_assignments.start_time', '<', $periodEnd)
            ->where('exam_assignments.end_time', '>', $periodStart)
            ->whereHas('exam', fn ($query) => $query
                ->where('is_deleted', false)
                ->where('start_time', '<', $periodEnd)
                ->where('end_time', '>', $periodStart)
                ->whereColumn('exams.end_time', '>', 'exam_assignments.start_time')
                ->whereColumn('exam_assignments.end_time', '>', 'exams.start_time'))
            ->whereHas('courseGroup', fn ($query) => $query
                ->where('is_deleted', false)
                ->where('is_hidden', false));
    }

    private function scopeStatisticsToReport(array $statistics, string $report): array
    {
        $emptySummary = array_fill_keys(array_keys($statistics['summary']), 0);
        $emptySummary['average_score'] = null;
        $emptyClassStats = array_fill_keys(array_keys($statistics['class_stats']), 0);
        $emptyQuestionStats = array_fill_keys(array_keys($statistics['question_stats']), 0);
        $emptyArrays = [
            'attempt_trend' => [],
            'subject_enrollment' => [],
            'score_distribution' => [],
            'largest_classes' => [],
            'average_score_by_subject' => [],
            'top_exams' => [],
            'difficulty_distribution' => [],
            'subject_question_bank' => [],
            'most_used_questions' => [],
        ];
        $scoped = array_replace($statistics, [
            'summary' => $emptySummary,
            'class_stats' => $emptyClassStats,
            'question_stats' => $emptyQuestionStats,
            ...$emptyArrays,
        ]);

        return match ($report) {
            'learning-outcomes' => array_replace($scoped, [
                'summary' => array_replace($emptySummary, array_intersect_key(
                    $statistics['summary'],
                    array_flip([
                        'submitted_attempts',
                        'students_with_submissions',
                        'completion_rate',
                        'average_score',
                    ])
                )),
                'score_distribution' => $statistics['score_distribution'],
                'average_score_by_subject' => $statistics['average_score_by_subject'],
            ]),
            'exams' => array_replace($scoped, [
                'summary' => array_replace($emptySummary, array_intersect_key(
                    $statistics['summary'],
                    array_flip([
                        'active_exams',
                        'upcoming_exams',
                        'total_exams',
                        'in_progress_attempts',
                    ])
                )),
                'attempt_trend' => $statistics['attempt_trend'],
                'top_exams' => $statistics['top_exams'],
            ]),
            'classes' => array_replace($scoped, [
                'class_stats' => $statistics['class_stats'],
                'subject_enrollment' => $statistics['subject_enrollment'],
                'largest_classes' => $statistics['largest_classes'],
            ]),
            'questions' => array_replace($scoped, [
                'question_stats' => $statistics['question_stats'],
                'difficulty_distribution' => $statistics['difficulty_distribution'],
                'subject_question_bank' => $statistics['subject_question_bank'],
                'most_used_questions' => $statistics['most_used_questions'],
            ]),
            default => $scoped,
        };
    }

    private function studentRoleIds(): Collection
    {
        return Role::query()
            ->where('is_deleted', false)
            ->get()
            ->filter(fn (Role $role): bool => $role->canonicalCode() === 'STUDENT')
            ->pluck('id');
    }

    private function studentQuery(Collection $studentRoleIds, bool $hasLegacyStudentFlag)
    {
        $query = User::query()->where('is_deleted', false);
        $this->constrainToStudentUsers($query, $studentRoleIds, $hasLegacyStudentFlag);

        return $query;
    }

    private function constrainToStudentUsers(
        $query,
        Collection $studentRoleIds,
        bool $hasLegacyStudentFlag
    ): void {
        $query->where(function ($studentFilter) use (
            $studentRoleIds,
            $hasLegacyStudentFlag
        ): void {
            if ($studentRoleIds->isNotEmpty()) {
                $studentFilter->whereIn('users.role_id', $studentRoleIds);
            }

            if ($hasLegacyStudentFlag) {
                $legacyStudentFilter = fn ($legacyStudents) => $legacyStudents
                    ->whereNull('users.role_id')
                    ->where('users.is_student', true);

                if ($studentRoleIds->isNotEmpty()) {
                    $studentFilter->orWhere($legacyStudentFilter);
                } else {
                    $legacyStudentFilter($studentFilter);
                }
            } elseif ($studentRoleIds->isEmpty()) {
                $studentFilter->whereRaw('1 = 0');
            }
        });
    }

    private function teacherQuery()
    {
        $teacherRoleIds = Role::query()
            ->where('is_deleted', false)
            ->get()
            ->filter(fn (Role $role): bool => $role->canonicalCode() === 'TEACHER')
            ->pluck('id');

        return User::query()
            ->where('is_deleted', false)
            ->whereIn('role_id', $teacherRoleIds);
    }
}

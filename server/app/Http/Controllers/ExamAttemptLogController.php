<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExamAttemptLogRequest;
use App\Http\Requests\UpdateExamAttemptLogRequest;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptLog;
use App\Models\User;
use App\Services\ExamAttemptLogService;
use App\Services\ExamAttemptService;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Facades\DB;

class ExamAttemptLogController extends Controller
{
    use ApiResponseTrait;

    protected ExamAttemptLogService $examAttemptLogService;
    protected ExamAttemptService $examAttemptService;

    public function __construct(ExamAttemptLogService $examAttemptLogService, ExamAttemptService $examAttemptService)
    {
        $this->examAttemptLogService = $examAttemptLogService;
        $this->examAttemptService = $examAttemptService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = $this->examAttemptLogService->getAll();

        return $this->success($data);
    }

    public function store(StoreExamAttemptLogRequest $request)
    {
        $data = $this->examAttemptLogService->add($request->validated());

        return $this->created($data);
    }

    public function show(ExamAttemptLog $examAttemptLog)
    {
        $data = $this->examAttemptLogService->getOne($examAttemptLog);

        return $this->success($data);
    }

    public function update(
        UpdateExamAttemptLogRequest $request,
        ExamAttempt $examAttempt
    ) {
        return DB::transaction(function () use ($request, $examAttempt) {
            $actor = User::query()
                ->with('role')
                ->lockForUpdate()
                ->findOrFail((int) $request->user()->id);
            $lockedAttempt = ExamAttempt::query()
                ->whereKey($examAttempt->id)
                ->lockForUpdate()
                ->firstOrFail();

            $count = $this->examAttemptLogService->update(
                $request->validated(),
                $lockedAttempt,
                $actor
            );

            $lockedAttempt->load('exam.examConfiguration');
            $configuration = $lockedAttempt->exam?->examConfiguration;
            if ($configuration?->is_limit_switch_tab
                && $count >= $configuration->tab_switch_limit
                && $lockedAttempt->status !== 'SUBMITTED') {
                $this->examAttemptService->submitAfterTabSwitchLimit(
                    $lockedAttempt->id,
                    $actor
                );
            }

            return $this->success(['tab_switch_count' => $count]);
        });
    }

    public function destroy(ExamAttemptLog $examAttemptLog)
    {
        $data = $this->examAttemptLogService->delete($examAttemptLog);

        return $this->success($data);
    }
}

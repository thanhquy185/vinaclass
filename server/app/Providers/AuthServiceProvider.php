<?php

namespace App\Providers;

use App\Models\Chapter;
use App\Models\CourseGroup;
use App\Models\CourseGroupMaterial;
use App\Models\Difficulty;
use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Notification;
use App\Models\Question;
use App\Models\Role;
use App\Models\Subject;
use App\Models\TeacherSubject;
use App\Models\User;
use App\Policies\ChapterPolicy;
use App\Policies\CourseGroupPolicy;
use App\Policies\CourseGroupMaterialPolicy;
use App\Policies\DifficultyPolicy;
use App\Policies\ExamPolicy;
use App\Policies\ExamAttemptPolicy;
use App\Policies\NotificationPolicy;
use App\Policies\QuestionPolicy;
use App\Policies\RolePolicy;
use App\Policies\SubjectPolicy;
use App\Policies\TeacherSubjectPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Chapter::class => ChapterPolicy::class,
        CourseGroup::class => CourseGroupPolicy::class,
        CourseGroupMaterial::class => CourseGroupMaterialPolicy::class,
        Difficulty::class => DifficultyPolicy::class,
        Exam::class => ExamPolicy::class,
        ExamAttempt::class => ExamAttemptPolicy::class,
        Notification::class => NotificationPolicy::class,
        Question::class => QuestionPolicy::class,
        Role::class => RolePolicy::class,
        Subject::class => SubjectPolicy::class,
        TeacherSubject::class => TeacherSubjectPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}

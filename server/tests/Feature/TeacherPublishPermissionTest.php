<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use App\Policies\NotificationPolicy;
use App\Policies\QuestionPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherPublishPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_defaults_allow_publishing_questions_and_notifications(): void
    {
        config(['authorization.driver' => 'v2']);

        $teacherRole = Role::query()->where('code', 'TEACHER')->firstOrFail();
        $teacher = User::query()->create([
            'username' => 'teacher-publisher',
            'email' => 'teacher-publisher@example.edu',
            'password' => 'TeacherPass123',
            'role_id' => $teacherRole->id,
        ]);

        $this->assertTrue(app(QuestionPolicy::class)->publish($teacher));
        $this->assertTrue(app(NotificationPolicy::class)->publish($teacher));
    }
}

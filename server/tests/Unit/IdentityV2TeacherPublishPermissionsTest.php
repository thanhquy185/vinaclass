<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Services\IdentityV2\IdentityV2Definitions;
use PHPUnit\Framework\TestCase;

class IdentityV2TeacherPublishPermissionsTest extends TestCase
{
    public function test_teacher_defaults_include_publish_for_questions_and_notifications(): void
    {
        $teacherDefaults = IdentityV2Definitions::ROLE_PERMISSION_DEFAULTS['TEACHER'];

        $this->assertContains('PUBLISH', $teacherDefaults['cau_hoi']);
        $this->assertContains('PUBLISH', $teacherDefaults['thong_bao']);
    }

    public function test_teacher_role_can_receive_question_and_notification_publish_actions(): void
    {
        $teacherRole = new Role(['code' => 'TEACHER', 'role_name' => 'teacher']);

        $this->assertTrue(IdentityV2Definitions::roleCanReceiveFunctionAction(
            $teacherRole,
            'cau_hoi',
            'PUBLISH'
        ));
        $this->assertTrue(IdentityV2Definitions::roleCanReceiveFunctionAction(
            $teacherRole,
            'thong_bao',
            'PUBLISH'
        ));
    }
}

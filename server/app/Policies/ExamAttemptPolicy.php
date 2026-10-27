<?php

namespace App\Policies;

use App\Models\ExamAttempt;
use App\Models\User;

class ExamAttemptPolicy
{
    public function startOwnAttempt(User $actor, User $student): bool
    {
        return (int) $actor->id === (int) $student->id
            && !$student->is_locked
            && !$student->is_deleted
            && $student->hasRoleCode('STUDENT');
    }

    public function manage(User $user): bool
    {
        return !$user->is_locked
            && !$user->is_deleted
            && $user->hasRoleCode('ADMIN');
    }

    public function updateOwnLog(User $user, ExamAttempt $examAttempt): bool
    {
        return $this->updateOwnAttempt($user, $examAttempt);
    }

    public function updateOwnAttempt(User $user, ExamAttempt $examAttempt): bool
    {
        return !$user->is_locked
            && !$user->is_deleted
            && $user->hasRoleCode('STUDENT')
            && (int) $examAttempt->student_id === (int) $user->id;
    }
}

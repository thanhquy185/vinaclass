<?php

namespace App\Services;

class ExamUpdatePlan
{
    public function __construct(
        public readonly bool $courseGroupAssignmentsChanged,
        public readonly bool $scheduleChanged
    ) {
    }
}

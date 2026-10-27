<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Traits\ApiResponseTrait;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private DashboardService $dashboardService)
    {
    }

    public function adminSummary(Request $request)
    {
        $actor = $request->user();
        abort_unless($actor, 403);

        return $this->success($this->dashboardService->getAdminSummary($actor));
    }

    public function adminStatistics(Request $request)
    {
        $actor = $request->user();
        abort_unless($actor, 403);
        $report = $request->query('report');
        abort_unless(is_string($report) && in_array($report, [
            'learning-outcomes',
            'exams',
            'classes',
            'questions',
        ], true), 404);

        $filters = $request->validate([
            'period_type' => ['sometimes', 'string', 'in:month,quarter,year,custom'],
            'period_value' => ['sometimes', 'nullable', 'string', 'max:16'],
            'start_date' => ['required_if:period_type,custom', 'nullable', 'date_format:Y-m-d'],
            'end_date' => [
                'required_if:period_type,custom',
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:start_date',
            ],
        ]);
        $now = Carbon::now();
        $periodType = $filters['period_type'] ?? 'month';
        $periodValue = $filters['period_value'] ?? match ($periodType) {
            'quarter' => $now->format('Y') . '-Q' . $now->quarter,
            'year' => $now->format('Y'),
            'custom' => '',
            default => $now->format('Y-m'),
        };

        return $this->success($this->dashboardService->getAdminStatistics(
            $actor,
            $report,
            $periodType,
            $periodValue,
            $filters['start_date'] ?? null,
            $filters['end_date'] ?? null
        ));
    }
}

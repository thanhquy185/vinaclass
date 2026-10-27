<?php

namespace App\Console\Commands;

use App\Services\IdentityV2\IdentityV2CutoverReadinessService;
use Illuminate\Console\Command;

class CheckIdentityV2Cutover extends Command
{
    protected $signature = 'app:check-identity-v2-cutover';

    protected $description = 'Check identity v2 cutover prerequisites without changing data';

    public function handle(IdentityV2CutoverReadinessService $readinessService): int
    {
        $report = $readinessService->inspect();
        $rows = array_map(fn (array $check): array => [
            $check['name'],
            $check['passed'] ? 'PASS' : 'BLOCKED',
            $check['affected'],
            implode(', ', $check['examples']),
            $check['details'],
        ], $report['checks']);

        $this->table(['Check', 'Status', 'Affected', 'Example IDs or fields', 'Details'], $rows);

        if (!$report['ready']) {
            $this->error('Identity v2 cutover is blocked. Resolve the listed issues and run the check again.');
            return self::FAILURE;
        }

        $this->info('Identity v2 cutover prerequisites are satisfied. This command did not modify data.');
        return self::SUCCESS;
    }
}

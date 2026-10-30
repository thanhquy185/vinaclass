<?php

namespace App\Console;

use App\Models\AuthOtp;
use App\Models\AuthSession;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->call(function () {
            AuthOtp::query()
                ->where('expires_at', '<', now()->subDays(30))
                ->delete();

            AuthSession::query()
                ->where(function ($query) {
                    $query->where('expires_at', '<', now()->subDays(90))
                        ->orWhere('revoked_at', '<', now()->subDays(90));
                })
                ->delete();
        })->daily();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

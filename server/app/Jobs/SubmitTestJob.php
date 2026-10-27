<?php

namespace App\Jobs;

use App\Services\ExamAttemptService;
use App\Models\ExamAttempt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SubmitTestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */

    public $tries = 3; // Maximum number of retry attempts.
    public $backoff = 10; // retry sau 10s
    public $timeout = 30;


    protected $baiLamId;
    public function __construct(int $baiLamId)
    {
        $this->baiLamId = $baiLamId;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle(ExamAttemptService $examAttemptService)
    {
        $attempt = ExamAttempt::find($this->baiLamId);
        if (!$attempt || $attempt->status === 'SUBMITTED') {
            return;
        }

        try {
            $examAttemptService->submitExpiredTest($this->baiLamId);
        } catch (HttpException $exception) {
            if ($exception->getStatusCode() !== 409) {
                throw $exception;
            }
        }
        Log::info("submit bài id: $this->baiLamId");
    }
}

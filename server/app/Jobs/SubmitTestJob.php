<?php

namespace App\Jobs;

use App\Services\BaiLamService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SubmitTestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */

    public $tries = 3; // số lần retry
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
    public function handle(BaiLamService $baiLamService)
    {
        $baiLamService->submittest(["answers"=> []], $this->baiLamId);
        Log::info("submit bài id: $this->baiLamId");
    }
}

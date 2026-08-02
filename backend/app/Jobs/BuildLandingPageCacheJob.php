<?php

namespace App\Jobs;

use App\Models\LandingPage;
use App\Services\LandingPageRendererService;
use App\Support\LandingPageCacheKey;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class BuildLandingPageCacheJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 30;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public array $backoff = [5, 15, 30];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $landingPageId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(LandingPageRendererService $renderer): void
    {
        try {
            $page = LandingPage::with('template')->findOrFail($this->landingPageId);
            
            // Force rebuild via Service
            $renderer->getOrBuildHtml($page, true);
            
        } finally {
            // Always release the rebuilding flag to prevent Queue Storm lock-in
            Cache::forget(LandingPageCacheKey::rebuilding($this->landingPageId));
        }
    }
}

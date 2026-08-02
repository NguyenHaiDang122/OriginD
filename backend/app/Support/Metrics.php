<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;

class Metrics
{
    /**
     * Increment a metric counter.
     */
    public static function increment(string $key, int $value = 1): void
    {
        // Placeholder for Prometheus/OpenTelemetry implementation
        Log::info("Metric_Incr: {$key} (+{$value})");
    }

    /**
     * Record a histogram/timing metric.
     */
    public static function histogram(string $key, float|int $value): void
    {
        // Placeholder for Prometheus/OpenTelemetry implementation
        Log::info("Metric_Hist: {$key} = {$value}");
    }
}

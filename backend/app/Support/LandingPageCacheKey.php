<?php

namespace App\Support;

class LandingPageCacheKey
{
    /**
     * Get the cache version from config, default to v1.
     */
    public static function version(): string
    {
        return config('landing_page.cache_version', 'v1');
    }

    public static function fresh(int $id): string
    {
        return "landing_page:" . self::version() . ":{$id}:html";
    }

    public static function stale(int $id): string
    {
        return self::fresh($id) . ":stale";
    }

    public static function lock(int $id): string
    {
        return self::fresh($id) . ":lock";
    }

    public static function rebuilding(int $id): string
    {
        return "landing_page_rebuilding:{$id}";
    }
}

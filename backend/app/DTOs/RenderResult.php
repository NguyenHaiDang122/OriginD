<?php

namespace App\DTOs;

class RenderResult
{
    public function __construct(
        public string $html,
        public bool $isStale = false,
        public bool $fromCache = false,
        public bool $rebuilt = false
    ) {
    }
}

<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        Plan::updateOrCreate(
            ['slug' => 'free'],
            [
                'name' => 'Free',
                'price' => 0,
                'landing_page_limit' => 1,
                'custom_domain' => false,
                'premium_templates' => false,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'basic'],
            [
                'name' => 'Basic',
                'price' => 199000,
                'landing_page_limit' => 10,
                'custom_domain' => true,
                'premium_templates' => false,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'pro'],
            [
                'name' => 'Pro',
                'price' => 499000,
                'landing_page_limit' => 999999,
                'custom_domain' => true,
                'premium_templates' => true,
            ]
        );
    }
}
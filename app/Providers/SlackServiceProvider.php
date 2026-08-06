<?php

namespace App\Providers;

use App\Services\SlackNotificationService;
use Illuminate\Support\ServiceProvider;

class SlackServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(SlackNotificationService::class, function () {
            return new SlackNotificationService(
                webhookUrl: config('services.slack.webhook_url', ''),
                appUrl: config('app.url'),
            );
        });
    }
}

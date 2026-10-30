<?php

declare(strict_types=1);

namespace App\Providers;

use Aws\Textract\TextractClient;
use Illuminate\Support\ServiceProvider;

class TextractServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(TextractClient::class, function () {
            return new TextractClient([
                'version' => 'latest',
                'region'  => config('services.aws.region', 'ap-northeast-1'),
            ]);
        });
    }
}

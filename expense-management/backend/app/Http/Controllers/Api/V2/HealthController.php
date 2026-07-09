<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Api\HealthController as V1HealthController;

/**
 * V2 health controller — delegates to V1 implementation.
 * Exists to keep the namespace clean for future V2-specific changes.
 */
class HealthController extends V1HealthController
{
}

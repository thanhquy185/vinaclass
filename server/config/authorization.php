<?php

$driver = strtolower(trim((string) env('AUTHORIZATION_DRIVER', 'legacy')));

if (!in_array($driver, ['legacy', 'v2'], true)) {
    throw new InvalidArgumentException(
        'AUTHORIZATION_DRIVER must be either "legacy" or "v2".'
    );
}

return [
    // Keep legacy authorization active until the v2 schema is migrated and backfilled.
    'driver' => $driver,
    'schema_v2_enabled' => env('AUTHORIZATION_SCHEMA_V2_ENABLED', false),
];

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthSession extends Model
{
    protected $fillable = [
        'session_id',
        'user_id',
        'refresh_token_hash',
        'expires_at',
        'last_used_at',
        'revoked_at',
        'replaced_by_id',
        'device_name',
        'user_agent',
        'ip_address',
    ];

    protected $hidden = [
        'refresh_token_hash',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

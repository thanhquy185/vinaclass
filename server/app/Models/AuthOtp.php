<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuthOtp extends Model
{
    protected $fillable = [
        'public_id',
        'user_id',
        'email',
        'email_hash',
        'purpose',
        'code_hash',
        'verification_token_hash',
        'attempts',
        'expires_at',
        'resend_available_at',
        'verified_at',
        'consumed_at',
    ];

    protected $hidden = [
        'code_hash',
    ];

    protected $casts = [
        'attempts' => 'integer',
        'expires_at' => 'datetime',
        'resend_available_at' => 'datetime',
        'verified_at' => 'datetime',
        'consumed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'date_of_birth',
        'is_female',
        'avatar_url',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'is_female' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

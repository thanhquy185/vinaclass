<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Difficulty extends Model
{
    use HasFactory;

    protected $fillable = ['difficulty_name'];

    public function questions()
    {
        return $this->hasMany(Question::class, 'difficulty_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'password',
        'role_id',
        'phone',
        'username',
        'date_of_birth',
        'is_female',
        'is_student',
        'is_locked',
        'ggid',
        'avatar_url',
        'is_deleted',
    ];

    protected $attributes = [
        'avatar_url' => 'example.png',
        'is_student' => true,
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        // 'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'is_female' => 'boolean',
        'is_student' => 'boolean',
        'is_locked' => 'boolean',
        'is_deleted' => 'boolean',
        'last_login' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn($value) => Hash::make($value),
        );
    }

    public function courseGroups()
    {
        return $this->belongsToMany(CourseGroup::class, 'course_group_students', 'student_id', 'course_group_id');
    }

    public function managedCourseGroups()
    {
        return $this->hasMany(CourseGroup::class, 'teacher_id');
    }

    public function assignedSubjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects', 'teacher_id', 'subject_id');
    }

    public function examAttempts()
    {
        return $this->hasMany(ExamAttempt::class, 'student_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}

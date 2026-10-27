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
        'email',
        'password',
        'role_id',
        'username',
        'is_locked',
        'ggid',
        'is_deleted',
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

    public function subjects()
    {
        return $this->assignedSubjects();
    }

    public function examAttempts()
    {
        return $this->hasMany(ExamAttempt::class, 'student_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function roleCode(): ?string
    {
        $role = $this->role;
        if ($role !== null) {
            return $role->is_deleted ? null : $role->canonicalCode();
        }

        return $this->role_id === null && $this->hasLegacyStudentMarker()
            ? 'STUDENT'
            : null;
    }

    public function hasRoleCode(string ...$roleCodes): bool
    {
        $roleCode = $this->roleCode();

        return $roleCode !== null && in_array($roleCode, $roleCodes, true);
    }

    public function isCustomRole(): bool
    {
        $role = $this->role;

        return $role !== null
            && !$role->is_deleted
            && !in_array($role->canonicalCode(), ['ADMIN', 'TEACHER', 'STUDENT'], true);
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class, 'user_id');
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class, 'user_id');
    }

    public function permissionDetails()
    {
        return $this->hasMany(PermissionDetail::class, 'user_id');
    }

    private function hasLegacyStudentMarker(): bool
    {
        // Compatibility for accounts on the pre-cutover schema only.
        return array_key_exists('is_student', $this->attributes)
            && (bool) $this->attributes['is_student'];
    }
}

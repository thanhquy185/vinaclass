<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        "role_name",
        "code",
    ];

    protected $hidden = [];

    protected $casts = [];

    public function roleDetails()
    {
        return $this->hasMany(RoleDetail::class, 'role_id');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public function canonicalCode(): ?string
    {
        $fallback = null;

        foreach ([$this->code, $this->role_name] as $candidate) {
            $candidate = trim((string) $candidate);
            if ($candidate === '') {
                continue;
            }

            $normalized = Str::slug(Str::ascii($candidate), '_');
            $canonical = match ($normalized) {
                'admin', 'administrator', 'quan_tri_vien', 'quan_tri' => 'ADMIN',
                'teacher', 'giang_vien', 'giao_vien' => 'TEACHER',
                'student', 'sinh_vien', 'hoc_sinh' => 'STUDENT',
                default => null,
            };

            if ($canonical !== null) {
                return $canonical;
            }

            $fallback ??= strtoupper($candidate);
        }

        return $fallback;
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'role_permissions')
            ->withTimestamps();
    }
}

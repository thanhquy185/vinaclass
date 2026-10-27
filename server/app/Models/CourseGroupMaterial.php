<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseGroupMaterial extends Model
{
    protected $fillable = [
        'course_group_id',
        'creator_id',
        'title',
        'description',
        'storage_disk',
        'storage_path',
        'original_file_name',
        'mime_type',
        'file_size',
        'is_deleted',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_deleted' => 'boolean',
    ];

    public function courseGroup()
    {
        return $this->belongsTo(CourseGroup::class, 'course_group_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}

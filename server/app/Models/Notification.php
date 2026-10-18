<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        "title",
        "content",
        "sender_id",
        "sent_at",
        "priority",
        "status"
    ];

    protected $hidden = [];

    protected $casts = [
        "sent_at" => "datetime",
        "status" => "boolean"
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function courseGroups()
    {
        return $this->belongsToMany(CourseGroup::class, 'course_group_notifications', 'notification_id', 'course_group_id');
    }

    public function courseGroupNotifications()
    {
        return $this->hasMany(CourseGroupNotification::class, 'notification_id');
    }
}

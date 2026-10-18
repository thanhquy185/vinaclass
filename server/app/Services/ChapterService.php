<?php

namespace App\Services;

use App\Models\Chapter;
use App\Models\Subject;
use Illuminate\Support\Facades\DB;

class ChapterService
{
    public function create(array $data): Chapter
    {
        return Chapter::create($data);
    }

    public function update(Subject $subject, array $data): Subject
    {
        return DB::transaction(function () use ($subject, $data) {
            // Xóa danh sách chương cũ của môn học
            $subject->chapters()->delete();

            // Gán subject_id cho từng chương mới
            $chapters = collect($data['chapters'] ?? [])->map(function ($item) use ($subject) {
                $item['subject_id'] = $subject->id;
                return $item;
            })->toArray();

            if (!empty($chapters)) {
                $subject->chapters()->insert($chapters);
            }

            // Trả về model Subject cùng với danh sách chapters đã cập nhật
            return $subject->load('chapters');
        });
    }

    public function getBySubject(Subject $subject)
    {
        return $subject->chapters;
    }
}

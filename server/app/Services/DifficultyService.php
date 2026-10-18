<?php

namespace App\Services;

use App\Models\Difficulty;
use Illuminate\Validation\ValidationException;

class DifficultyService
{
    public function getAll()
    {
        return Difficulty::all();
    }

    public function getOne(Difficulty $difficulty): Difficulty
    {
        return $difficulty;
    }

    public function create(array $data): Difficulty
    {
        $this->validateBusiness($data);
        return Difficulty::create($data);
    }

    public function update(Difficulty $difficulty, array $data): Difficulty
    {
        $this->validateBusiness($data);
        $difficulty->update($data);
        return $difficulty;
    }

    public function delete(Difficulty $difficulty): bool
    {
        // Kiểm tra xem độ khó đã có câu hỏi liên quan chưa
        if ($difficulty->questions()->exists()) {
            throw ValidationException::withMessages([
                'difficulty' => ['This difficulty is currently in use and cannot be deleted.'],
            ]);
        }

        return (bool) $difficulty->delete();
    }

    private function validateBusiness(array $data): void
    {
        //
    }
}

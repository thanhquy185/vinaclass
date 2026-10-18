<?php

namespace App\Services;
use App\Models\AnswerOption;

class AnswerOptionService{
    public function getAll()
    {
        return AnswerOption::all();
    }

    public function getOne(AnswerOption $answerOption)
    {
        return $answerOption;
    }

    public function add(array $data)
    {
        return AnswerOption::create($data);
    }

    public function update(array $data, AnswerOption $answerOption)
    {
        $answerOption->update($data);
        return $answerOption;
    }

    public function delete(AnswerOption $answerOption)
    {
        return $answerOption->delete();
    }
}
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//thêm các dữ liệu bắt buộc có sẵn trong hệ thống
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // \App\Models\User::factory(10)->create();
        $this->call([
            RoleSeeder::class,
            FunctionSeeder::class,
            RoleDetailSeeder::class,
            UserSeeder::class,
            SubjectSeeder::class,
            ChapterSeeder::class,
            DifficultySeeder::class,
            CourseGroupSeeder::class,
            CourseGroupStudentSeeder::class,
            ExamSeeder::class,
            ExamConfigurationSeeder::class,
            ExamAssignmentSeeder::class,
            NotificationSeeder::class,
            CourseGroupNotificationSeeder::class,
            ExamAttemptSeeder::class,
            QuestionSeeder::class,
            AnswerOptionSeeder::class,
            ExamAttemptAnswerSeeder::class,
            ExamQuestionSeeder::class,
            ExamAttemptLogSeeder::class,
            TeacherSubjectSeeder::class,
        ]);
    }
}

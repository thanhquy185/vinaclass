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
        if (app()->environment('production')) {
            // Production receives reference data only; all account and course fixtures are demo data.
            $this->call([
                RoleSeeder::class,
                FunctionSeeder::class,
                RoleDetailSeeder::class,
                IdentityV2CatalogSeeder::class,
                DifficultySeeder::class,
            ]);
            return;
        }

        // \App\Models\User::factory(10)->create();
        $this->call([
            RoleSeeder::class,
            FunctionSeeder::class,
            RoleDetailSeeder::class,
            IdentityV2CatalogSeeder::class,
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

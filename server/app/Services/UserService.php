<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function getAll()
    {
        return User::all();
    }
    public function getOne(User $user)
    {
        return $user;
    }

    public function add(array $data)
    {
        return User::create($data);
    }

    public function update(array $data, User $user)
    {
        $user->update($data);
        return $user;
    }

    public function delete(User $user)
    {
        return $user->delete();
    }

    public function changePassword(array $data, User $user)
    {
        $currentPassword = $data["current_password"];
        $newPassword = $data["new_password"];

        $userPassword = $user->password;
        //validate
        if (!Hash::check($currentPassword, $userPassword)) {
            throw ValidationException::withMessages([
                'current_password' => ['The old password does not match'],
            ]);
        }
        //update
        $dataUpdate = [
            "password" => $newPassword, //tự hash trong modal rồi
        ];

        return $user->update($dataUpdate);
    }

    public function resetPassword(array $data, User $user): bool
    {
        $dataUpdate = [
            "password" => $data["new_password"], // tự hash trong model rồi (đồng bộ key sang snake_case)
        ];

        return $user->update($dataUpdate);
    }

    public function getTeachers()
    {
        $users = User::where('is_student', false)
            ->where('username', '!=', 'Admin')
            ->get();

        return $users;
    }
}

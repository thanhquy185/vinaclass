<?php
namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponseTrait
{
    protected array $messages = [
        200 => 'Thành công',
        201 => 'Tạo thành công',
        400 => 'Có lỗi xảy ra',
        401 => 'Chưa xác thực người dùng',
        403 => 'Không có quyền truy cập',
        404 => 'Không tìm thấy',
        422 => 'Dữ liệu không hợp lệ',
        429 => 'Quá nhiều yêu cầu trong thời gian ngắn',
        500 => 'Lỗi hệ thống',
    ];

    protected function success($data = null, ?string $message = null, int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'code'    => $code,
            'message' => $message ?? $this->messages[$code],
            'data'    => $data,
        ], $code);
    }

    protected function error($errors = null, ?string $message = null, int $code = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'code'    => $code,
            'message' => $message ?? $this->messages[$code],
            'errors'  => $errors,
        ], $code);
    }

    protected function created($data = null, ?string $message = null): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function updated($data = null, ?string $message = null): JsonResponse
    {
        return $this->success($data, $message ?: "Cập nhật đối tượng thành công", 200);
    }

    protected function deleted(?string $message = null): JsonResponse
    {
        return $this->success(null, $message ?: "Xóa đối tượng thành công", 200);
    }

    protected function unauthorized(?string $message = null): JsonResponse
    {
        return $this->error(null, $message, 401);
    }

    protected function forbidden(?string $message = null): JsonResponse
    {
        return $this->error(null, $message, 403);
    }

    protected function notFound(?string $message = null): JsonResponse
    {
        return $this->error(null, $message, 404);
    }

    protected function validation($errors, ?string $message = null): JsonResponse
    {
        return $this->error($errors, $message, 422);
    }

    protected function throttleRequest(?string $message = null): JsonResponse
    {
        return $this->error(null, $message, 429);
    }

    protected function serverError(?string $message = null): JsonResponse
    {
        return $this->error(null, $message, 500);
    }
}

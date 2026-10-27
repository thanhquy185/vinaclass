<?php
namespace App\Exceptions;

use App\Traits\ApiResponseTrait;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponseTrait;

    /**
     * Prevent common exceptions from being reported.
     * @var array
     */
    protected $dontReport = [
        ValidationException::class,
        AuthenticationException::class,
        AuthorizationException::class,
        ModelNotFoundException::class,
        NotFoundHttpException::class,
        ThrottleRequestsException::class,
        BusinessException::class,
        NotFoundException::class,
    ];

    /**
     * Prevent Laravel from flashing sensitive fields back to the session.
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Configure exception reporting and rendering.
     * $this->reportable(): configure system log reporting.
     * $this->renderable(): configure the client response.
     * @return void
     */
    public function register(): void
    {
        $this->reportable(function (QueryException $e) {
            Log::error("DATABASE ERROR: " . $e->getMessage(), [
                'sql'      => $e->getSql(),
                'bindings' => $e->getBindings(),
            ]);
        });

        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return $this->handleApiException($e);
            }
        });
    }

    /**
     * Utility method for registration.
     * @param Throwable $e
     * @return \Illuminate\Http\JsonResponse
     */
    private function handleApiException(Throwable $e)
    {
        $msg = $e->getMessage();

        if ($e instanceof NotFoundException) {
            return response()->json([
                'success' => false,
                'code' => 404,
                'message' => $msg,
                'errors' => $e->getErrors(),
            ], 404);
        }

        return match (true) {
            $e instanceof ValidationException       => $this->validation($e->errors(), 'Dữ liệu không hợp lệ'),

            $e instanceof AuthenticationException   => $this->unauthorized(),

            $e instanceof AuthorizationException    => $this->forbidden("Bạn chưa đủ quyền thực hiện hành động này"),

            $e instanceof ThrottleRequestsException => $this->throttleRequest(),

            $e instanceof BusinessException         => $this->error(null, $msg, 400),

            $e instanceof ModelNotFoundException    => $this->notFound(
                class_basename($e->getModel()) . " không tìm thấy"
            ),

            $e instanceof NotFoundHttpException     => $this->notFound("Đường dẫn không tồn tại"),

            $e instanceof HttpException             => $this->error(null, $msg, $e->getStatusCode()),

            $e instanceof QueryException            => $this->error(
                config('app.debug') ? "Lỗi database: " . $msg : null
            ),

            default                                 => $this->serverError(
                config('app.debug') ? $msg : null)
        };
    }
}

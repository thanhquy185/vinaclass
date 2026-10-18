<?php
namespace App\Exceptions;

use App\Traits\ApiResponseTrait;
use Exception;

class BusinessException extends Exception
{
    use ApiResponseTrait;

    protected $code = 400;

    /**
     * @param string $message Thông báo lỗi
     * @param int $code HTTP status code (mặc định 400)
     */
    public function __construct(string $message = 'Business logic error', int $code = 400)
    {
        parent::__construct($message, $code);
    }

    /**
     * Render exception thành JSON response
     * Method này sẽ được gọi tự động bởi Laravel
     */
    public function render()
    {
        return $this->error(null, $this->message, $this->code);
    }

}

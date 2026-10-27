<?php
namespace App\Exceptions;

use App\Traits\ApiResponseTrait;
use Exception;

class BusinessException extends Exception
{
    use ApiResponseTrait;

    protected $code = 400;

    /**
     * @param string $message Error message.
     * @param int $code HTTP status code (defaults to 400).
     */
    public function __construct(string $message = 'Business logic error', int $code = 400)
    {
        parent::__construct($message, $code);
    }

    /**
     * Render the exception as a JSON response.
     * Laravel calls this method automatically.
     */
    public function render()
    {
        return $this->error(null, $this->message, $this->code);
    }

}

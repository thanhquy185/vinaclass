<?php

namespace App\Exceptions;

use Exception;

class NotFoundException extends Exception
{
    private ?string $errorCode;

    private $errors;

    public function __construct(string $message = 'Không tìm thấy dữ liệu', $errors = null)
    {
        parent::__construct($message, 404);
        $this->errors = $errors;
    }

    public function getErrors()
    {
        return $this->errors;
    }
}

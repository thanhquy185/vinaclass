<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ConvertCaseMiddleware
{
    /**
     * Convert incoming camelCase keys to snake_case and outgoing JSON keys
     * to camelCase.
     *
     * @param  \Closure(\Illuminate\Http\Request): mixed  $next
     */
    public function handle(Request $request, Closure $next)
    {
        $input = $request->isJson() ? $request->json() : $request->request;
        $input->replace($this->convertKeys($input->all(), 'snake'));
        $request->query->replace($this->convertKeys($request->query->all(), 'snake'));

        $response = $next($request);

        if ($request->is('docs/api.json')) {
            return $response;
        }

        $contentType = $response instanceof Response
            ? $response->headers->get('Content-Type', '')
            : '';

        if (Str::contains(strtolower($contentType), ['/json', '+json'])) {
            $content = $response->getContent();

            if (is_string($content) && $content !== '') {
                $data = json_decode($content, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $response->setContent(json_encode(
                        $this->convertKeys($data, 'camel'),
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
                    ));
                }
            }
        }

        return $response;
    }

    /**
     * Recursively convert associative array keys while preserving list indexes.
     *
     * @param  mixed  $value
     * @return mixed
     */
    private function convertKeys($value, string $case)
    {
        if (! is_array($value)) {
            return $value;
        }

        $converted = [];

        foreach ($value as $key => $nestedValue) {
            $convertedKey = is_string($key)
                ? ($case === 'snake' ? Str::snake($key) : Str::camel($key))
                : $key;

            $converted[$convertedKey] = $this->convertKeys($nestedValue, $case);
        }

        return $converted;
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'required',
                'string',
                'max:255',
                'unique:templates,slug',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'thumbnail' => [
                'nullable',
                'image',
                'max:4096',
            ],

            'version' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                'in:draft,published,archived',
            ],

            'renewal_price' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'zip_file' => [
                'required',
                'file',
                'max:51200', // 50MB
                function ($attribute, $value, $fail) {
                    if (!$value instanceof \Illuminate\Http\UploadedFile) {
                        return;
                    }
                    $ext = strtolower($value->getClientOriginalExtension());
                    if (!in_array($ext, ['zip', 'html', 'htm'])) {
                        $fail('File tải lên phải là file nén (.zip) hoặc file giao diện HTML (.html, .htm).');
                    }
                },
            ],
        ];
    }
}
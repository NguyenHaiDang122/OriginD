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

            'zip_file' => [
                'required',
                'file',
                'mimes:zip',
                'max:51200', // 50MB
            ],
        ];
    }
}
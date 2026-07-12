<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $template = $this->route('template');

        return [
            'name' => ['required', 'string', 'max:255'],

            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('templates', 'slug')->ignore($template->id),
            ],

            'description' => ['nullable', 'string'],

            'thumbnail' => ['nullable', 'string'],

            'version' => ['nullable', 'string'],

            'status' => ['nullable', 'in:draft,published,archived'],
        ];
    }
}
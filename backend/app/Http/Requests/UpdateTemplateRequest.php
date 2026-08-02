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

        $thumbnailRule = ['nullable'];
        if ($this->hasFile('thumbnail')) {
            $thumbnailRule[] = 'image';
            $thumbnailRule[] = 'max:4096';
        } else {
            $thumbnailRule[] = 'string';
        }

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],

            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('templates', 'slug')->ignore($template->id),
            ],

            'description' => ['nullable', 'string'],

            'thumbnail' => $thumbnailRule,

            'version' => ['nullable', 'string'],

            'status' => ['nullable', 'in:draft,published,archived'],

            'renewal_price' => ['nullable', 'numeric', 'min:0'],

            'plan_ids' => ['nullable', 'array'],
            'plan_ids.*' => ['integer', 'exists:plans,id'],
        ];
    }
}
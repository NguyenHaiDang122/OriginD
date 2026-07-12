<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTemplateFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => 'required|string|max:255',

            'key' => [
                'required',
                'string',
                Rule::unique('template_fields')
                    ->ignore($this->route('field')),
            ],

            'type' => 'required|in:text,textarea,image,link,number,color,select,checkbox,repeater',

            'default_value' => 'nullable',

            'required' => 'boolean',

            'sort_order' => 'integer|min:0',
        ];
    }
}
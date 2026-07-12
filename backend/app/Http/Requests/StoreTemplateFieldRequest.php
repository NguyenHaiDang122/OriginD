<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => 'required|string|max:255',

            'key' => 'required|string|max:255|unique:template_fields,key',

            'type' => 'required|in:text,textarea,image,link,number,color,select,checkbox,repeater',

            'default_value' => 'nullable',

            'required' => 'boolean',

            'sort_order' => 'integer|min:0',
        ];
    }
}
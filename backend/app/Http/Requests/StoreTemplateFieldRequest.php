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

            // key không unique toàn bảng, chỉ unique theo từng template
            'key' => 'required|string|max:255|unique:template_fields,key,NULL,id,template_id,' . $this->route('template')->id,

            'type' => 'required|in:text,textarea,image,link,number,color,select,checkbox,repeater',

            'default_value' => 'nullable',

            'required' => 'boolean',

            'sort_order' => 'integer|min:0',
        ];
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateField extends Model
{
    protected $fillable = [
        'template_id',
        'label',
        'key',
        'type',
        'default_value',
        'required',
        'sort_order',

        'html_tag',
        'attribute',
        'placeholder',
        'options',
    ];

    protected $casts = [
        'default_value' => 'array',
        'required' => 'boolean',
        'options' => 'array',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
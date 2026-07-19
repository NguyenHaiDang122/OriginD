<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;



class Template extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'thumbnail',
        'version',
        'status',
        'renewal_price',
        'template_path',   // thêm dòng này
        'created_by',
        'is_featured',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(TemplateField::class)
            ->orderBy('sort_order');
    }
    public function landingPages(): HasMany
    {
        return $this->hasMany(LandingPage::class);
    }
}
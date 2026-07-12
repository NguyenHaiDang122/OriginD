<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTemplateFieldRequest;
use App\Http\Requests\UpdateTemplateFieldRequest;
use App\Http\Resources\TemplateFieldResource;
use App\Models\Template;
use App\Models\TemplateField;

class TemplateFieldController extends Controller
{
    public function index(Template $template)
    {
        return TemplateFieldResource::collection(
            $template->fields
        );
    }
    public function store(
        StoreTemplateFieldRequest $request,
        Template $template
    )
    {
        $field = $template->fields()->create(
            $request->validated()
        );

        return new TemplateFieldResource($field);
    }
    public function update(
        UpdateTemplateFieldRequest $request,
        TemplateField $field
    )
    {
        $field->update(
            $request->validated()
        );

        return new TemplateFieldResource($field);
    }
    public function destroy(TemplateField $field)
    {
        $field->delete();

        return response()->json([
            'message' => 'Xóa field thành công.'
        ]);
    }
}
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTemplateRequest;
use App\Http\Resources\TemplateResource;
use App\Services\TemplateService;
use App\Models\Template;
use App\Http\Requests\UpdateTemplateRequest;
class TemplateController extends Controller
{
    public function __construct(
        protected TemplateService $templateService
    ) {}

    public function store(StoreTemplateRequest $request)
    {
        $template = $this->templateService->store($request);

        return new TemplateResource($template);
    }
    public function show(Template $template)
    {
        return new TemplateResource(
            $this->templateService->show($template)
        );
    }
    public function update(UpdateTemplateRequest $request, Template $template)
    {
        $template = $this->templateService->update(
            $template,
            $request->validated()
        );

        return new TemplateResource($template);
    }
    public function destroy(Template $template)
    {
        $this->templateService->delete($template);

        return response()->json([
            'message' => 'Xóa template thành công.'
        ]);
    }
}
<?php

namespace App\Services;

use App\Models\Template;
use App\Models\TemplateField;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class TemplateService
{
    public function __construct(
        protected TemplateScannerService $scanner
    ) {}

    public function store(Request $request): Template
    {
        return DB::transaction(function () use ($request) {

            /*
            |--------------------------------------------------------------------------
            | Upload & giải nén ZIP
            |--------------------------------------------------------------------------
            */

            $upload = $this->uploadZip(
                $request->file('zip_file')
            );

            /*
            |--------------------------------------------------------------------------
            | Tìm file index.html
            |--------------------------------------------------------------------------
            */

            $htmlPath = $this->findIndexHtml(
                $upload['path']
            );

            /*
            |--------------------------------------------------------------------------
            | Scan HTML lấy danh sách field
            |--------------------------------------------------------------------------
            */

            $fields = $this->scanner->scan($htmlPath);

            /*
            |--------------------------------------------------------------------------
            | Upload thumbnail (nếu có)
            |--------------------------------------------------------------------------
            */

            $thumbnail = null;

            if ($request->hasFile('thumbnail')) {
                $thumbnail = $request
                    ->file('thumbnail')
                    ->store('thumbnails', 'public');
            } elseif ($request->has('thumbnail') && is_string($request->thumbnail)) {
                $thumbnail = $request->thumbnail;
            }

            /*
            |--------------------------------------------------------------------------
            | Tạo Template
            |--------------------------------------------------------------------------
            */

            $template = Template::create([

                'name' => $request->name,

                'slug' => $request->slug,

                'description' => $request->description,

                'thumbnail' => $thumbnail,

                'template_path' => "templates/{$upload['folder']}",

                'version' => $request->version ?? '1.0.0',

                'status' => $request->status ?? 'draft',

                'renewal_price' => $request->has('renewal_price') && $request->renewal_price !== null ? (int) $request->renewal_price : 50000,

                'is_featured' => $request->has('is_featured') ? filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN) : false,

                'created_by' => Auth::id(),

            ]);

            /*
            |--------------------------------------------------------------------------
            | Tự động tạo TemplateField
            |--------------------------------------------------------------------------
            */

            foreach ($fields as $field) {

                TemplateField::create([

                    'template_id' => $template->id,

                    'label' => $field['label'],

                    'key' => $field['key'],

                    'type' => $field['type'],

                    'default_value' => $field['default_value']
                        ? [$field['default_value']]
                        : null,

                    'required' => $field['required'],

                    'sort_order' => $field['sort_order'] ?? 0,

                    'html_tag' => $field['html_tag'],

                    'attribute' => $field['attribute'],

                    'placeholder' => $field['placeholder'],

                    'options' => $field['options'],

                ]);
            }

            if ($request->has('plan_ids')) {
                $template->plans()->sync($request->plan_ids);
            }

            return $template->load('fields', 'plans');
        });
    }

    public function show(Template $template)
    {
        return $template->load('fields', 'plans');
    }

    public function update(Template $template, Request|array $input): Template
    {
        $updateData = [];
        $data = $input instanceof Request ? $input->all() : $input;

        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['slug'])) $updateData['slug'] = $data['slug'];
        if (array_key_exists('description', $data)) $updateData['description'] = $data['description'];
        if (isset($data['version'])) $updateData['version'] = $data['version'];
        if (isset($data['status'])) $updateData['status'] = $data['status'];
        if (isset($data['renewal_price'])) $updateData['renewal_price'] = (int) $data['renewal_price'];
        if (array_key_exists('is_featured', $data)) $updateData['is_featured'] = filter_var($data['is_featured'], FILTER_VALIDATE_BOOLEAN);

        if ($input instanceof Request && $input->hasFile('thumbnail')) {
            if ($template->thumbnail && !str_starts_with($template->thumbnail, 'http') && Storage::disk('public')->exists($template->thumbnail)) {
                Storage::disk('public')->delete($template->thumbnail);
            }
            $updateData['thumbnail'] = $input->file('thumbnail')->store('thumbnails', 'public');
        } elseif (isset($data['thumbnail']) && is_string($data['thumbnail'])) {
            $updateData['thumbnail'] = $data['thumbnail'];
        } elseif (array_key_exists('thumbnail', $data) && is_null($data['thumbnail'])) {
            $updateData['thumbnail'] = null;
        }

        $template->update($updateData);

        if ($input instanceof Request && $input->has('plan_ids')) {
            $template->plans()->sync($input->input('plan_ids'));
        } elseif (is_array($input) && array_key_exists('plan_ids', $input)) {
            $template->plans()->sync($input['plan_ids']);
        }

        return $template->fresh()->load('fields', 'plans');
    }

    public function delete(Template $template): void
    {
        if (
            $template->template_path &&
            Storage::disk('public')->exists($template->template_path)
        ) {
            Storage::disk('public')->deleteDirectory(
                $template->template_path
            );
        }

        $template->delete();
    }

    private function uploadZip(UploadedFile $zip): array
    {
        $folder = uniqid('template_');

        Storage::disk('public')
            ->makeDirectory("templates/$folder");

        $extractPath = Storage::disk('public')
            ->path("templates/$folder");

        $ext = strtolower($zip->getClientOriginalExtension());

        if (in_array($ext, ['html', 'htm']) || str_contains(strtolower($zip->getMimeType() ?? ''), 'html')) {
            $htmlPath = Storage::disk('public')
                ->path("templates/$folder/index.html");

            copy(
                $zip->getRealPath(),
                $htmlPath
            );
        } else {
            $zipPath = Storage::disk('public')
                ->path("templates/$folder/template.zip");

            copy(
                $zip->getRealPath(),
                $zipPath
            );

            $zipArchive = new ZipArchive();

            if ($zipArchive->open($zipPath) !== true) {
                throw new \Exception(
                    'Không thể mở hoặc giải nén file ZIP.'
                );
            }

            $zipArchive->extractTo($extractPath);

            $zipArchive->close();
        }

        return [

            'folder' => $folder,

            'path' => $extractPath,

        ];
    }

    private function findIndexHtml(string $path): string
    {
        $files = File::allFiles($path);

        foreach ($files as $file) {

            if (
                strtolower($file->getFilename()) === 'index.html'
            ) {
                return $file->getRealPath();
            }
        }

        throw new \Exception(
            'Không tìm thấy file index.html.'
        );
    }
}
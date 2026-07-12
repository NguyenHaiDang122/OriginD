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

            return $template->load('fields');
        });
    }

    public function show(Template $template)
    {
        return $template->load('fields');
    }

    public function update(Template $template, array $data): Template
    {
        $template->update([

            'name' => $data['name'],

            'slug' => $data['slug'],

            'description' => $data['description'] ?? null,

            'thumbnail' => $data['thumbnail'] ?? $template->thumbnail,

            'version' => $data['version'] ?? '1.0.0',

            'status' => $data['status'] ?? 'draft',

        ]);

        return $template->fresh()->load('fields');
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

        $zipPath = Storage::disk('public')
            ->path("templates/$folder/template.zip");

        copy(
            $zip->getRealPath(),
            $zipPath
        );

        $extractPath = Storage::disk('public')
            ->path("templates/$folder");

        $zipArchive = new ZipArchive();

        if ($zipArchive->open($zipPath) !== true) {
            throw new \Exception(
                'Không thể mở file ZIP.'
            );
        }

        $zipArchive->extractTo($extractPath);

        $zipArchive->close();

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
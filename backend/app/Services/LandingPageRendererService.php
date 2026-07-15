<?php

namespace App\Services;

use App\Models\LandingPage;
use App\Models\Template;
use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\File;

class LandingPageRendererService
{

    public function render(LandingPage $page)
    {
        return $this->renderPreview($page->template, $page->data ?? []);
    }

    public function renderPreview(Template $template, array $data)
    {

        $basePath = storage_path(
            'app/public/'.$template->template_path
        );


        $htmlFile = collect(File::allFiles($basePath))
            ->first(function ($file) {

                return strtolower($file->getFilename()) === 'index.html';

            });


        if (!$htmlFile) {

            throw new \Exception(
                'Không tìm thấy index.html trong template'
            );

        }


        $html = file_get_contents(
            $htmlFile->getRealPath()
        );
        $templateUrl = asset(
            'storage/'.$template->template_path
        );


        $html = str_replace(
            [
                'src="images/',
                'href="css/',
                'src="js/',
                'src="./images/',
                'href="./css/',
                'src="./js/'
            ],
            [
                'src="'.$templateUrl.'/images/',
                'href="'.$templateUrl.'/css/',
                'src="'.$templateUrl.'/js/',
                'src="'.$templateUrl.'/images/',
                'href="'.$templateUrl.'/css/',
                'src="'.$templateUrl.'/js/'
            ],
            $html
        );
        


        $dom = new DOMDocument();


        libxml_use_internal_errors(true);


        $dom->loadHTML(
            mb_convert_encoding(
                $html,
                'HTML-ENTITIES',
                'UTF-8'
            )
        );


        libxml_clear_errors();


        $xpath = new DOMXPath($dom);



        foreach($data as $key=>$value){


            $nodes = $xpath->query(
                "//*[@data-field='$key']"
            );


            foreach ($nodes as $node) {


                if (!$node instanceof \DOMElement) {
                    continue;
                }


                switch (strtolower($node->nodeName)) {


                    case 'img':

                        // Ensure src is a string (value có thể là array/object)
                        $imgValue = (is_array($value) || is_object($value))
                            ? json_encode($value, JSON_UNESCAPED_UNICODE)
                            : (string) ($value ?? '');

                        $imgStr = trim($imgValue);

                        if (
                            str_starts_with($imgStr, 'http://') ||
                            str_starts_with($imgStr, 'https://') ||
                            str_starts_with($imgStr, '//') ||
                            str_starts_with($imgStr, 'data:image/')
                        ) {
                            $node->setAttribute('src', $imgStr);
                        } else {
                            $node->setAttribute(
                                'src',
                                asset('storage/'.$template->template_path.'/'.ltrim($imgStr, '/'))
                            );
                        }

                        break;


                    case 'a':

                        // Ensure href is a string (value có thể là array/object)
                        $aValue = (is_array($value) || is_object($value))
                            ? json_encode($value, JSON_UNESCAPED_UNICODE)
                            : ($value ?? '');

                        $aStr = trim((string) $aValue);

                        if (
                            str_starts_with($aStr, 'http://') ||
                            str_starts_with($aStr, 'https://') ||
                            str_starts_with($aStr, 'mailto:') ||
                            str_starts_with($aStr, 'tel:') ||
                            (str_starts_with($aStr, '#') && !str_contains($aStr, ' '))
                        ) {
                            $node->setAttribute('href', $aStr);
                        } else if ($aStr !== '') {
                            $node->textContent = $aStr;
                        }

                        break;


                    default:

                        // DOMElement::textContent yêu cầu string.
                        // LandingPage->data có thể chứa array/object (tuỳ field type), nên convert an toàn.
                        if ($value === null) {
                            $node->textContent = '';
                        } else if (is_array($value) || is_object($value)) {
                            $node->textContent = json_encode($value, JSON_UNESCAPED_UNICODE);
                        } else {
                            $node->textContent = (string) $value;
                        }

                        break;

                }

            }

        }


        return $dom->saveHTML(
            $dom->documentElement
        );

    }

}
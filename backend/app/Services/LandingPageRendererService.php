<?php

namespace App\Services;

use App\Models\LandingPage;
use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\File;

class LandingPageRendererService
{

    public function render(LandingPage $page)
    {

        $template = $page->template;

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



        foreach($page->data as $key=>$value){


            $nodes = $xpath->query(
                "//*[@data-field='$key']"
            );


            foreach ($nodes as $node) {


                if (!$node instanceof \DOMElement) {
                    continue;
                }


                switch (strtolower($node->nodeName)) {


                    case 'img':

                        $node->setAttribute(
                            'src',
                            asset(
                                'storage/'.$template->template_path.'/'.$value
                            )
                        );

                        break;


                    case 'a':

                        $node->setAttribute(
                            'href',
                            $value
                        );

                        break;


                    default:

                        $node->textContent = $value;

                        break;

                }

            }

        }


        return $dom->saveHTML(
            $dom->documentElement
        );

    }

}
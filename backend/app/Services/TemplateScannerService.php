<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMXPath;

class TemplateScannerService
{
    public function scan(string $htmlPath): array
    {
        $dom = new DOMDocument();

        libxml_use_internal_errors(true);

        $html = file_get_contents($htmlPath);

        // Ensure UTF-8 characters (Vietnamese, etc.) are correctly converted and parsed without Mojibake (TÃªn hiá»n thá»...)
        $dom->loadHTML(
            mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8')
        );

        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $nodes = $xpath->query('//*[@data-field]');

        $fields = [];

        foreach ($nodes as $node) {

            if (! $node instanceof DOMElement) {
                continue;
            }

            $key = $node->getAttribute('data-field');
            
            // Deduplicate by key
            if (isset($fields[$key])) {
                continue;
            }

            $fields[$key] = [

                'key' => $key,

                'label' => $node->getAttribute('data-label')
                    ?: ucfirst(str_replace('.', ' ', $key)),

                'type' => $node->getAttribute('data-type') ?: 'text',

                'required' => $node->getAttribute('data-required') === 'true',

                'placeholder' => $node->getAttribute('data-placeholder') ?: null,

                'html_tag' => strtolower($node->nodeName),

                'attribute' => $this->detectAttribute($node),

                'default_value' => $this->getDefaultValue($node),

                'options' => $node->getAttribute('data-options') ?: null,
            ];
        }

        return array_values($fields);
    }

    private function detectAttribute(DOMElement $node): string
    {
        return match (strtolower($node->nodeName)) {

            'img' => 'src',

            'a' => ($node->getAttribute('href') === '#' || empty($node->getAttribute('href'))) ? 'text' : 'href',

            'input' => 'value',

            'textarea' => 'value',

            default => 'text',
        };
    }

    private function getDefaultValue(DOMElement $node): ?string
    {
        return match (strtolower($node->nodeName)) {

            'img' => $node->getAttribute('src'),

            'a' => ($node->getAttribute('href') === '#' || empty($node->getAttribute('href')))
                ? trim($node->textContent)
                : $node->getAttribute('href'),

            'input' => $node->getAttribute('value'),

            'textarea' => $node->textContent,

            default => trim($node->textContent),
        };
    }
}
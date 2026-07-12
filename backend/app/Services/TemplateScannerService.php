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

        $dom->loadHTMLFile($htmlPath);

        libxml_clear_errors();

        $xpath = new DOMXPath($dom);

        $nodes = $xpath->query('//*[@data-field]');

        $fields = [];

        foreach ($nodes as $node) {

            if (! $node instanceof DOMElement) {
                continue;
            }

            $fields[] = [

                'key' => $node->getAttribute('data-field'),

                'label' => $node->getAttribute('data-label')
                    ?: ucfirst(str_replace('.', ' ', $node->getAttribute('data-field'))),

                'type' => $node->getAttribute('data-type') ?: 'text',

                'required' => $node->getAttribute('data-required') === 'true',

                'placeholder' => $node->getAttribute('data-placeholder') ?: null,

                'html_tag' => strtolower($node->nodeName),

                'attribute' => $this->detectAttribute($node),

                'default_value' => $this->getDefaultValue($node),

                'options' => $node->getAttribute('data-options') ?: null,
            ];
        }

        return $fields;
    }

    private function detectAttribute(DOMElement $node): string
    {
        return match (strtolower($node->nodeName)) {

            'img' => 'src',

            'a' => 'href',

            'input' => 'value',

            'textarea' => 'value',

            default => 'text',
        };
    }

    private function getDefaultValue(DOMElement $node): ?string
    {
        return match (strtolower($node->nodeName)) {

            'img' => $node->getAttribute('src'),

            'a' => $node->getAttribute('href'),

            'input' => $node->getAttribute('value'),

            'textarea' => $node->textContent,

            default => trim($node->textContent),
        };
    }
}
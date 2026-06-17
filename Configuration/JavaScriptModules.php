<?php

return [
    'dependencies' => ['backend'],
    'tags' => ['backend.form'],
    'imports' => [
        '@ask/ask-geopicker/' => 'EXT:ask_geopicker/Resources/Public/JavaScript/',
        'leaflet' => 'EXT:ask_geopicker/Resources/Public/JavaScript/Contrib/leaflet.js',
    ],
];
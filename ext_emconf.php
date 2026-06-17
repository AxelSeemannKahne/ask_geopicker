<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Geopicker',
    'description' => 'Pick lat/long coordinates from leaflet map / openstreetmap',
    'category' => 'be',
    'author' => 'Axel Seemann-Kahne',
    'author_email' => 'info@seemann-kahne.de',
    'state' => 'stable',
    'version' => 'beta',
    'constraints' => [
        'depends' => [
            'typo3' => '13.4.0-13.4.99',
        ],
    ],
];
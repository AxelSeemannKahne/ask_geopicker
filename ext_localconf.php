<?php

declare(strict_types=1);

defined('TYPO3') or die('Access denied.');

$GLOBALS['TYPO3_CONF_VARS']['SYS']['formEngine']['nodeRegistry'][1739000001] = [
    'nodeName' => 'askGeoMapWidget',
    'priority' => 40,
    'class' => \Ask\AskGeopicker\Form\Element\GeoMapWidgetElement::class,
];
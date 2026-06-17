<?php

declare(strict_types=1);

namespace Ask\AskGeopicker\Form\Element;

use TYPO3\CMS\Backend\Form\Element\AbstractFormElement;
use TYPO3\CMS\Core\Page\JavaScriptModuleInstruction;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;
use TYPO3\CMS\Core\View\ViewFactoryData;
use TYPO3\CMS\Core\View\ViewFactoryInterface;

final class GeoMapWidgetElement extends AbstractFormElement
{
    public function __construct(
        private readonly ViewFactoryInterface $viewFactory,
        private readonly PageRenderer $pageRenderer,
    ) {}

    public function render(): array
    {
        $result = $this->initializeResultArray();

        $config = $this->data['parameterArray']['fieldConf']['config'];

        $viewData = [
            'latitudeField' => $config['latitudeField'] ?? 'latitude',
            'longitudeField' => $config['longitudeField'] ?? 'longitude',
            'addressTemplate' => $config['addressTemplate'] ?? null,
            'markerIconBasePath' => PathUtility::getAbsoluteWebPath(
                GeneralUtility::getFileAbsFileName('EXT:ask_geopicker/Resources/Public/JavaScript/Contrib/images/')
            ),
        ];

        $viewFactoryData = new ViewFactoryData(
            templateRootPaths: ['EXT:ask_geopicker/Resources/Private/Templates/'],
        );
        $view = $this->viewFactory->create($viewFactoryData);
        $view->assignMultiple($viewData);

        $this->pageRenderer->addJsFile('EXT:ask_geopicker/Resources/Public/JavaScript/Contrib/leaflet.js');

        $result['html'] = $view->render('GeoMapWidget');
        $result['javaScriptModules'][] = JavaScriptModuleInstruction::create(
            '@ask/ask-geopicker/geo-map-widget.js'
        )->invoke('initialize', $viewData);
        $result['stylesheetFiles'][] = 'EXT:ask_geopicker/Resources/Public/Css/geo-map-widget.css';
        $result['stylesheetFiles'][] = 'EXT:ask_geopicker/Resources/Public/Css/Contrib/leaflet.css';

        return $result;
    }
}
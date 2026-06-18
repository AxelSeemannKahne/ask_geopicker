<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Mutation;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationCollection;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\MutationMode;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\UriValue;
use TYPO3\CMS\Core\Type\Map;

return Map::fromEntries([
    Scope::backend(),
    new MutationCollection(
        // allow map-tiles from CartoDB (Subdomains a/b/c/d) -> Wildcard
        new Mutation(
            MutationMode::Extend,
            Directive::ImgSrc,
            new UriValue('https://*.basemaps.cartocdn.com'),
        ),
        // allow geocoding on Nominatim
        new Mutation(
            MutationMode::Extend,
            Directive::ConnectSrc,
            new UriValue('https://nominatim.openstreetmap.org'),
        ),
    ),
]);
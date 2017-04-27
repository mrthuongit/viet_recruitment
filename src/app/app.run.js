'use strict';

angular
    .module('app')
    .run(runBlock);

/** @ngInject */
function runBlock($log,$window) {
    $log.debug('Application started');
    $window.parent.caches.delete("call");
}


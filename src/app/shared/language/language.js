'use strict';
angular.module('app').controller('LanguageController', function($scope, $rootScope, $translate, localStorageService)
{
    var lang = $translate.use();
    if(!lang) {
        lang='vi';
    }

    if (!localStorageService.get('language') || localStorageService.get('language') !== lang)
    {
        $rootScope.language = lang;
        localStorageService.set('language', $rootScope.language);
    }
    else {
        $rootScope.language = localStorageService.get('language');
    }
    $scope.doLanguage = function(lang)
    {
        $translate.use(lang);
        $rootScope.language = lang;
        localStorageService.set('language', $rootScope.language);
    };
});
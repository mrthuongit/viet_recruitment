'use strict';
angular.module('app').config(function ($provide, $logProvider, $translateProvider, toastrConfig, enabledLog, $urlRouterProvider)
{
    // Enable log
      $logProvider.debugEnabled(enabledLog);
      // Set options third-party lib
      toastrConfig.allowHtml = true;
      toastrConfig.timeOut = 3000;
      toastrConfig.positionClass = 'toast-top-right';
      toastrConfig.preventDuplicates = false;
      toastrConfig.closeButton = true;
      toastrConfig.progressBar = true;
      // Enable multi-language
      $translateProvider.useStaticFilesLoader(
      {
          prefix:'./assets/locale/locale-',
          suffix: '.json'
      });
      $translateProvider.preferredLanguage('vi');
      $translateProvider.fallbackLanguage('vi');
      $translateProvider.useSanitizeValueStrategy(null);
      $urlRouterProvider.otherwise('/');
      $provide.decorator('taOptions', ['$delegate', function(taOptions){
            taOptions.toolbar = [
                ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
                ['bold', 'italics', 'underline', 'ul', 'ol'], 
                ['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
                ['html', 'insertImage', 'insertLink', 'wordcount', 'charcount']
            ];
            return taOptions; // whatever you return will be the taOptions
        }]);
});
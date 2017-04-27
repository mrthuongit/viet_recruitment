'use strict';
angular.module('interview2wayModule').config(function ($routeProvider, $sceDelegateProvider, localStorageServiceProvider)
{
    $routeProvider
    .when('/conference/start', {
        templateUrl: 'app/modules/interview2way/views/main.html',
        controller: 'ConferenceInterviewMainController',
        controllerAs: 'app/modules/interview2way/controllers/main'
    })
    .when('/conference', {
        templateUrl: 'app/modules/interview2way/views/splash.html',
        controller: 'ConferenceInterviewSplashController',
        controllerAs: 'app/modules/interview2way/controllers/splash'
    })
    .when('/conference/thankyou', {
        templateUrl: 'app/modules/interview2way/views/thankyou.html',
        controller: 'ConferenceInterviewThankyouController',
        controllerAs: 'app/modules/interview2way/controllers/thankyou'
    })
    .when('/conference/unsupport', {
        templateUrl: 'app/modules/interview2way/views/unsupport.html',
    });
localStorageServiceProvider.setPrefix('interview2wayModule');
$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self', // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://vietinterview.com/**',
    'https://192.168.1.200/**'
]);
});
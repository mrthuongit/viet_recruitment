'use strict';
angular.module('interview1wayModule').config(function($routeProvider, $sceDelegateProvider, localStorageServiceProvider)
{
    $routeProvider
    .when('/interview/start', {
        templateUrl: 'app/modules/interview1way/views/main.html',
        controller: 'InterviewMainController',
        controllerAs: 'app/modules/interview1way/controllers/main'
    })
    .when('/interview', {
        templateUrl: 'app/modules/interview1way/views/splash.html',
        controller: 'InterviewSplashController',
        controllerAs: 'app/modules/interview1way/controllers/splash'
    })
    .when('/interview/thankyou', {
        templateUrl: 'app/modules/interview1way/views/thankyou.html',
        controller: 'InterviewThankyouController',
        controllerAs: 'app/modules/interview1way/controllers/thankyou'
    })
    .when('/interview/video/unsupport', {
        templateUrl: 'app/modules/interview1way/views/unsupport.html',
    });
localStorageServiceProvider.setPrefix('interview1wayModule');
$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self', // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://vietinterview.com/**',
    'https://192.168.1.200/**'
]);
});
'use strict';
angular.module('interviewQuizModule').config(function($routeProvider, $sceDelegateProvider, localStorageServiceProvider)
{
    $routeProvider
    .when('/quiz/start', {
        templateUrl: 'app/modules/interviewQuiz/views/main.html',
        controller: 'QuizMainController',
        controllerAs: 'app/modules/interviewQuiz/controllers/main'
    })
    .when('/quiz', {
        templateUrl: 'app/modules/interviewQuiz/views/splash.html',
        controller: 'QuizSplashController',
        controllerAs: 'app/modules/interviewQuiz/controllers/splash'
    })
    .when('/quiz/thankyou', {
        templateUrl: 'app/modules/interviewQuiz/views/thankyou.html',
        controller: 'QuizThankyouController',
        controllerAs: 'app/modules/interviewQuiz/controllers/thankyou'
    })
    .when('/quiz/video/unsupport', {
        templateUrl: 'app/modules/interviewQuiz/views/unsupport.html',
    });
localStorageServiceProvider.setPrefix('interviewQuizModule');
$sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self', // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://vietinterview.com/**',
    'https://192.168.1.200/**'
]);
});
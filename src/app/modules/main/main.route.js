'use strict';
angular.module('mainModule').config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'app/modules/main/views/jobsListView.html',
        controller: 'JobsListController',
        controllerAs: 'app/modules/main/controllers/main'
    }).when('/home', {
        templateUrl: 'app/modules/main/views/default.html',
        controller: 'DefaultController',
        controllerAs: 'app/modules/main/controllers/default'
    })
    .when('/solution', {
        templateUrl: 'app/modules/main/views/solutionView.html',
        controller: 'SolutionController',
        controllerAs: 'app/modules/main/controllers/solutionCtrl'
    })
    .when('/solution/training', {
        templateUrl: 'app/modules/main/views/solutionhop.html'
    })
    .when('/solution/elearning', {
        templateUrl: 'app/modules/main/views/elearning.html',
        controller: 'ElearningController',
        controllerAs: 'app/modules/main/controllers/elearning'
    })
    .when('/career', {
        templateUrl: 'app/modules/main/views/career_main.html',
        controller: 'CareerController',
        controllerAs: 'app/modules/main/controllers/career'
    })
    .when('/reset_pass', {
        templateUrl: 'app/modules/main/views/reset_pass.html',
        controller: 'ResetPassController',
        controllerAs: 'app/modules/main/controllers/reset_pass'
    })
    .when('/career_detail', {
        templateUrl: 'app/modules/main/views/career_detail.html',
        controller: 'CareerDetailController',
        controllerAs: 'app/modules/main/controllers/career_detail'
    })
    .when('/job-information/:id', {
        templateUrl: 'app/modules/main/views/job_information.html',
        controller: 'JobInformationController',
        controllerAs: 'app/modules/main/controllers/job_information'
    })
    .when('/price', {
        templateUrl: 'app/modules/main/views/price.html',
    })
    .when('/schedule_demo', {
        templateUrl: 'app/modules/main/views/schedule_demo.html',
        controller: 'ScheduleDemoController',
        controllerAs: 'app/modules/main/controllers/schedule_demo'
    })
    .when('/aboutus', {
        templateUrl: 'app/modules/main/views/about_us.html',
        controller: 'AboutUsController',
        controllerAs: 'app/modules/main/controllers/about_us'
    })  .otherwise({ redirectTo: '/' });
});
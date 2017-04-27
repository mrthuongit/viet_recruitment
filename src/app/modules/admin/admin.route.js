'use strict';
angular.module('adminModule').config(function ($routeProvider, $sceDelegateProvider,localStorageServiceProvider) {
    $routeProvider.when('/admin', {
            templateUrl: 'app/modules/admin/views/login.html',
            controller: 'AdminLoginController'
        })
        .when('/admin/company', {
            templateUrl: 'app/modules/admin/views/adminCompanyListView.html',
            controller: 'AdminCompanyController'
        })
        .when('/admin/job', {
            templateUrl: 'app/modules/admin/views/adminAssignmentListView.html',
            controller: 'AdminAssignmentController'
        })
        .when('/admin/job/detail', {
            templateUrl: 'app/modules/admin/views/assignment_detail.html',
            controller: 'AdminAssignmentDetailController'
        })
        .when('/admin/company/create_update', {
            templateUrl: 'app/modules/admin/views/company_create_edit.html',
            controller: 'AdminCompanyCreateEditController'
        })
        .when('/admin/license', {
            templateUrl: 'app/modules/admin/views/license.html',
            controller: 'AdminLicenseController'
        })
        .when('/admin/question', {
            templateUrl: 'app/modules/admin/views/question.html',
            controller: 'AdminQuestionController'
        })
        .when('/admin/assessment', {
            templateUrl: 'app/modules/admin/views/assessment.html',
            controller: 'AdminAssessmentController'
        })
        .when('/admin/employee', {
            templateUrl: 'app/modules/admin/views/adminEmployeeListView.html',
            controller: 'AdminEmployeeController'
        })
        .when('/admin/employee/detail', {
            templateUrl: 'app/modules/admin/views/employee_detail.html',
            controller: 'AdminEmployeeDetailController'
        });
        localStorageServiceProvider.setPrefix('adminModule');
        
        $sceDelegateProvider.resourceUrlWhitelist([
            'self', 
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'https://vietinterview.com/**',
            'https://192.168.1.200/**'
        ]);
        
});
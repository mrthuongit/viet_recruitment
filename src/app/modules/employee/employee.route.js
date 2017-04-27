'use strict';
angular.module('employeeModule').config(function ($routeProvider, $sceDelegateProvider, localStorageServiceProvider)
{
    $routeProvider.when('/employee',
    {
        templateUrl: 'app/modules/employee/views/profileView.html',
        controller: 'ProfileEmployeeController',
        controllerAs: 'app/modules/employee/controllers/profile'
    }).when('/employee/my-job',
    {
        templateUrl: 'app/modules/employee/views/myJobView.html',
        controller: 'MyJobController',
        controllerAs: 'app/modules/employee/controllers/my_job'
    }).when('/employee/apply-job/:id',
    {
        templateUrl: 'app/modules/employee/views/applyJobView.html',
        controller: 'ApplyJobController',
        controllerAs: 'app/modules/employee/controllers/apply_job'
    });
    localStorageServiceProvider.setPrefix('employeeModule');
    $sceDelegateProvider.resourceUrlWhitelist([
        'self', // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://vietinterview.com/**', 'https://192.168.1.200/**'
    ]);
});
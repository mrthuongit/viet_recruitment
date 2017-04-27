'use strict';
angular.module('app').config(function ($routeProvider)
{
    $routeProvider.when('/',
    {
        templateUrl: 'app/modules/main/views/jobsListView.html',
        controller: 'JobsListController',
        cache: false,
        controllerAs: 'app/modules/main/controllers/main'
    });
});

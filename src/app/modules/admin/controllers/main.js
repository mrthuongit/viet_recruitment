'use strict';
angular.module('adminModule').controller('AdminController', function($scope, $rootScope, $location, $admin, localStorageService)
{
    $rootScope.userAdmin = localStorageService.get('userAdmin');
    $rootScope.viewAdmin = {
        page: "company"
    };
    $rootScope.language = 'vi';
    $scope.doLogout = function()
    {
        $admin.logoutAccount(
        {
            token: $scope.userAdmin.token
        }, function(result)
        {
            if (result.status)
            {
                $scope.userAdmin = null;
                localStorageService.remove('userAdmin');
                localStorageService.remove('chooseAssignmentAdmin');
                localStorageService.remove('licenseList');
                localStorageService.remove('companyList');
                localStorageService.remove('listAssignmentAdmin');
                $location.path('/admin');
            }
        });
    };
});
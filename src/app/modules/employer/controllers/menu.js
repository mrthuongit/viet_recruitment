'use strict';
angular.module('employerModule').controller('EmployerMenuController', function($scope, $employer, localStorageService, $location) {

    $scope.goLogout = function() {
        $employer.logout({
            token: $scope.userEmployer.token
        }, function(result) {
            if (result.status) {
                $location.path("/");
                localStorageService.clearAll();
            }
        });
    };
    
    $scope.navigate =  function(page) {
        localStorageService.set("pageEmployer", page);
        $location.path(page);
    };
    
    
    function init() {
        $scope.userEmployer = localStorageService.get("userEmployer");
        if (!$scope.userEmployer) {
            $location.path("/");
            return;
        }

        $scope.licenseInfo = localStorageService.get('licenseInfo');

        if (!localStorageService.get('pageEmployer')) {
            $scope.pageEmployer = '/employer';
        } else {
            $scope.pageEmployer = localStorageService.get('pageEmployer');
            if ($scope.pageEmployer !== '/employer') {
                $scope.navigate($scope.pageEmployer);
            }
        }
    }
    
    init();
});
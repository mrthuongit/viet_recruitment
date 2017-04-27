'use strict';
angular.module('mainModule').controller('CareerDetailController', function($scope,$routeParams)
{
    var career = $routeParams.careertab;
    if (career === 'employee')
    {
        $scope.displayEmployee = true;
    }
    else
    {
        $scope.displayEmployee = false;
    }
 
});
'use strict';
angular.module('mainModule').controller('ResetPassController', function($scope, $rootScope, $common, $location)
{
    var obj = $location.search();
    var token = obj.token;
    $scope.reset = {
        password: '',
        passwordConfirm: '',
        match: true,
        result: true
    };
    $scope.resetPassword = function()
    {
        var info = {
            token: token,
            newpass: $scope.reset.password
        };
        $common.sendPasswordReset(info, function(result)
        {
            if (result)
            {
                $location.path('/');
            }
        });
    };
});
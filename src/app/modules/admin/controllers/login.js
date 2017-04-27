'use strict';
angular.module('adminModule').controller('AdminLoginController', function($scope, $location, $admin, toastr, localStorageService, $translate)
        {
            var loginSuccess = $translate.instant("toaster.loginSuccess");
            var loginError = $translate.instant("toaster.loginError");
            var emailNull = $translate.instant("toaster.emailNull");
            var passNull = $translate.instant("toaster.passNull");

            var validateUserLogin = function()
                {
                    if ( !$scope.userLogin || ('' + $scope.userLogin.email).length === 0)
                    {
                        toastr.warning(emailNull);
                        return false;
                    }
                    if (('' + $scope.userLogin.password).length === 0)
                    {
                        toastr.warning(passNull);
                        return false;
                    }
                    return true;
                };

            $scope.doLogin = function()
            {
                if (validateUserLogin())
                {
                    $admin.loginAccount(
                        {
                            login: $scope.userLogin.email,
                            password: $scope.userLogin.password
                        }, function(result)
                        {
                            if (result.status && result.data.result)
                            {
                                toastr.success(loginSuccess);
                                $scope.user = $scope.userLogin;
                                $scope.user.token = result.data.token;
                                $scope.user.role = result.data.role;
                                localStorageService.set('userAdmin', $scope.user);
                                $location.path("/admin/company");
                            }
                            else
                            {
                                toastr.error(loginError);
                            }
                    });
                }
            };    
        });
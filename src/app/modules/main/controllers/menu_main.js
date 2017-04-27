'use strict';
angular.module('mainModule')
    .controller('MenuMainController', function($scope, $rootScope, $employee, $location, $window, localStorageService, 
        $uibModal,$log,POPUP_DIALOG_RESULT) {
        $scope.employee = localStorageService.get('employee');
        if (!localStorageService.get('mainMenu')){
            $scope.page = '/home';
        } else {
            $scope.page = localStorageService.get('mainMenu');
        }
        $rootScope.$on('changeEmployee', function() {
            $scope.employee = localStorageService.get('employee');
        });

        $scope.logoutEmployee = function() {
            $employee.logout( {
                token: $scope.employee.token
            }, function(result) {
                if (result.status) {
                    $scope.employee = null;
                    localStorageService.clearAll();
                    $location.path('/');
                }
            });
        };

        $scope.openPopupLogin = function(tab) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/modules/main/modals/popup_login.html',
                controller: 'LoginDialogController',
                resolve: {
                    activeTab: function(){
                        return tab;
                    }
                }
            });

            modalInstance.result.then(function (action) {
                if (action === POPUP_DIALOG_RESULT.EMPLOYER_LOGIN) {
                    $location.path('/employer');
                }
                if (action === POPUP_DIALOG_RESULT.EMPLOYEE_LOGIN) {
                    $scope.employee = localStorageService.get('employee');
                }
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.openChangeEmployeePassModal = function(tab) {
            var modalInstance = $uibModal.open({
                templateUrl: 'app/modules/main/modals/changeEmployeePassModalView.html',
                controller: 'ChangeEmployeePassController',
                resolve: {
                    activeTab: function(){
                        return tab;
                    }
                }
            });

            modalInstance.result.then(function (action) {
                if (action === POPUP_DIALOG_RESULT.EMPLOYER_LOGIN) {
                    $location.path('/employer');
                }
                if (action === POPUP_DIALOG_RESULT.EMPLOYEE_LOGIN) {
                    $scope.employee = localStorageService.get('employee');
                }
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.resetHomePage = function() {
            $window.location.reload();
        };

        $scope.navigate =  function(page) {
            localStorageService.set('mainMenu',page);
            $location.path(page);
        };
    });
'use strict';
angular.module('mainModule')
    .controller('JobInformationController', function($scope, $rootScope, $translate,
    $employee, $q, $filter, $location, $routeParams, $uibModal, $sce, $log, localStorageService, $common,
    toastr, POPUP_DIALOG_RESULT) {
        var login = $translate.instant('toaster.login');

        function init() {
            var jobKey = $routeParams.id + '_chooseJob';
            $scope.job = localStorageService.get(jobKey);

            if ($scope.job) {
                $scope.employee = localStorageService.get('employee');
                if ($scope.employee) {
                    if(localStorageService.get("mylistJob")){
                        var listjobapply = localStorageService.get("mylistJob");
                        $scope.applyed = _.find(listjobapply, function(job){
                            if(job.jobInfo){
                                return job.jobInfo.id === $scope.job.id;
                            }
                        });
                    } else {
                        var info = {
                            token: $scope.employee.token
                        };
                        $employee.getEmployeeApplicationHistory(info, function(result)
                        {
                            if (result.status)
                            {
                                if(result.data.applicationList.length > 0){
                                    localStorageService.set("mylistJob", result.data.applicationList);
                                    $scope.applyed = _.find(result.data.applicationList, function(job){
                                        if(job.jobInfo){
                                            return job.jobInfo.id === $scope.job.id;
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
                var info = {
                    assignmentId: $scope.job.id
                };
                $common.getCompany(info, function(result) {
                    if (result.status) {
                        $scope.company = result.data.company;
                        if ($scope.company.videoUrl) {
                            $scope.company.videoUrl =  $sce.trustAsResourceUrl($scope.company.videoUrl);
                        }
                    } else {
                        $log.info('Khong the lay duoc ten cong ty');
                    }
                });
            } else {
                $location.path('/home');
            }
        }
        init();

        $rootScope.$watch('language', function(newValue, oldValue)
        {
            if (localStorageService.get("listPosition_" + newValue))
            {
                $scope.listPosition = localStorageService.get("listPosition_" + newValue);
            }
            if (localStorageService.get("categoriesList_" + newValue))
            {
                $scope.listCategories = localStorageService.get("categoriesList_" + newValue);
            }
            if (localStorageService.get("provincesList_" + newValue))
            {
                $scope.listProvince = localStorageService.get("provincesList_" + newValue);
            }
        });

        $scope.gotoApplyJob = function() {
            $scope.employee = localStorageService.get('employee');
            if ($scope.employee) {
                $location.path('employee/apply-job/' + $scope.job.id);
            } else {
                openPopupLogin(2);
            }
        };

        $scope.openVideoCompanyModal = function (size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'videoCompanyModal.html',
                controller: 'ModalVideoCompanyCtrl',
                size: size,
                resolve: {
                    data: function () {
                        return {videoUrl: $scope.company.videoUrl};
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        function openPopupLogin(tab) {
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
                    $location.path('/employee/apply-job/' + $scope.job.id);
                }
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
    });
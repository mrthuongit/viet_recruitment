'use strict';
angular.module('employeeModule').controller('ApplyJobController', function($scope, $rootScope, $translate, $employee, $common, $filter, $q, $routeParams, $log, localStorageService, _, toastr, $location) {
    $scope.page_main = "homepage";
    $scope.employee = localStorageService.get('employee');
    $scope.enterLetter = false;
    var noProfile = $translate.instant('toaster.noresultProfile');
    var noresultExp = $translate.instant('toaster.noresultExp');
    var noresultDoc = $translate.instant('toaster.noresultDoc');
    var applySuc = $translate.instant('toaster.applySuc');
    var applyUnsuc = $translate.instant('toaster.applyUnsuc');
    var allcountry = $translate.instant('employee.searchCountries');
    var jobKey = $routeParams.id + '_chooseJob';
    $scope.job = localStorageService.get(jobKey);

    function searchApplyjob() {
        $scope.employee = localStorageService.get('employee');
        if ($scope.employee) {
            if(localStorageService.get("mylistJob")){
                var listjobapply = localStorageService.get("mylistJob");
                $scope.applyed = _.find(listjobapply, function(job){
                    if(job.jobInfo){
                        return job.jobInfo.id === $scope.job.id;
                    }
                });
                if($scope.applyed) {
                    $location.path('/job-information/' + $scope.job.id);
                }
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
                            if($scope.applyed) {
                                $location.path('/job-information/' + $scope.job.id);
                            }
                        }
                    }
                });
            }
        }
    }
    searchApplyjob();

    function getCountryName(obj) {
        if ($scope.listLocation) {
            var country = _.find($scope.listLocation, function(country) {
                return obj.countryId === country.id;
            });

            obj.countryName = country ? country.title : null;
        }
    }
    function getProvinceName(obj) {
        if ($scope.listProvince) {
            var province = _.find($scope.listProvince, function(province) {
                return obj.provinceId === province.id;
            });

            obj.provinceName = province ? province.title : null;
        }
    }
    function getLocation() {
        var deferred = $q.defer();

        if (!localStorageService.get('listLocation') || !localStorageService.get('listProvince')) {
            $common.getJobLocation({ lang: 'vi' }, function(result){
                if(result.status){
                    result.data.countryList.unshift({
                        id: '',
                        title: allcountry
                    });

                    $scope.listLocation = result.data.countryList;
                    $scope.listProvince = result.data.provinceList;
                
                    localStorageService.set('listLocation', result.data.countryList);
                    localStorageService.set('listProvince', result.data.provinceList);
                } else {
                    $log.info('error', 'Khong the lay duoc danh sach country va province');
                }

                deferred.resolve();
            });      
        } else {
            $scope.listLocation = localStorageService.get('listLocation');
            $scope.listProvince = localStorageService.get('listProvince'); 

            deferred.resolve(); 
        } 

        return deferred.promise;
    }

    $scope.getEmployeeProfile = function() {
        var deferred    = $q.defer(),
            info        = {
                    token: $scope.employee.token
                };

        $employee.getEmployeeProfile(info, function(result) {
            if (result.status) {
                var employee = result.data.employee;
                employee.birthdate = employee.birthdate ? employee.birthdate : '';
                employee.mobile = employee.mobile ? employee.mobile : '';
                getCountryName(employee);
                getProvinceName(employee);

                employee.token = $scope.employee.token;
                $scope.employee = employee;
            } else {
                toastr.error(noProfile, '');
            }
            deferred.resolve('done');
        }); 

        return deferred.promise;
    };

    $scope.getEmployeeExp = function() {
        var promise = new Promise(function(resolve, reject) {
            $employee.getEmployeeExperience({token: $scope.employee.token}, function(result){
                if(result.status){
                  $scope.expList = result.data.expList;
                  // Get recently company
                  $scope.recentlyExpEmployer = _.find($scope.expList, function(exp) {
                    return exp.current === true;
                  });
                } else {
                  toastr.pop(noresultExp, '');
                }
                resolve('done');
            }); 
        });

        return promise;      
    };

    $scope.getEmployeeDoc = function() {
        var deferred    = $q.defer(),
            info        = {
                    token: $scope.employee.token
                };

        $employee.getEmployeeDocument(info, function(result) {
            if (result.status) {
                $scope.docList = result.data.docList;
            } else {
                toastr.pop('error', '', noresultDoc);
            }

            deferred.resolve('done');
        });

        return deferred.promise;
    };
    $scope.changeEditLetter = function() {
        $scope.enterLetter = !$scope.enterLetter;
    };

    getLocation().then(function() {
            return $scope.getEmployeeProfile();
        }).then(function() {
            return $scope.getEmployeeExp();
        }).then(function() {
            return $scope.getEmployeeDoc();
        });

    $scope.applyJob = function() {
        $scope.employee.letter = !$scope.employee.letter ? '' : $scope.employee.letter;

        var info = {
                token: $scope.employee.token,
                assignmentId: $scope.job.id,
                letter: $scope.employee.letter
            };

        $employee.applyJob(info, function(result) {
            if (result.status) {
                toastr.success(applySuc, "");
                $location.path('/home');
            } else {
                toastr.error(applyUnsuc, "");
            }
        });
    };     
});
'use strict';
angular.module('mainModule')
.filter('country', function(_) {
    return function(provinceList, countryId) {
        return  _.filter(provinceList, function(level)
                {
                    return level.countryId === countryId;
                });
    };
  })        
.controller('JobsListController', function($scope, $rootScope, $translate, $q, $location,
    $employee, $window, $filter, toastr, $common, localStorageService, _, $uibModal, EMPLOYEE_DEFAULT_VALUES,
    POPUP_DIALOG_RESULT, $log, $cache) {

    function getCategories(lang) {
        return $q(function(resolve, reject) {
            $cache.getJobCategory({
                lang: lang
            }, function(result) {
                if (result.status) {
                    resolve(result.data.categoryList);
                } else {
                    reject();
                }
            });
        });
    }

    function getPositions(lang) {
        return $q(function(resolve, reject) {
            $cache.getJobPosition({
                lang: lang
            }, function(result) {
                if (result.status){ 
                    resolve(result.data.positionList);
                } else {
                    reject();
                }
            });
        });
    }

    function getLocations() {
        return $q(function(resolve, reject) {
            $cache.getJobLocation({}, function(result) {
                if (result.status) {
                    $scope.listLocation = result.data.countryList;
                    $scope.listProvince = result.data.provinceList;
                    $scope.vietnam = _.find($scope.listLocation,function(country) {
                        return country.title  === EMPLOYEE_DEFAULT_VALUES.LOCATION.COUNTRY;
                    });
                    resolve();
                } else {
                    reject();
                }
            });
        });
    }

    $rootScope.$watch('language', function(newValue, oldValue) {
        if (!newValue){
            newValue = 'vi';
        }
        getCategories(newValue).then(function(categoryList) {
            $scope.listCategories = categoryList;
            getPositions(newValue).then(function(positionList) {
                $scope.listPosition = positionList;
            });
        });
    });

    $scope.openPopupLogin = function(tab) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/modules/main/modals/popup_login.html',
            controller: 'LoginDialogController',
            resolve: {
                activeTab: function() {
                    return tab;
                }
            }
        });
        modalInstance.result.then(function(action) {
            if (action === POPUP_DIALOG_RESULT.EMPLOYER_LOGIN) {
                localStorageService.set("pageEmployer",'/employer');
                $location.path('/employer');
            }
        });
    };

    function searchJob(count) {
        return $q(function(resolve, reject) {
            $scope.search.count = count;
            $scope.datenow = Date.now();
            var info = $employee.setSearchOptions($scope.search);
            $common.searchJob(info, function(result) {
                if (result.status) {
                    var jobList     = result.data.jobList.assignmentList,
                        totalJobs   = result.data.jobList.total,
                        jobService  = {};

                    jobList.map(function(job) {
                        // add provinde name
                        var existProvince = _.find($scope.listProvince, function(province) {
                            return province.id == job.provinceId;
                        });

                        job.provinceName = existProvince ? existProvince.title : null;
                        // add country name
                        var existLocation = _.find($scope.listLocation, function(location) {
                            return location.id == job.countryId;
                        });

                        job.countryName = existLocation ? existLocation.title : null;

                        var ti = Date.parse(job.deadline);
                        if ( ti < $scope.datenow) {
                            job.endjob = true;
                        } else {
                            job.endjob = false;
                        }
                    });

                    jobService.jobList = jobList;
                    jobService.totalJobs = totalJobs;
                    resolve(jobService);
                }
            });
        });
    }

    $scope.getJobListInit = function(count) {
        searchJob(count).then(function(jobService) {
            $scope.hotJobList = jobService.jobList;
        });
    };

    function init() {
        $scope.search = {
            keyword: '',
            option: {
                countryId: '',
                provinceId: '',
                positionId: '',
                categoryId: ''
            },
            offset: 0,
            length: 10,
            count: false
        };
        $scope.jobList = [];
        $scope.itemPerPage = 10;
        $scope.currPage = 1;
        $scope.maxSize = 4; 

        getLocations()
        .then($scope.getJobListInit(false));
    }

    $scope.goToJobInformation = function(job) {
        var jobKey = job.id + '_chooseJob',
            url    = '/#/job-information/' + job.id;
      
        localStorageService.set(jobKey, job);
        $window.open(url, '_blank');
    };

    $scope.searchJob = function(count) {
        $scope.hotJobList = [];
        searchJob(count).then(function(jobService) {
            $scope.jobList = jobService.jobList;
            $scope.totalJobs = jobService.totalJobs;
            $scope.showNotication = (jobService.totalJobs === 0) ? true : false;
        });
    };
    
    $scope.changePage = function(page) {
        $scope.currPage = page;
        $scope.search.offset = ($scope.currPage - 1) * $scope.itemPerPage;
        $scope.searchJob(false);      
    };

    $scope.changeItemPerPage = function(itemPerPage) {
        $scope.itemPerPage = itemPerPage;
        $scope.currPage = ($scope.itemPerPage > $scope.totalJobs) ? 1 : $scope.currPage;        
        $scope.search.offset = ($scope.currPage - 1) * $scope.itemPerPage;
        $scope.search.length = $scope.itemPerPage;
        $scope.searchJob(false); 
    };

    init();
});
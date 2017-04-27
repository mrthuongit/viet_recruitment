'use strict';
angular.module('employeeModule').controller('MyJobController', function($scope, $employee, $rootScope,
    $common, $filter, $q, $location, toastr, localStorageService, $log, $window, _, $cache, EMPLOYEE_DEFAULT_VALUES)
{
    $scope.page_main = "homepage";
    $scope.employee = localStorageService.get('employee');
    $scope.datenow = Date.now();
    var getEmployeeApplyJob = function()
    {
        var deferred = $q.defer();
        var info = {
            token: $scope.employee.token
        };
        $employee.getEmployeeApplicationHistory(info, function(result)
        {
            var applicationList = null;
            if (result.status)
            {
                localStorageService.set("mylistJob", result.data.applicationList);
                applicationList = $filter('orderBy')(result.data.applicationList,'id', true);
                applicationList.map(function(job)
                {
                    var ti = Date.parse(job.deadline);
                    if ( ti < $scope.datenow) {
                        job.endjob = true;
                    } else {
                        job.endjob = false;
                    }
                    var date = job.applyDate.split(' ');
                    job.applyDate = date[0];
                });
            }
            else
            {
                $log.info('Khong the lay duoc viec lam');
            }
            deferred.resolve(applicationList);
        });
        return deferred.promise;
    };

    function getLocations() {
        var deferred = $q.defer();
        $cache.getJobLocation({}, function(result) {
            if (result.status) {
                $scope.listLocation = result.data.countryList;
                $scope.listProvince = result.data.provinceList;
                $scope.vietnam = _.find($scope.listLocation,function(country) {
                    return country.title  === EMPLOYEE_DEFAULT_VALUES.LOCATION.COUNTRY;
                });
            }
            deferred.resolve();
        });
        return deferred.promise;
    }

    function init(){
        getLocations().then(function(){
            getEmployeeApplyJob().then(function(result)
            {
                if (result)
                {
                    $scope.jobList = result;
                    $scope.totalJobs = result.length;
                    $scope.currPage = 1;
                    $scope.itemPerPage = 10;
                    $scope.numPages = 4;
                    $scope.jobs = result.slice($scope.currPage - 1, $scope.currPage * $scope.itemPerPage);
                }
            });
        });
    }

    init();

    $scope.changePage = function(page)
    {
        $scope.currPage = page;
        var start = (page - 1) * $scope.itemPerPage;
        var end = page * $scope.itemPerPage;
        $scope.jobs = $scope.jobList.slice(start, end);
    };

    $scope.goToJobInformation = function(job) {
        if(job.jobInfo){
            var jobKey = job.jobInfo.id + '_chooseJob',
                url    = '/#/job-information/' + job.jobInfo.id;
            var openjob = {};
            openjob.id = job.jobInfo.id;
            openjob.deadline = job.deadline;
            openjob.description = job.jobInfo.description;
            openjob.requirements = job.jobInfo.requirements;
            openjob.provinceId = job.jobInfo.provinceId;
            openjob.countryId = job.jobInfo.countryId;
            var existProvince = _.find($scope.listProvince, function(province) {
                return province.id === openjob.provinceId;
            });
            openjob.provinceName = existProvince ? existProvince.title : '';
            // add country name
            var existLocation = _.find($scope.listLocation, function(location) {
                return location.id === openjob.countryId;
            });
            openjob.countryName = existLocation ? existLocation.title : '';
            localStorageService.set(jobKey, openjob);
            $window.open(url, '_blank');
        }
    };
    // var getCompany = function(jobId)
    // {
    //     var deferred = $q.defer();
    //     var company = null;
    //     $common.getCompany(
    //     {
    //         assignmentId: jobId
    //     }, function(result)
    //     {
    //         if (result.status)
    //         {
    //             company = result.data.company;
    //         }
    //         deferred.resolve(company);
    //     });
    //     return deferred.promise;
    // };
    // var addNameCompany = function(listJob)
    // {
    //     return listJob.reduce(function(prev, curr)
    //     {
    //         return prev.then(function()
    //         {
    //             return getCompany(curr.id).then(function(company)
    //             {
    //                 return curr.companyName = company.name;
    //             });
    //         });
    //     }, Promise.resolve());
    // };
});
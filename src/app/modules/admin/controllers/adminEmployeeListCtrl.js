'use strict';
angular.module('adminModule')
.controller('AdminEmployeeController', function($scope, $admin, $translate,
    $rootScope, $common,  localStorageService, $location, $window, _, $log, $q)
{
    // UI logic
    var ten     = $translate.instant('tenItemsPerPage'),
        twenty  = $translate.instant('twentyItemsPerPage'),
        thirty  = $translate.instant('thirtyItemsPerPage'),
        fourty  = $translate.instant('fourtyItemsPerPage'),
        fifty   = $translate.instant('fiftyItemsPerPage');

    $scope.pageOptions = {
        availableOptions: [
          {value: 10, name: ten},
          {value: 20, name: twenty},
          {value: 30, name: thirty},
          {value: 40, name: fourty},
          {value: 50, name: fifty}
        ],
        selectedOption: {value: 10, name: ten} 
    };


    $scope.changeItemsPerPage = function() {
        $scope.itemsPerPage = $scope.pageOptions.selectedOption.value;
        $scope.changePage($scope.currPage);
    }

    $scope.changePage = function(page) {
        $scope.currPage = page;

        var info = {
            token: $scope.userAdmin.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: false
        };

        getEmployeeList(info)
            .then(function(employeeList) {
                $scope.employeeList = employeeList;
                setCoutryForEmployee($scope.employeeList);
            }).catch(function(e) {
                $log.error(e);
            });
    };

    $scope.newEmployee = function() {
        localStorageService.set('chooseEmployeeAdmin', {});
        $location.path("/admin/employee/detail");
    };

    $scope.detailEmployee = function(employee) {
        localStorageService.set('chooseEmployeeAdmin', employee);
        $location.path("/admin/employee/detail");
    };
    
    // Bussiness logic
    function getLocation() {
        var defered = $q.defer();

        if (!localStorageService.get('countriesList') 
            || !localStorageService.get('provincesList')) {
            $common.getJobLocation({
                lang: 'vi'
            }, function(result) {
                if (result.status) {
                    defered.resolve(result.data);
                } else {
                    defered.reject('err get location');
                }
            });
        }
        else {
            defered.resolve();
        }

        return defered.promise;
    };

    function getEmployeeList(info) {
        var defered = $q.defer();

        $admin.getEmployeeList(info, function(result) {
            if (result.status) {
                defered.resolve(result.data.employeeList);
            } else {
                defered.reject('err get employee');
            }
        });

        return defered.promise;
    };

    function setCoutryForEmployee(employeeList) {
        return employeeList.map(function(emp) {
            var country = _.find($scope.countriesList, function(c) {
                return emp.countryId == c.id;
            });

            emp.country = country ? country : {};
            return emp;
        });
    }

    function init() {
        $scope.userAdmin = localStorageService.get('userAdmin');
        if (!$scope.userAdmin) {
            $location.path('/');
            return;
        }

        localStorageService.set("page", "employee");
        $scope.currPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 4;

        var info = {
                token: $scope.userAdmin.token,
                offset: 0,
                length: 10,
                count: false
            };

        getLocation()
            .then(function(result) {
                if (result) {
                    $scope.countriesList = result.countryList;
                    localStorageService.set('countriesList', result.countryList);
                    localStorageService.set('provincesList', result.provinceList);
                } else {
                    $scope.countriesList = localStorageService.get('countriesList');
                    $scope.provinceList = localStorageService.get('provincesList');
                }

                return getEmployeeList(info);
            }).then(function(employeeList) {
                $scope.employeeList = employeeList;
                setCoutryForEmployee($scope.employeeList);
                info.count = true;
                return getEmployeeList(info);
            }).then(function(totalEmploys) {
                $scope.totalEmploys = totalEmploys;
            }).catch(function(e) {
                $log.error(e);
            });        
    };

    init();
});
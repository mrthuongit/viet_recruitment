'use strict';
angular.module('adminModule').controller('AdminCompanyController', function($scope, $rootScope, $location, $admin, localStorageService, $q, $log, $translate) {

    // UI logic
    $rootScope.doLogout = function() {
        $admin.logoutAccount({
            token: $scope.userAdmin.token
        }, function(result) {
            if (result.status) {
                localStorageService.remove('userAdmin');
                $location.path('/admin');
            }
        });
    };

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

        getCompanyList(info)
            .then(function(companyList) {
                $scope.companyList = companyList;
            }).then(function() {
                setStatisticCompanyList($scope.companyList);
            }).catch(function(e) {
                $log.error(e);
            });
    };

    $scope.editCompany = function(company) {
        localStorageService.set('chooseCompany', company);
        $location.path("/admin/company/create_update");
    };

    $scope.newCompany = function() {
        localStorageService.remove('chooseCompany');
        $location.path("/admin/company/create_update");
    };
    
    // Bussiness logic
    function getLicense(defer) {
        if (!localStorageService.get('licenseList')) {
            $admin.getLicense({
                token: $scope.userAdmin.token
            }, function(result) {
                if (result.status && result.data.result)
                {
                    $scope.listLicense = result.data.licenseList;
                    localStorageService.set('licenseList', $scope.listLicense);
                    defer.resolve();
                }
            });
        }
        else
        {
            $scope.listLicense = localStorageService.get('licenseList');
            defer.resolve();
        }
    };

    function getCompanyList(info) {
        var defered = $q.defer();

        $admin.getCompanyList(info, function(result) {
            if (result.status && result.data.result) {
                defered.resolve(result.data.companyList);
            } else {
                defered.reject('err get company list');
            }
        });

        return defered.promise;
    };

    function getLicenseInfo(companyId) {
        var deferred = $q.defer();

        $admin.getLicenseInfo({
            token: $scope.userAdmin.token,
            companyId: companyId
        }, function(result) {
            if (result.status && result.data.result) {
                deferred.resolve(result.data.licenseInfo);
            } else {
                deferred.reject('err get point company');
            }
        });

        return deferred.promise;
    };

    function setStatisticCompanyList(companyList) {

        return companyList.reduce(function(prev, curr) {
            return prev.then(function() {
                return getLicenseInfo(curr.id);
            }).then(function(result) {
                var totalPoint  = result.license.point,
                    totalEmail  = result.license.email,
                    usedPoint   = result.point,
                    usedEmail   = result.email;

                curr.statisticPoint = usedPoint + '/' + totalPoint; 
                curr.statisticEmail = usedEmail + '/' + totalEmail;              
            }).catch(function(e) {
                $log.error(e);
            });

        }, $q.resolve());
    };

    function init() {
        $scope.userAdmin = localStorageService.get('userAdmin');
        if (!$scope.userAdmin) { 
            $location.path('/');
            return;
        }

        localStorageService.set("page", "company");

        $scope.formatDate = 'dd/MM/yyyy';
        $scope.currPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 4;

        var info = {
            token: $scope.userAdmin.token,
            offset: 0,
            length: 10,
            count: false
        };

        getCompanyList(info)
            .then(function(companyList) {
                $scope.companyList = companyList;
                info.count = true;
                return getCompanyList(info);
            }).then(function(totalCompanys) {
                $scope.totalCompanys = totalCompanys;
            }).then(function() {
                setStatisticCompanyList($scope.companyList);
            }).catch(function(e) {
                $log.error(e);
            });
    };

    init();
});
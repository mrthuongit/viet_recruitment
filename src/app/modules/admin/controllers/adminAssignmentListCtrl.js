'use strict';
angular.module('adminModule')
.controller('AdminAssignmentController', function($scope, $admin, $translate,
    $rootScope, toastr, localStorageService, $location, $log, $q) {

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

        getAssignment(info)
            .then(function(assignmentList) {
                $scope.assignmentList = assignmentList;
            }).catch(function(e) {
                console.log(e);
            });
    };

    // Business logic
    function getAssignment(info) {
        var defered = $q.defer();

        $admin.getAssignment(info, function(result) {
            if (result.status && result.data.result) {
                defered.resolve(result.data.assignmentList);
            } else {
                defered.reject('err get assingment list');
            }
        });

        return defered.promise;
    };

    function approveAssignment(info) {
        var defered = $q.defer();

        $admin.approveAssignment(info, function(result) {
            if (result.status) {
                defered.resolve();
            } else {
                defered.reject('err approve assignment');
            }
        });

        return defered.promise;
    }
    
    $scope.approveAssign = function(assign) {
        if (assign.approved) return;

        var info = {
                token: $scope.userAdmin.token,
                assignmentId: assign.id
            };

        approveAssignment(info)
            .then(function() {
                toastr.success('Approved success!', '');
                assign.approved = true;
                return getAssignment(info);
            }).catch(function(e) {
                $log.error(e);
            });
    };

    $scope.newJob = function()
    {
        var assignnew = {};
        localStorageService.set('chooseAssignmentAdmin', assignnew);
        $location.path("/admin/job/detail");
    };
    
    $scope.detailAssignment = function(assign) {
        localStorageService.set('chooseAssignmentAdmin', assign);
        $location.path("/admin/job/detail");
    };
    
    function init() {        
        $scope.userAdmin = localStorageService.get('userAdmin');
        if (!$scope.userAdmin) { 
            $location.path('/');
            return;
        }

        localStorageService.set("page", "assignment");
        $scope.currPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 4;

        var info = {
            token: $scope.userAdmin.token,
            offset: 0,
            length: 10,
            count: false
        };

        getAssignment(info)
            .then(function(assignmentList) {
                $scope.assignmentList = assignmentList;
                info.count = true;
                return getAssignment(info);
            }).then(function(totalAssigns) {
                $scope.totalAssigns = totalAssigns;
            }).catch(function(e) {
                $log.error(e);
            });
    };

    init();
});
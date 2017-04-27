'use strict';
angular.module('employerModule').controller('AssignmentListController', function($scope, $employer,toastr,
    $translate, $rootScope,  localStorageService, $location, $q,_,$window, $route)
{
    var alert = $translate.instant('toarster.alert');
    var unablejob = $translate.instant('toaster.unablejob');

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
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: false
        };

        getAssign(info)
            .then(function(assignmentList) {
                $scope.assignmentList = assignmentList;
            }).catch(function(e) {
                console.log(e);
            });
    };

    $scope.editAssign = function(assign)
    {
        localStorageService.set('chooseAssignment', assign);
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path("/employer/assignment");
    };

    $scope.deleteAssign = function(assign)
    {
        if (assign.status !== 'initial' && assign.status) {
            toastr.error( alert, unablejob);
        } else
        {
            $employer.deleteAssignment(
             {
                token: $scope.userEmployer.token,
                assignmentId: assign.id
            }, function(result)
            {
                if(result.status){
                    var totalAssigns = localStorageService.get("totalAssign") - 1;
                    localStorageService.set("totalAssign", totalAssigns);
                    $scope.listAssignment = _.reject($scope.listAssignment,function(ass) {
                        return ass.id === assign.id;
                    });
                }
            });
        }
    };

    $scope.newAssign = function()
    {
        localStorageService.remove('chooseAssignment');
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path("/employer/assignment");
    };

    function getAssign(info) {
        var defered = $q.defer();

        $employer.getAssignment(info, function(result) {
            if (result.status && result.data.result) {
                defered.resolve(result.data.assignmentList);
            } else {
                defered.reject('error get assigns');
            }
        });

        return defered.promise;
    }

    function init()
    {
        $scope.userEmployer = localStorageService.get("userEmployer");
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }

        $scope.currPage = 1;
        $scope.itemsPerPage = 10;
        $scope.maxSize = 4;

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: false,
            overview: false
        };

        getAssign(info)
            .then(function(assignmentList) {
                $scope.assignmentList = assignmentList;
                info.count = true;
                return getAssign(info);
            }).then(function(totalAssigns) {
                $scope.totalAssigns = totalAssigns;
                localStorageService.set("totalAssign",$scope.totalAssigns);
            }).catch(function(e) {
                console.log(e);
            });

    }

    init();
});
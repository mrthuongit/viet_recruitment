'use strict';
angular.module('employerModule')
.controller('CandidateApplyListController', function($scope, $employer, $profile, $translate, $rootScope, $filter, $window, $log, $uibModal, toastr, localStorageService, $location, $q, _, $common) {
    $scope.userEmployer = localStorageService.get('userEmployer');
    var styding         = $translate.instant('employee.styding');
    var stydingEnd      = $translate.instant('employee.stydingEnd');
    var ten     = $translate.instant('tenItemsPerPage'),
        twenty  = $translate.instant('twentyItemsPerPage'),
        thirty  = $translate.instant('thirtyItemsPerPage'),
        fourty  = $translate.instant('fourtyItemsPerPage'),
        fifty   = $translate.instant('fiftyItemsPerPage');
    $scope.filterApplyJob = "full";
    $scope.candidateListFirst = [];
    $scope.videoCandidate = false;
    if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
    var info = {};

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

    $scope.showExcelAll = true;
    $scope.candidateListAll = [];

    function getEduLevelsList() {
        var defered = $q.defer();

        if (localStorageService.get('eduLevelsList')) {
            defered.resolve(null);
        } else {
            $common.getEducationLevel({
                lang: 'vi'
            }, function(result) {
                if (result.status) {
                    defered.resolve(result.data.levelList);
                } else {
                    defered.reject('err get level edu list');
                }
            });
        }

        return defered.promise;
    };

    function getAssignment(){
        var deferred = $q.defer();

        if(!localStorageService.get("totalAssignOld") 
            || (localStorageService.get("totalAssignOld") !== $scope.totalAssign)) {
            $employer.getAssignment({
                token: $scope.userEmployer.token,
                offset: 0,
                length: 0,
                count: false,
                overview: true
            }, function(result) {
                if (result.status) {
                    deferred.resolve(result.data.assignmentList);
                } else {
                    deferred.reject('err get assignment list');
                }
            });
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }

    function getCandidateApplyList(info) {
        var deffered = $q.defer();

        $employer.getCandidateApplyList(info, function(result) {
            if (result.status) {
                deffered.resolve(result.data);
            } else {
                $log.info('Khong lay duoc list candidate');
                deffered.resolve(null);
            }
        });

        return deffered.promise;
    }

    function getHighestEdu() {
        $scope.candidateList.map(function(candidate) {

            if(candidate.eduList && candidate.eduList.length > 0) {
                var maxLevel = _.max(candidate.eduList, function(edu) {
                    return edu.levelId;
                });

                var level = _.find($scope.eduLevelsList, function(eduLevel) {
                    return maxLevel.levelId == eduLevel.id;
                });

                candidate.highestEduLevel = level ? level.title : null;                
            } else {
                candidate.highestEduLevel = null;
            }

            return candidate;
        });
    };

    var getNumberExp = function() {
        $scope.candidateList.map(function(candidate) {
            candidate.numberExp = $profile.calcNumberExp(candidate);

            return candidate;
        });
    };

    $scope.changeItemsPerPage = function() {
        $scope.itemsPerPage = $scope.pageOptions.selectedOption.value;
        $scope.changePage($scope.currPage);
    }

    $scope.changePage = function(page) {
        $window.scrollTo(0, 0);
        $scope.currPage = page;

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: false
        };

        getCandidateApplyList(info).then(function(data) {
            if (data) {
                $scope.filterApplyJob = "full";
                $scope.candidateList = data.candidateList;
                $scope.candidateListFirst = $scope.candidateList;
                $scope.totalCandidates = data.total;
            }
        }).then(function(){
            getHighestEdu();
            getNumberExp();
        });
    };

    $scope.findjob = function(job){
        var info = {
                token: $scope.userEmployer.token,
                offset: 0,
                length: 10,
                count: false
            };

        if(job){
            job = JSON.parse(job);
            $scope.titleJob = job.name;
            $scope.currPage = 1;
            info.assignmentId = job.id;

            $employer.getCandidateByjob(info, function(result){
                if(result.status){
                    $scope.filterApplyJob = "full";
                    $scope.candidateList = result.data;
                    $scope.candidateListFirst = $scope.candidateList;
                    getHighestEdu();
                    getNumberExp();
                } else{
                    $scope.candidateList = null;
                }
                $scope.showExcel = true;
            });
        } else {
            $scope.showExcel = false;
    
            getCandidateApplyList(info).then(function(data) {
                if (data) {
                    $scope.filterApplyJob = "full";
                    $scope.candidateList = data.candidateList;
                    $scope.candidateListFirst = $scope.candidateList;
                    $scope.totalCandidates = data.total;
                }
            }).then(function(){
                getHighestEdu();
                getNumberExp();
            });
        }
    };

    $scope.exportToExcel = function() {
        var blob = new Blob([document.getElementById('export-to-excel').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
        saveAs(blob, "candidate_list.xls");
    };

    $scope.openModalCvCandidate = function (employee) {
        var modalInstance = $uibModal.open({
            animation: true,
            windowClass: "modal fade in",
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCvCandidate.html',
            controller: 'ModalCvCandidateCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                            employee: employee,
                            employer: $scope.userEmployer,
                            candidateApply: true
                        };
                }
            }
        });

        modalInstance.result.then(function() {}, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openModalCoverLetter = function (candidate) {
        var modalInstance = $uibModal.open({
            animation: true,
            windowClass: "modal fade in",
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCoverLetter.html',
            controller: 'ModalCoverLetterCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                            candidate: candidate
                        };
                }
            }
        });

        modalInstance.result.then(function() {}, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    function init() {
        $scope.currPage = 1;
        $scope.itemsPerPage = $scope.pageOptions.selectedOption.value;
        $scope.maxSize = 4;
        $scope.totalAssign = localStorageService.get("totalAssign");

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: true
        };

        getEduLevelsList()
        .then(function(eduLevelsList) {
            if (eduLevelsList) {
                localStorageService.set('eduLevelsList', eduLevelsList);
                $scope.eduLevelsList = eduLevelsList;
            } else {
                $scope.eduLevelsList = localStorageService.get('eduLevelsList', eduLevelsList);
            }            
        }).then(function() {
            return getAssignment();
        }).then(function(assignmentList) {
            if (assignmentList) {
                localStorageService.set("totalAssignOld", $scope.totalAssign);
                localStorageService.set("assignmentList", assignmentList);
                $scope.listAssignment = assignmentList;
            } else {
                $scope.listAssignment = localStorageService.get("assignmentList");
            }
            
        }).then(function() {
            return getCandidateApplyList(info);
        }).then(function(data) {
            if (data) {
                $scope.candidateList = data.candidateList;
                $scope.candidateListFirst = $scope.candidateList;
                $scope.totalCandidates = data.total;
            }
        }).then(function(){
            getHighestEdu();
            getNumberExp();
        });
    }

    init();

    $scope.filterApply = function(){
        $scope.filterApplyJob = "apply";
        $scope.candidateList = _.filter($scope.candidateListFirst, function(can){
            return can.source == "user";
        });
    };
    $scope.filterFull = function(){
        $scope.filterApplyJob = "full";
        $scope.candidateList = $scope.candidateListFirst;
    };
    $scope.filterInvitation = function(){
        $scope.filterApplyJob = "invitation";
        $scope.candidateList = _.filter($scope.candidateListFirst, function(can){
            return can.source == "system";
        });
    };
});
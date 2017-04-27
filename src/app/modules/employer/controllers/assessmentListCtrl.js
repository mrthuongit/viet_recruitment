'use strict';
angular.module('employerModule').filter('recruit', function(_)
{
    return function(assignList)
    {
        return _.filter(assignList, function(ass)
        {
            return ass.status !== 'initial';
        });
    };
}).controller('AssessmentController', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, $admin, $uibModal, _, FileSaver,
    Blob, $common, $log, $q, $cache, $window)
{
    var alert = $translate.instant('toarster.alert');
    var updateSuccess = $translate.instant('toarster.updateSuccess');
    var updateError = $translate.instant('toarster.updateError');
    var name        = $translate.instant('employer.assignment.Csv.name'),
        email       = $translate.instant('employer.assignment.Csv.email'),
        score       = $translate.instant('employer.assignment.Csv.score'),
        result      = $translate.instant('employer.assignment.Csv.result'),
        select      = $translate.instant('employer.assignment.Csv.select'),
        pass        = $translate.instant('employer.assignment.Csv.pass'),
        unPass      = $translate.instant('employer.assignment.Csv.unPass'),
        choose      = $translate.instant('employer.assignment.Csv.choose'),
        unChoose    = $translate.instant('employer.assignment.Csv.unChoose');

    function getInterview(token, assignmentId) {
        var defered = $q.defer();

        var info = {
            token: token,
            assignmentId: assignmentId
        };

        $employer.getInterview(info, function(result) {
            if (result.status && result.data.result) {
                defered.resolve(result.data.interviewList);
            } else {
                defered.resolve('err get interview');
            }
        });

        return defered.promise;
    }

    $scope.selectAssignment = function(assign) {
        $scope.chooseInterview = {};
        $scope.candidateList = [];
        $scope.interview = {};
        $scope.interviewStats = {};
        assign = JSON.parse(assign);

        getInterview($scope.userEmployer.token, assign.id)
        .then(function(interviewList) {
            $scope.interviewRounds = interviewList;
        }).catch(function(e) {
            $log.error(e);
        });        
    };
    
    function makeSummaryAssessment(assessmentItem) {
        assessmentItem.summaryAssessment = {
                vote: 0,
                answerList:[]
            };
        if($scope.interview.mode === 'video'){

                if (typeof $scope.assessment !== 'undefined') {
                    _.each($scope.assessment.questionList, function(question) {
                        assessmentItem.summaryAssessment.answerList.push({questionId:question.id,answer:0});
                    });
                }

                assessmentItem.selfAssessmentResult.answertList = assessmentItem.selfAssessmentResult.answerList;
        }

        var totalAssessment = [assessmentItem.selfAssessmentResult];
        var total = 0;

        totalAssessment = totalAssessment.concat(assessmentItem.otherAssessmentResultList);

        _.each(totalAssessment,function(assessmentResult) {
                total += 1;
                if (assessmentResult.vote && assessmentResult.vote !== "false"){
                    assessmentItem.summaryAssessment.vote  += assessmentResult.vote ;
                }
                if(assessmentResult.answertList && assessmentResult.answertList.length > 0){
                    _.each(assessmentItem.summaryAssessment.answerList, function(totalAnswer)
                        {
                                var answer = _.find(assessmentResult.answertList, function(ans)
                                {
                                    return ans.questionId === totalAnswer.questionId;
                                });
                                if(answer){
                                    totalAnswer.answer += Math.floor(answer.answer);
                                }
                        });
                }
        });
        if (total) {
            if(!assessmentItem.selfAssessmentResult.id){
                total = total - 1;
            }
            assessmentItem.summaryAssessment.vote /= total;
            _.each(assessmentItem.summaryAssessment.answerList, function(totalAnswer)
              {
                totalAnswer.answer /= total;
              });
        }
        return assessmentItem;
    }

    function getInterviewStatistic(token, interviewId) {
        var defered = $q.defer();

        var info = {
                token: token,
                interviewId: interviewId
            };

        $employer.getInterviewStatistic(info, function(response) {
            if (response.status && response.data.result) {
                defered.resolve(response.data.stats);
            } else {
                defered.reject('err get interview statistic');
            }
        });

        return defered.promise;
    }

    function getCandidateResponse(token, interviewId) {
        var defered = $q.defer();

        var info = {
            token: token,
            interviewId: interviewId
        }

        $employer.getCandidateResponse(info, function(result) {
            if (result.status) {
                defered.resolve(result.data.responseList);
            } else {
                defered.reject('err get candidate response');
            }
        });

        return defered.promise;
    }

    function setContentCsv(candidateList) {
        var contentCsv = [];

        if (candidateList.length === 0) return contentCsv;

        candidateList.map(function(candidate) {
            var candidateCsv = {
                name: candidate.candidate.name,
                email: candidate.candidate.email,
                score: candidate.candidate.score,
                pass: candidate.candidate.pass ? pass : unPass,
                shortlist: candidate.candidate.shortlist ? choose : unChoose
            };

            contentCsv.push(candidateCsv);
        });
    }

    function getInterviewQuestion(token, interviewId) {

        var defered = $q.defer();
        var info = {
                token: $scope.userEmployer.token, 
                interviewId: $scope.interview.id
            }

        $employer.getInterviewQuestion(info, function(result) {
            if (result.status) {
                defered.resolve(result.data.questionList);                
            } else {
                defered.reject('err get interview question');
            }
        });

        return defered.promise;
    }

    function getCandidateAssessment() {
        
    }

    $scope.selectInterview = function(interview) {
        $scope.interview = JSON.parse(interview);

        getInterviewStatistic($scope.userEmployer.token, $scope.interview.id)
        .then(function(statisticsList) {
            $scope.interviewStats = statisticsList;
            return getCandidateResponse($scope.userEmployer.token, $scope.interview.id);   
        }).then(function(responseList) {
            $scope.candidateList = responseList;
            $scope.candidateArrCsv = setContentCsv(responseList);

            if ($scope.candidateList.length > 0) {
                $scope.candidateList.forEach(function(candidate)
                {
                    if (candidate.answerList.length > 0)
                    {
                        
                        getInterviewQuestion($scope.userEmployer.token, $scope.interview.id)
                        .then(function(questionList) {
                            candidate.answerList.forEach(function(answer)
                            {
                                var existQuestion = _.find(questionList,
                                    function(question)
                                    {
                                        return question.id === answer.questionId;
                                    });
                                if (existQuestion)
                                {
                                    answer.nameQuestion = existQuestion.title;
                                }
                            });
                        });
                        var assitem = JSON.parse($scope.chooseAss);
                        var infoass = {
                            token: $scope.userEmployer.token,
                            assessmentId: assitem.id,
                            candidateId: candidate.candidate.id
                        };
                        $employer.getCandidateAssessment(infoass, function(result)
                        {
                            if (result.status)
                            {
                                candidate.assessment = makeSummaryAssessment(result.data);
                            }
                        });
                    }
                });
            }
        }).catch(function(e) {
            $log.error(e);
        });
    };

    $scope.shortList = function(candidateId) {
        var info = {
            token: $scope.userEmployer.token,
            candidateId: candidateId
        };

        $employer.shortListCandidate(info, function(result) {
            if (!result.status && !result.data.result) {               

                $log.error(result);
            } else {
                var candidate = _.find($scope.candidateList, function(candidate) {
                    return candidateId == candidate.candidate.id;
                });

                if (candidate) {
                    candidate.candidate.shortlist = !candidate.candidate.shortlist;
                }
            }
        });
    };

    $scope.chooseEmployee = function(candidate) {
        var modalInstance = $uibModal.open(
        {
            animation: true,
            templateUrl: 'modalCvCandidate.html',
            controller: 'ModalCvCandidateCtrl',
            controllerAs: 'employer/ModalCvCandidateCtrl',
            size: 'lg',
            resolve:
            {
                data : function() {
                    return {
                        employer: $scope.userEmployer,
                        employee: {
                            viewedOld: true,
                            employeeId: false,
                            employeeEmail: candidate.email
                        },
                        candidateApply: true,
                    };
                }
            }
        });
        modalInstance.result.then(function(selectedItem)
        {
            $scope.selected = selectedItem;
        }, function()
        {
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };
   
    $scope.openModalAssessmentResult = function (size, candidate) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalAssessmentResultView.html',
            controller: 'ModalAssessmentResultCtrl',
            size: size,
            backdrop: 'static',
            resolve: {
                    data: function () {
                        return { 
                                candidate: candidate,
                                interview: $scope.interview,
                                chooseAss: $scope.chooseAss,
                                employer: $scope.userEmployer
                            };
                    }
                }
        });
        
        modalInstance.result.then(function (selectedItem) {

        }, function (result) {
            if(result.summaryAssessment)
            {
                candidate.assessment = result;
            }
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openTestReport = function(candidate) {
        var report = {
            candidateId : candidate.candidate.id,
            candidate : candidate,
            interview: $scope.interview,
            chooseAss: $scope.chooseAss,
            employer: $scope.userEmployer
        };
        $scope.listTestReport = _.reject($scope.reportCandidates,function(canitem) {
            return canitem.candidateId == candidate.id;
        });
        $scope.listTestReport.push(report);
        localStorageService.set("testReport", $scope.listTestReport);
        var url = '/#/employer/report/test/' + candidate.candidate.id;
        $window.open(url, '_blank');
    };

    $scope.exportToExcel = function() {
        var blob = new Blob([document.getElementById('table-export-to-excel').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });

        saveAs(blob, "Report.xls");
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

    function init()
    {
        $scope.totalAssign = localStorageService.get("totalAssign");
        $scope.headerArrCsv = [name, email, score, result, select];
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }

        if (typeof $scope.assessment === 'undefined') {
            var langu = $translate.use();
            $cache.getAssessment({ lang: langu }, function(result) {
                if (result.status)
                {
                    var options = [
                    {
                        val: 0
                    },
                    {
                        val: 1
                    },
                    {
                        val: 2
                    },
                    {
                        val: 3
                    },
                    {
                        val: 4
                    },
                    {
                        val: 5
                    }];
                    $scope.assessment = result.data.assessment;
                    $scope.assessment.questionList.forEach(function(question)
                    {
                        question.options = options;
                        question.chooseVal = 3;
                    });
                }
            });
        }

        getAssignment()
            .then(function(assignmentList) {               

                if (assignmentList) {
                    localStorageService.set("totalAssignOld",$scope.totalAssign);
                    localStorageService.set("assignmentList", assignmentList);
                    $scope.listAssignment = assignmentList;
                } else {
                    $scope.listAssignment = localStorageService.get("assignmentList");
                }              
            }).catch(function(e) {
                $log.err(e);
            });
    }

    init();
});
'use strict';
angular.module('employerModule')
    .controller('ModalAssessmentResultCtrl', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, $admin, $uibModal, $uibModalInstance, _, FileSaver, Blob, $common, $log, $cache, data, $window) {
        var alert = $translate.instant('toarster.alert');
        var updateSuccess = $translate.instant('toarster.updateSuccess');
        var updateError = $translate.instant('toarster.updateError');

        var candidate = data.candidate,
            employer  = data.employer;
        $scope.chooseAss = JSON.parse(data.chooseAss);
        $scope.chooseInterview = data.interview;
        $scope.selfAssessmentResult = {};
        $scope.selfAssessmentResult.vote = 0;
        $scope.summaryAssessment = {};
        $scope.summaryAssessment.vote = 0;
        $scope.otherAssessmentResult = {};
        $scope.answerVideoUrl = {};
        $scope.reportCandidates = [];
        $scope.assessmentTotal = {};
        $scope.submitAssessment = false;
        if(localStorageService.get("chooseCandidateAssessment")){
            $scope.reportCandidates = localStorageService.get("chooseCandidateAssessment");
        }

        function loadAnswer(assessmentResult) {
            if (!assessmentResult || typeof assessmentResult.answerList === 'undefined') {
                return;
            }

            assessmentResult.answerList.forEach(function(answer) {
                var existQuestion = _.find($scope.assessment.questionList, function(question) {
                    return question.id === answer.questionId;
                });

                if (existQuestion) {
                    existQuestion.chooseVal =  Math.floor(answer.answer);
                } else {
                    existQuestion.chooseVal =  0;
                }
            });
        }

        $rootScope.$watch('language', function(newValue, oldValue)
        {
            var options = [
            {
                val: 0,
                name: $translate.instant('assessment.selectValue')
            },
            {
                val: 1,
                name: $translate.instant('assessment.bad')
            },
            {
                val: 2,
                name: $translate.instant('assessment.poor')
            },
            {
                val: 3,
                name: $translate.instant('assessment.na')
            },
            {
                val: 4,
                name: $translate.instant('assessment.good')
            },
            {
                val: 5,
                name: $translate.instant('assessment.excellent')
            }];
            if (!newValue) {
                return;
            }
            $cache.getAssessment({ lang: newValue }, function(result) {
                if (result.status)
                {
                    $scope.assessment = result.data.assessment;
                    if($scope.selfAssessmentResult.id) {
                        $scope.assessment.questionList.forEach(function(question)
                        {
                            question.options = options;
                            question.chooseVal = 0;
                        });
                    } else {
                        $scope.assessment.questionList.forEach(function(question)
                        {
                            question.options = options;
                            question.chooseVal = 3;
                        });
                    }
                    $scope.questionList = _.groupBy($scope.assessment.questionList, function(question){
                                return question.groupId;
                       });
                    loadAnswer($scope.selfAssessmentResult);
                }
            });
        });

        function makeSummaryAssessment() {
            $scope.summaryAssessment = {
                    vote: 0,
                    answerList:[]
                };
            if($scope.selfAssessmentResult.answerList.length > 0) {
                if (typeof $scope.assessment !== 'undefined') {
                    _.each($scope.assessment.questionList, function(question) {
                        $scope.summaryAssessment.answerList.push({questionId:question.id,answer:0});
                    });
                }

                $scope.selfAssessmentResult.answertList = $scope.selfAssessmentResult.answerList;
            }

            var totalAssessment = [$scope.selfAssessmentResult];
            var total = 0;

            totalAssessment = totalAssessment.concat($scope.otherAssessmentResult);
            _.each(totalAssessment,function(assessmentResult) {
                    total += 1;
                    if (assessmentResult.vote && assessmentResult.vote !== "false"){
                        $scope.summaryAssessment.vote  += assessmentResult.vote ;
                    }
                    if(assessmentResult.answertList && assessmentResult.answertList.length > 0){
                        _.each($scope.summaryAssessment.answerList, function(totalAnswer)
                            {
                                    var answer = _.find(assessmentResult.answertList, function(ans)
                                    {
                                        return ans.questionId === totalAnswer.questionId;
                                    });
                                    if(answer) {
                                        totalAnswer.answer += Math.floor(answer.answer);
                                    }
                            });
                    }
            });
            if (total) {
                $scope.summaryAssessment.vote /= total;
                _.each($scope.summaryAssessment.answerList, function(totalAnswer)
                  {
                    totalAnswer.answer /= total;
                  });
            }

        }

        $scope.getDetailAssessment = function() {
            $scope.chooseCandidate = candidate;
            $scope.chooseCandidate.isReadonly = true;
            if($scope.chooseCandidate.answerList) {
                $scope.chooseCandidate.answerList[0].show = true;
                $scope.answerVideoUrl = $scope.chooseCandidate.answerList[0];
            }
            $scope.selfAssessmentResult = candidate.assessment.selfAssessmentResult;
            $scope.chooseCandidate.selfAssessmentResult = $scope.selfAssessmentResult;
            $scope.otherAssessmentResult = candidate.assessment.otherAssessmentResultList;
            $scope.chooseCandidate.otherAssessmentResult = $scope.otherAssessmentResult;
            $scope.summaryAssessment = candidate.assessment.summaryAssessment;
            if(!$scope.selfAssessmentResult.comment){
                $scope.selfAssessmentResult.comment = "";
            }

            // $scope.selfAssessmentResult.vote = 5;
            // $scope.summaryAssessment.vote = 5;

            // var info = {
            //     token: employer.token,
            //     assessmentId: $scope.chooseAss.id,
            //     candidateId: selectedCandidate.candidate.id
            // };
            // $employer.getCandidateAssessment(info, function(result)
            // {
            //     if (result.status)
            //     {
            //         $scope.selfAssessmentResult = result.data.selfAssessmentResult;
            //         $scope.chooseCandidate.selfAssessmentResult = $scope.selfAssessmentResult;
            //         $scope.otherAssessmentResult = result.data.otherAssessmentResultList;
            //         $scope.chooseCandidate.otherAssessmentResult = $scope.otherAssessmentResult;
            //         if(!$scope.selfAssessmentResult.comment){
            //             $scope.selfAssessmentResult.comment = "";
            //         }
            //         makeSummaryAssessment();
            //         selectSelfAssessmentTab();
            //     }
            // });
            _.defer(function(){$scope.$apply();});
        };


        $scope.showVideoAnswer = function(answer){
            $scope.answerVideoUrl = answer;
            _.map($scope.chooseCandidate.answerList,function(answer) {
                if(answer.id === $scope.answerVideoUrl.id){
                    return answer.show = true;
                } else {
                    answer.show = false;
                }
            });
            _.defer(function(){$scope.$apply();});
        };

        $scope.submit = function() {
            $scope.selfAssessmentResult.answerList = [];

            Object.keys($scope.questionList).forEach(function(key) {
                $scope.questionList[key].forEach(function(question) {
                    if (question.chooseVal !== 0) {
                        $scope.selfAssessmentResult.answerList.push({
                            id: null,
                            questionId: question.id,
                            answer: question.chooseVal
                        });
                    }
                });
            });

            $scope.selfAssessmentResult.assessmentId = $scope.chooseAss.id;
            $scope.selfAssessmentResult.candidateId = $scope.chooseCandidate.candidate.id;
            $scope.selfAssessmentResult.questionList = [];

            var info = {
                token: employer.token,
                assessmentResult: $scope.selfAssessmentResult
            };

            $employer.submitCandidateAssessment(info, function(result) {
                if (result.status && result.data.result) {
                    $scope.selfAssessmentResult.id = result.data.assessmentId;
                    makeSummaryAssessment();
                    $scope.submitAssessment = true;
                    toastr.success(updateSuccess, alert);
                } else {
                    toastr.error(updateError, alert);
                }
            });
        };

        $scope.cancel = function () {
            if($scope.submitAssessment){
                $scope.assessmentTotal.selfAssessmentResult = $scope.selfAssessmentResult;
                $scope.assessmentTotal.otherAssessmentResultList = $scope.otherAssessmentResult;
                $scope.assessmentTotal.summaryAssessment = $scope.summaryAssessment;
                $uibModalInstance.dismiss($scope.assessmentTotal);
            } else {
                $uibModalInstance.close('close');
            }
        };

        function init() {
            var options = [
                {
                    val: 0,
                    name: $translate.instant('assessment.selectValue')
                },
                {
                    val: 1,
                    name: $translate.instant('assessment.bad')
                },
                {
                    val: 2,
                    name: $translate.instant('assessment.poor')
                },
                {
                    val: 3,
                    name: $translate.instant('assessment.na')
                },
                {
                    val: 4,
                    name: $translate.instant('assessment.good')
                },
                {
                    val: 5,
                    name: $translate.instant('assessment.excellent')
                }];
            $scope.getDetailAssessment();
            if (typeof $scope.assessment === 'undefined') {
                var langu = $translate.use();
                $cache.getAssessment({ lang: langu }, function(result) {
                    if (result.status)
                    {
                        $scope.assessment = result.data.assessment;
                    }
                });
            }
            if($scope.selfAssessmentResult.id) {
                $scope.assessment.questionList.forEach(function(question)
                {
                    question.options = options;
                    question.chooseVal = 0;
                });
            } else {
                $scope.assessment.questionList.forEach(function(question)
                {
                    question.options = options;
                    question.chooseVal = 3;
                });
            }
        }

        init();

        $scope.openReport = function() {
            $scope.chooseCandidate.summaryAssessment = $scope.summaryAssessment;
            $scope.chooseCandidate.questionList = $scope.assessment.questionList;
            $scope.chooseCandidate.groupList = $scope.assessment.groupList;
            $scope.chooseCandidate.chooseAss = $scope.chooseAss;
            var report = {
                candidateId : $scope.chooseCandidate.candidate.id,
                candidate : $scope.chooseCandidate
            };
            $scope.listReport = _.reject($scope.reportCandidates,function(canitem) {
                return canitem.candidateId == $scope.chooseCandidate.candidate.id;
            });
            $scope.listReport.push(report);
            localStorageService.set("chooseCandidateAssessment", $scope.listReport);
            var url = '/#/employer/report/assessment/' + $scope.chooseCandidate.candidate.id;
            $window.open(url, '_blank');
        };

    });
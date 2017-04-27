'use strict';
angular.module('employerModule')
    .controller('TestReportCtrl', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, _, FileSaver, Blob, $common, $log, $cache, blockUI, $routeParams) {
        var alert = $translate.instant('toarster.alert');
        var updateSuccess = $translate.instant('toarster.updateSuccess');
        var updateError = $translate.instant('toarster.updateError');

        var idcandidate = $routeParams.id;
        if(!localStorageService.get('testReport')){
            $location.path("/#/employer/assessment");
        } else {
            var candidateList = localStorageService.get("testReport");
        }

        $scope.reportTest = _.find(candidateList, function(can) {
            return (can.candidateId == idcandidate) && can.candidate;
        });


        var candidate = $scope.reportTest.candidate,
            employer  = $scope.reportTest.employer;
        $scope.chooseAss = JSON.parse($scope.reportTest.chooseAss);
        $scope.chooseInterview = $scope.reportTest.interview;
        $scope.chooseCandidate = candidate;
        $scope.answerlist = $scope.chooseCandidate.answerList;

        function makeTest() {
            $employer.getInterviewQuestion(
            {
                token: employer.token,
                interviewId: $scope.chooseInterview.id
            }, function(result)
            {
                if (result.status)
                {
                    $scope.questionList = result.data.questionList;
                    _.each($scope.questionList,function(questionItem) {
                        var answerQuestion = _.find($scope.answerlist, function(answer)
                        {
                            return answer.questionId === questionItem.id;
                        });
                        questionItem.optionId = answerQuestion.optionId;
                        _.each(questionItem.options,function(option) {
                            if(option.id == questionItem.optionId){
                                option.answer = true;
                            } else {
                                option.answer = false;
                            }
                        });
                    });
                    // console.log($scope.questionList);
                }
            });
        }

        function init() {
            $scope.labels = [$translate.instant('employer.answerTrue'), $translate.instant('employer.answerFalse')];
            $scope.colors = [
              {
                backgroundColor: "rgba(17,153,211, 0.8)",
                pointBackgroundColor: "rgba(17,153,211, 1)",
                pointHoverBackgroundColor: "rgba(17,153,211, 1)",
                borderColor: "rgba(17,153,211, 1)",
                pointBorderColor: '#fff',
                pointHoverBorderColor: "rgba(17,153,211, 1)"
              },"rgba(250,109,33,0.2)"
            ];
            $scope.countPoint = 0;
            $scope.totalQ = 0;
            _.each($scope.answerlist,function(ans) {
                $scope.totalQ++;
                if(ans.score === 1){
                    $scope.countPoint++;
                }
            });
            $scope.data = [$scope.countPoint,$scope.totalQ - $scope.countPoint];
            makeTest();
        }

        init();

        $scope.$on('start-save-report-assessment', function(event, args) {
            blockUI.start();
        });
        $scope.$on('end-save-report-assessment', function(event, args) {
            $scope.$apply(function () { blockUI.stop(); });
        });

    });
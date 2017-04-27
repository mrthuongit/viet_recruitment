'use strict';
angular.module('employerModule')
    .controller('AssessmentReportCtrl', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, _, FileSaver, Blob, $common, $log, $cache, $routeParams, blockUI) {

        var idcandidate = $routeParams.id;
        if(!localStorageService.get('chooseCandidateAssessment')){
            $location.path("/#/employer/assessment");
        } else {
            var candidate = localStorageService.get("chooseCandidateAssessment");
        }

        $scope.reportCandidate = _.find(candidate, function(can) {
            return (can.candidateId == idcandidate) && can.candidate;
        });
        $scope.chooseCandidate = $scope.reportCandidate.candidate;

        function sumAssessment(){
            $scope.chooseCandidate.summaryAssessment.answerList.forEach(function(answer) {
                var ques = _.find($scope.chooseCandidate.questionList, function(question) {
                    return question.id === answer.questionId;
                });
                answer.groupId = ques.groupId;
            });
            $scope.chooseCandidate.groupList.forEach(function(group) {
                group.chooseVal = 0;
                group.total = 0;
                group.data = [];
                _.map($scope.chooseCandidate.summaryAssessment.answerList,function(answer) {
                    if(answer.groupId === group.id){
                        group.chooseVal += answer.answer;
                        group.total += 5;
                    }
                });
            });
            $scope.name1 = $scope.chooseCandidate.groupList[0].name;
            $scope.name2 = $scope.chooseCandidate.groupList[1].name;
            $scope.name3 = $scope.chooseCandidate.groupList[2].name;
            $scope.percent1 = Math.ceil($scope.chooseCandidate.groupList[0].chooseVal / $scope.chooseCandidate.groupList[0].total * 100 * 10) / 10;
            $scope.percent2 = Math.ceil($scope.chooseCandidate.groupList[1].chooseVal / $scope.chooseCandidate.groupList[1].total * 100 * 10) / 10;
            $scope.percent3 = Math.ceil($scope.chooseCandidate.groupList[2].chooseVal / $scope.chooseCandidate.groupList[2].total * 100 * 10) / 10;
            $scope.data1 = [$scope.chooseCandidate.groupList[0].chooseVal , $scope.chooseCandidate.groupList[0].total - $scope.chooseCandidate.groupList[0].chooseVal ];
            $scope.data2 = [$scope.chooseCandidate.groupList[1].chooseVal , $scope.chooseCandidate.groupList[1].total - $scope.chooseCandidate.groupList[1].chooseVal ];
            $scope.data3 = [$scope.chooseCandidate.groupList[2].chooseVal , $scope.chooseCandidate.groupList[2].total - $scope.chooseCandidate.groupList[2].chooseVal ];
        }

        function init() {
            var lang = localStorageService.get('language');
            $translate.use(lang);
        // console.log(lang);
            // console.log($translate.use());
            $scope.label1 = $translate.instant('employer.assignment.Csv.pass');
            $scope.label2 = $translate.instant('employer.assignment.Csv.unPass')
            $scope.labels = [$scope.label1, $scope.label2];

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

            $scope.options0 = { legend: { display: false } };
            $scope.number_pass = 0;
            $scope.total_emp = 1;
            if($scope.chooseCandidate.selfAssessmentResult.shortlist) {
                $scope.number_pass++;
            }
            $scope.chooseCandidate.otherAssessmentResult.forEach(function(otherItem) {
                $scope.total_emp++;
                if(otherItem.shortlist) {
                    $scope.number_pass++;
                }
            });
            if(!$scope.chooseCandidate.selfAssessmentResult.id){
                $scope.total_emp = $scope.total_emp - 1;
            }

            sumAssessment();
        }

        init();

        $scope.$on('start-save-report-assessment', function(event, args) {
            blockUI.start();
        });
        $scope.$on('end-save-report-assessment', function(event, args) {
            $scope.$apply(function () { blockUI.stop(); });
        });

    });
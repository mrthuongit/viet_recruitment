'use strict';

angular.module('interviewQuizModule')
    .controller('QuizController', function($scope, $rootScope, $location, $translate, $quiz, _, $route, $common,$interval,$timeout) {

            var code = sessionStorage.getItem('code');
            var timeoutToken, intervalToken;
            var start  = 0;
            

            var init = function() {
                $scope.index = 0;
                $scope.timeString ="00:00";
                $scope.timePrompt = "";
                $scope.interview = JSON.parse(sessionStorage.getItem("interview"));
                $scope.questionList = JSON.parse(sessionStorage.getItem("questionList"));
                $scope.timeLeft =  sessionStorage.getItem("timeLeft");
                if (!$scope.timeLeft){
                    $scope.timeLeft =  $scope.interview.quizTime *60;
                }

                if ($scope.interview.shuffle) {
                    start = Math.floor((Math.random() * $scope.questionList.length ));
                }
            };
            
            function selectQuestion() {
                var qs = $scope.questionList[start];
                if(qs.done){
                    var next = Math.floor((Math.random() * $scope.questionList.length ));
                    var qn = $scope.questionList[next];
                    if(qn.done){
                        for (var i = 0; i < $scope.questionList.length; ++i) {
                            var q = $scope.questionList[i % $scope.questionList.length];
                            if (q.done){
                                continue;
                            }
                            $scope.index++;
                            $scope.question = q;
                            return;
                        }
                        finishInterview();
                    } else {
                        $scope.index++;
                        $scope.question = qn;
                        return;
                    }
                } else {
                    $scope.index++;
                    $scope.question = qs;
                    return;
                }
            }
            
            function timeToString(seconds) {
                $scope.timeString ="";
                var h = Math.floor(seconds /3600);
                var m = Math.floor((seconds -  h*3600)/60);
                var s = seconds - h*3600-m*60;
                
                if (h>0) {
                    console.log(h);   
                    $scope.timeString +=h +":";
                }
                $scope.timeString += m+":"+s;
            }
     
            function finishInterview() {
                $timeout.cancel(timeoutToken);
                $interval.cancel(intervalToken);
                $quiz.finishQuiz({
                    code: code
                }, function(result) {
                    $location.path("/interview/thankyou");
                    $route.reload();
                });
            }
            

            function startTimer() {
                timeoutToken = $timeout(function() {
                    finishInterview();
                },$scope.timeLeft*1000);
                intervalToken = $interval(function() {
                  $scope.timeLeft--;  
                  timeToString($scope.timeLeft);
                  sessionStorage.setItem("timeLeft",$scope.timeLeft);
                },1000);
                selectQuestion();
            }       
            
            $scope.submitAnswer = function() {
                _.each($scope.question.options,function(option) {
                    if (option.checked) {
                        $quiz.submitQuizAnswer({
                            code: code,
                            questionId: $scope.question.id,
                            optionId: option.id
                        }, function(result) {
                              sessionStorage.setItem("questionList", "$scope.questionList ");
                              $scope.question.done = true;
                              selectQuestion();
                        });
                    }
                });
            };
   
            init();            
            startTimer();

            $scope.updateSelection = function(position, entities) {
                _.each(entities, function(subscription, index) {
                    if (position !== index){ 
                      subscription.checked = false;
                    }
                });
            };
        });
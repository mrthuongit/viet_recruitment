'use strict';

angular.module('interview1wayModule')
    .controller('InterviewController', function($scope, $rootScope, $location, $translate, $interview, _, $route, $common,$interval,$timeout,$log,$element) {

            var code = sessionStorage.getItem('code');
            var timeoutToken, intervalToken, timeLeft;
            var readyButton = $element[0].querySelector('#answerButton');
            var questionVideo = $element[0].querySelector('#questionVideo');
            var timeLeftAnwer = $translate.instant('interview.time-left-anwer');
            var timeLeftThink = $translate.instant('interview.time-left-think');
            var iamdone = $translate.instant('interview.iamdone');
            var ReadAnwer = $translate.instant('interview.ready-Answer');
            var seconds = $translate.instant('interview.sec');
            $scope.recorder = {};


            var init = function() {
                $scope.order = 0;
                $scope.index = 0;
                $scope.timePrompt = "";
                $scope.questionMode =  true;
                $scope.questionList = JSON.parse(sessionStorage.getItem("questionList"));

                for (var i = 0; i < $scope.questionList.length; ++i) {
                    var q = $scope.questionList[i];
                    if (q.order < $scope.order || $scope.order === 0) {
                        $scope.order = q.order;
                    }
                }
               
            };

            var errorHandler = function() {
                $log.info('Error');
                sessionStorage.clear();
                $scope.recorder.close();
                $location.path("/interview/thankyou");
            };
            
            var selectQuestion = function() {
                for (var i = 0; i < $scope.questionList.length; ++i) {
                    var q = $scope.questionList[i];
                    if (q.order === $scope.order) {
                        $scope.index++;
                        $scope.order++;
                        return q;
                    }
                }
                return null;
            };
            
            var startRecording = function() {
                $scope.questionMode =  false;
                $scope.recorder.start();
            };

            var responseeTimeInterval = function() {
                    $scope.timePrompt = timeLeftAnwer + ":  "+timeLeft +" "+  seconds;
                timeLeft--;
            };

            var finishInterview = function() {
                $interview.finishInterview({
                    code: code
                }, function(result) {
                    if (result.status && result.data.result) {
                        $scope.recorder.close();
                        sessionStorage.setItem("stage", "wrapup");
                        $route.reload();
                    } else {
                        errorHandler();
                    }
                });
            };

            var prepareTimerEnded = function() {
                $log.info("Stop prepare timer");
                $timeout.cancel(timeoutToken);
                $interval.cancel(intervalToken);
                timeoutToken = $timeout(responseTimerEnded, $scope.question.response * 60 * 1000);
                timeLeft = $scope.question.response * 60;
                intervalToken = $interval(responseeTimeInterval, 1 * 1000);
                $log.info("Start response timer");
                readyButton.onclick = readyToSubmit;
                readyButton.value = iamdone;
                startRecording();
            };

            var readyToAnswer = function() {
                prepareTimerEnded();
            };

            var prepareTimeInterval = function() {
                    $scope.timePrompt = timeLeftThink +":  "+ timeLeft + " "+seconds;
                timeLeft--;
            }; 

            var startPrepareTimer = function() {
                readyButton.onclick = readyToAnswer;
                readyButton.value = ReadAnwer;
                readyButton.disabled = false;
                $log.info("Start prepare timer");
                timeoutToken = $timeout(prepareTimerEnded, $scope.question.prepare * 60 * 1000);
                timeLeft = $scope.question.prepare * 60;
                intervalToken = $interval(prepareTimeInterval, 1 * 1000);
            };

            var finishShowingVideoQuestion = function() {
                questionVideo.removeEventListener('ended', startPrepareTimer);
                startPrepareTimer();
            }; 

            var startQuestion = function() {
                $scope.questionMode =  true;
                $scope.question = selectQuestion();
                if ($scope.question === null){
                    finishInterview();
                } else {
                    if ($scope.question.type === 'text') {
                        questionVideo.src = null;
                        questionVideo.poster = 'assets/images/logow.png';
                        startPrepareTimer();
                    } else {
                        questionVideo.addEventListener('ended', finishShowingVideoQuestion, false);
                        questionVideo.src = $scope.question.videoUrl;
                        if(!questionVideo.src) {
                            questionVideo.poster = 'assets/images/logow.png';
                        }
                        questionVideo.autoplay = true;
                        questionVideo.controls = false;
                    }
                }
            };         

            var stopRecording = function() {
                var callback = function(file) {
                    $scope.recorder.video.autoplay = false;
                    $common.uploadVideo({
                        file: file
                    }, function(result) {
                        $log.info(result);
                        $log.info(result.data);
                        if (result.status && result.data.result) {
                            $interview.answerInterviewQuestion({
                                code: code,
                                questionId: $scope.question.id,
                                videoUrl: result.data.url
                            }, function(result) {
                                if (result.status && result.data.result) {
                                    startQuestion();
                                } else {
                                    errorHandler();
                                }
                            });
                        } else {
                            errorHandler();
                        }
                    });
                };
                $scope.recorder.stop(callback);
            };
                     
            var responseTimerEnded = function() {
                    readyButton.onclick = null;
                    readyButton.disabled = true;
                    $log.info("Stop response timer");
                    $timeout.cancel(timeoutToken);
                    $interval.cancel(intervalToken);
                    stopRecording();
                };
                
            var readyToSubmit = function() {
                responseTimerEnded();
            };           
            
            $scope.$on('camera-on',function() {
				$scope.recorder.video.autoplay = true;
				$scope.recorder.video.controls = false;
				$scope.recorder.video.muted = true;
				$scope.recorder.actionBar = false;
				$scope.recorder.timerBar = true;
			});
            
            init();
            
            startQuestion();

        });
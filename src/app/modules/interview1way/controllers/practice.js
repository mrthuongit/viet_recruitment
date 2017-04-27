'use strict';

angular.module('interview1wayModule')
    .controller(
        'InterviewPracticeController',
        function($scope, $rootScope, $translate, $location, _,$route, $common,$interval,$timeout,$log, $element) {

            // var code = sessionStorage.getItem('code');
            var timeoutToken,intervalToken,timeLeft;
            var readyButton = $element[0].querySelector('#answerButtonPractice');
            var tellme = $translate.instant('interview.tellme');
            var timeLeftAnwer = $translate.instant('interview.time-left-anwer');
            var timeLeftThink = $translate.instant('interview.time-left-think');
            var iamdone = $translate.instant('interview.iamdone');
            var seconds = $translate.instant('interview.sec');
            var readyAnswer = $translate.instant('interview.ready-Answer');
            
            $scope.$on('camera-on',function() {
                $scope.recorder.video.autoplay = true;
                $scope.recorder.video.controls = false;
                $scope.recorder.video.muted = true;
                $scope.recorder.actionBar = false;
                $scope.recorder.timerBar = true;
            });
            
            
            var init = function() {
                $scope.order = 0;
                $scope.index = 1;
                $scope.practice =  false;
                $scope.recorder = {};
                $scope.showQuestion =  true;
                $scope.timePrompt  = "";
                $scope.questionList = 
                    [{"id":1,
                       "order":1,
                       "source":"manual",
                       "type":"text",
                       "response":1,
                       "retry":0,
                       "title": tellme
                    
                    }];
                for (var i = 0; i < $scope.questionList.length; ++i) {
                    var q = $scope.questionList[i];
                    if (q.order < $scope.order  || $scope.order === 0) {
                        $scope.order = q.order;
                    }
                }
            };          
            var selectQuestion = function() {
                return $scope.questionList[0];
            };  

            var startRecording = function () {
              $scope.recorder.start();
            };  

            var stopRecording = function () {
                var callback = function() {
                    $scope.practice =  false;
                    $scope.recorder.video.controls = false;
                    $scope.recorder.video.autoplay = true;
                    
                    $scope.$apply();
                };
                $scope.recorder.stop(callback);
                
            };                              
            var responseTimerEnded =  function () {
                readyButton.onclick =  null;
                readyButton.disabled = true;
                $log.info("Stop response timer");
                $timeout.cancel(timeoutToken); 
                $interval.cancel(intervalToken); 
                stopRecording();
            };      

            var readyToSubmit = function() {
                responseTimerEnded();
            };  

            var responseeTimeInterval = function(){
                    $scope.timePrompt = timeLeftAnwer + "  " + timeLeft + " seconds";
                timeLeft--;
            };

            var prepareTimerEnded =  function () {
                $log.info("Stop prepare timer");
                $timeout.cancel(timeoutToken); 
                $interval.cancel(intervalToken); 
                timeoutToken = $timeout(responseTimerEnded, $scope.question.response*60*1000);
                timeLeft =  $scope.question.response*60;
                intervalToken = $interval(responseeTimeInterval,1*1000);
                $log.info("Start response timer");
                readyButton.onclick = readyToSubmit;
                readyButton.value = iamdone;
                startRecording();
            };
            var prepareTimeInterval = function(){
                    $scope.timePrompt = timeLeftThink + "  " + timeLeft + " " + seconds;
                timeLeft--;
            };
            var readyToAnswer = function() {
                prepareTimerEnded();
            };

            var startPrepareTimer = function(){
                readyButton.onclick = readyToAnswer;
                readyButton.value = readyAnswer;
                readyButton.disabled = false;
                $log.info("Start prepare timer");
                timeoutToken = $timeout(prepareTimerEnded, 1*60*1000);
                timeLeft = 60;
                intervalToken = $interval(prepareTimeInterval,1*1000);
            };

            var finishShowingVideoQuestion =  function() {
                $scope.showQuestion =  false;
                $scope.recorder.video.removeEventListener('ended',startPrepareTimer);
                startPrepareTimer();
            };

            var startQuestion = function()  {
                $scope.question = selectQuestion();             
                if ($scope.question.type==='text') {
                    startPrepareTimer();
                } else {
                    $scope.recorder.video.addEventListener('ended',finishShowingVideoQuestion,false);
                    $scope.recorder.video.src = $scope.question.videoUrl;
                    $scope.showQuestion =  false;
                }
                
            };                              
                                                                    
            var startPractice =  function() {
                $scope.practice =  true;
                startQuestion();                    
            };
            
            $scope.proceedInterview =  function() {
                sessionStorage.setItem("stage","interview");
                $timeout.cancel(timeoutToken); 
                $interval.cancel(intervalToken);                 
                $route.reload();        
            };
            
            $scope.continuePractice =  function() {
                $scope.practice =  true;
                $scope.recorder.video.src = null;
                $scope.recorder.timerBar = false;
                $scope.recorder.video.poster = 'assets/images/logow.png';
                startQuestion();        
            };
            
            init();
            startPractice();
    
});
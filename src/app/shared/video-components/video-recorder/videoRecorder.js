"use strict";

angular.module('app')
.directive('videoAutoplay', function() {
    return {
    link: function($scope, $element, $attrs) {
        $scope.$watch(
            function () { return $element.attr('data-attr-autoplay'); },
            function (newVal) { 
                if ($scope.$eval(newVal)) {
                    $element[0].autoplay = true;
                }
                else {
                    $element[0].autoplay = false;
                }
            }
        );
        }
    };
})
.directive('videoControl', function() {
    return {
    link: function($scope, $element, $attrs) {
        $scope.$watch(
            function () { return $element.attr('data-attr-control'); },
            function (newVal) { 
                if ($scope.$eval(newVal)) {
                    $element[0].controls = true;
                }
                else {
                    $element[0].controls = false;
                }
            }
        );
        }
    };
})
.directive('videoMuted', function() {
    return {
    link: function($scope, $element, $attrs) {
        $scope.$watch(
            function () { return $element.attr('data-attr-muted'); },
            function (newVal) { 
                if ($scope.$eval(newVal)) {
                    $element[0].muted = true;
                }
                else {
                    $element[0].muted = false;
                }
            }
        );
        }
    };
})
.directive('videoRecorder', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/video-components/video-recorder/videoRecorder.html',
        controllerAs: 'ctrl',
        scope: {
            control: '=?control'
        },

        controller: function($rootScope, $scope, $common, deviceDetector, $sce,$log) {

            var mediaSource = new MediaSource();
            var webcam = document.getElementById('webcam');
            var mediaRecorder;
            var recordedBlobs;
            var sourceBuffer;
            var handleSourceOpen = function(event) {
                $log.info('MediaSource opened');
                sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
            };
            
            var onDataAvail = null;

            var constraints = {
                audio: true,
                video: true
            };

            var handleSuccess = function(stream) {
                $log.info('getUserMedia() got stream: ', stream);
                $scope.control.stream = stream;
                if (window.URL) {
                    $scope.videoUrl = window.URL.createObjectURL(stream);
                } else {
                    $scope.videoUrl  = $sce.trustAsResourceUrl(stream);
                }
                $rootScope.$broadcast('camera-on');
            };
            
            var handleDataAvailable = function(event) {
                if (event.data && event.data.size > 0) {
                    recordedBlobs.push(event.data);
                }
                if (deviceDetector.browser==='firefox' && !$scope.recordMode) {
                	var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.control.file = new File([superBuffer],  new Date().getTime()+"upload.webm");
                    $scope.videoUrl = window.URL.createObjectURL(superBuffer);
                    if (onDataAvail) {
                    	onDataAvail($scope.control.file);
                    }
                }
            };
            
            var handleError = function(error) {
                $log.info('navigator.getUserMedia error: ', error);
            };
            
            var handleStop = function(event) {
                $log.info('Recorder stopped: ', event);
            };

            $scope.startRecording = function() {
            	if ($scope.recordMode) {
            		return;
                }
            	$scope.$broadcast('timer-start');
                var stream = $scope.control.stream ;
                if (window.URL) {
                    $scope.videoUrl = window.URL.createObjectURL(stream);
                } else {
                    $scope.videoUrl = $sce.trustAsResourceUrl(stream);
                }
                recordedBlobs = [];
                var options = {
                    mimeType: 'video/webm;codecs=vp9'
                };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    $log.info(options.mimeType + ' is not Supported');
                    options = {
                        mimeType: 'video/webm;codecs=vp8'
                    };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        $log.info(options.mimeType + ' is not Supported');
                        options = {
                            mimeType: 'video/webm'
                        };
                        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                            $log.info(options.mimeType + ' is not Supported');
                            options = {
                                mimeType: ''
                            };
                        }
                    }
                }
                try {
                    mediaRecorder = new MediaRecorder(stream, options);
                } catch (e) {
                    console.error('Exception while creating MediaRecorder: ' + e);
                    console.error('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType);
                    return;
                }
                $log.info('Created MediaRecorder', mediaRecorder, 'with options', options);
                mediaRecorder.onstop = handleStop;
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.start(10);
                $scope.recordMode = true;
                $scope.timerBar = true;
                $scope.videoAttr = {
                        autoplay:true,
                        controls:false,
                        muted:true
                };
            };

            $scope.stopRecording = function(callback) {
            	onDataAvail =  callback;
            	$scope.$broadcast('timer-stop');
                try {
                	mediaRecorder.stop();
                } catch (e) {
                	console.error('Exception while closing MediaRecorder: ' + e);
                }
                $log.info('Recorded Blobs: ', recordedBlobs);
                $scope.videoAttr = {
                        autoplay:false,
                        controls:true,
                        muted:false
                };
                $scope.recordMode = false;
                if (deviceDetector.browser==='chrome') {
                	var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.control.file = new File([superBuffer], new Date().getTime()+"upload.webm" );
                    $scope.videoUrl = window.URL.createObjectURL(superBuffer);
                    if (onDataAvail){
                    	onDataAvail($scope.control.file);
                    }
                }
            };

            $scope.clearVideo = function() {
                $scope.videoUrl = null;
                $scope.file = null;
            };
            
          
            

            $scope.closeCamera = function() {
                try {
                    $log.info("Close camera");
                    $scope.control.stream.getVideoTracks()[0].stop();
                } catch (e) {

                }
            };

            var init = function() {
                navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);
                mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
                $scope.recordMode = false;
                $scope.videoAttr = {
                        autoplay:false,
                        controls:false,
                        muted:true
                };
                $scope.control = {
                        video: $scope.videoAttr,
                        stop: $scope.stopRecording,
                        start: $scope.startRecording,
                        close: $scope.closeCamera,
                        file: null,
                        stream:null,
                        actionBar: true,
                        timerBar: true
                    };     
            };
            
            $scope.$on('$destroy', function(next, current) {
            	$scope.closeCamera();
            });
   
            init();
        
            

        }
    };
});
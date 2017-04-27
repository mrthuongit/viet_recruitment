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
.directive('videoSelector', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/video-components/video-selector/videoSelector.html',
        controllerAs: 'ctrl',
        scope: {
            videoUrl: '=url',
            localFile: '=file',
            control: "="

        },
        controller: function($rootScope,$scope, $common, $element, $sce,deviceDetector,$log) {

            var mediaSource = new MediaSource();
            var mediaRecorder;
            var recordedBlobs;
            var sourceBuffer;
            var onDataAvail = null;
            var handleSourceOpen = function() {
                $log.info('MediaSource opened');
                sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
                $log.info('Source buffer: ', sourceBuffer);
            };
           
            var constraints = {
                audio: true,
                video: true
            };
            
            $scope.selectFileUpload = function(files) {
                $scope.localFile = files[0];
                var fileURL = URL.createObjectURL(files[0]);
                $scope.videoUrl = fileURL;
            };
            
            $scope.toggleRecord = function() {
                $scope.showRecordControl = !$scope.showRecordControl;
            };

            var handleSuccess = function(stream) {
                $log.info('getUserMedia() got stream: ', stream);
                $scope.stream = stream;
                $rootScope.$broadcast('camera-on');
               
            };
            var handleDataAvailable = function(event) {
                if (event.data && event.data.size > 0) {
                    recordedBlobs.push(event.data);
                }
                if (deviceDetector.browser === 'firefox' && !$scope.recordMode) {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.localFile = new File([superBuffer],  new Date().getTime()+"upload.webm");
                    $scope.videoUrl = window.URL.createObjectURL(superBuffer);
                    if (onDataAvail){
                        onDataAvail($scope.localFile);
                    }
                }
            };
            
            var handleStop = function(event) {
                $log.info('Recorder stopped: ', event);
            };
            
            var handleError = function(error) {
                $log.info('navigator.getUserMedia error: ', error);
            };
  
            $scope.startRecording = function() {
                if ($scope.recordMode){
                    return;
                }
                navigator.mediaDevices.getUserMedia(constraints)
                .then(handleSuccess)
                .then(function() {
                    var stream = $scope.stream;
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
                    $scope.$broadcast('timer-start');
                    $scope.videoAttr = {
                            autoplay:true,
                            controls:false,
                            muted:true
                    };
                    $scope.$apply();
                }).catch(handleError);
            };

            $scope.stopRecording = function(callback) {
                onDataAvail = callback;
                $scope.$broadcast('timer-stop');
                try {
                    mediaRecorder.stop();
                } catch (e) {
                    console.error('Exception while closing MediaRecorder: ' + e);
                }
                $log.info('Recorded Blobs: ', recordedBlobs);
                $scope.videoAttr = {
                        autoplay:true,
                        controls:true,
                        muted:false
                };
                $scope.recordMode = false;
                $scope.timerBar = false;
                if (deviceDetector.browser === 'chrome') {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.localFile = new File([superBuffer], new Date().getTime()+"upload.webm" );
                    $scope.videoUrl = window.URL.createObjectURL(superBuffer);
                    if (onDataAvail){
                        onDataAvail($scope.localFile);
                    }
                }
                $scope.closeCamera();
            };

            $scope.clearVideo = function() {
                $scope.videoUrl = null;
                $scope.localFile = null;
            };
            
            $scope.closeCamera =  function() {
                try {
                    $log.info("Close camera");
                    $scope.stream.getVideoTracks()[0].stop();
                } catch (e) {
                    
                }
            };

            var init = function() {
                mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
                $scope.recordMode = false;
                $scope.timerBar = false;
                $scope.showRecordControl = false; 
                $scope.videoAttr = {
                        autoplay:false,
                        controls:true,
                        muted:false
                };

                $scope.control = {
                        video:$scope.videoAttr,
                        close:$scope.closeCamera
                };
            };
            
            $scope.$on('$destroy', function() {
                $scope.closeCamera();
            });
            
            init();
        }
    };
});
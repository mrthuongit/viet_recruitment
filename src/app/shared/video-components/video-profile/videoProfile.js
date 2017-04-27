"use strict";

angular.module('app').directive('videoProfile', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/video-components/video-profile/videoProfile.html',
        controllerAs: 'ctrl',
        scope: {
            url: '=',
            avatar: '='
        },
        controller: function($rootScope,$scope, $q, $common, $element, $sce, $log, $timeout, deviceDetector) {
            var width       = 320,
                height      = 0,
                photoBase64 = null,
                video       = null,
                canvas      = null,
                photo       = null,                
                mediaSource = new MediaSource(),
                webcam      = document.querySelectorAll('video#webcam')[0],
                mediaRecorder,
                recordedBlobs,
                sourceBuffer;

            var constraints = {
                    audio: true,
                    video: true
                };

            var handleSourceOpen = function() {
                sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
            };         

            var handleSuccess = function(stream) {
                var defered = $q.defer();

                $scope.stream = stream;
                $rootScope.$broadcast('camera-on');

                defered.resolve();
                return defered.promise;
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
                    $scope.videoUrl = $sce.trustAsResourceUrl(window.URL.createObjectURL(superBuffer));
                    $rootScope.$broadcast('data-avao;');
                }
            };
            
            var handleStop = function(event) {
                $log.info('Recorder stopped: ', event);
            };
            
            var handleError = function(error) {
                $log.info('navigator.getUserMedia error: ', error);
            };
  
            $scope.startRecording = function() {
                $scope.$broadcast('timer-clear');
                $scope.$broadcast('timer-start');
                navigator.mediaDevices
                .getUserMedia(constraints)
                .then(handleSuccess)
                .then(function() {
                    $scope.timerBar = true; 
                    $scope.$apply();
                    if ($scope.recordMode){
                        return;
                    }
                    var stream = $scope.stream;
                    if (window.URL) {
                        $scope.videoUrl = $sce.trustAsResourceUrl(window.URL.createObjectURL(stream));
                    } else {
                        $scope.videoUrl = $sce.trustAsResourceUrl(stream);
                    }
                    $scope.$apply();                   
                    recordedBlobs = [];
                    var options = {
                        mimeType: 'video/webm;codecs=vp9'
                    };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        options = {
                            mimeType: 'video/webm;codecs=vp8'
                        };
                        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                            options = {
                                mimeType: 'video/webm'
                            };
                            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
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
                    mediaRecorder.onstop = handleStop;
                    mediaRecorder.ondataavailable = handleDataAvailable;
                    mediaRecorder.start(10);
                    $scope.recordMode = true;
                    $scope.$apply();
                    webcam.autoplay = true;
                    webcam.controls = false;
                    webcam.muted = true;
                })
                .catch(handleError);
            };

            $scope.takepicture = function() {
                video = document.getElementById('webcam');
                canvas = document.createElement("CANVAS");
                photo = document.getElementById('photo');
                height = video.videoHeight / (video.videoWidth/width);
                var context = canvas.getContext('2d');                

                if (width && height) {
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(video, 0, 0, width, height);

                    photoBase64 = canvas.toDataURL('image/png');
                    $scope.photoBase64 = photoBase64;
                    photo.setAttribute('src', photoBase64);
                } else {
                    // clearphoto();
                }
            };

            $scope.saveAvatar = function() {
                $rootScope.$broadcast('photoBase64', $scope.photoBase64);
            };

            $scope.stopRecording = function() { 
                $scope.$broadcast('timer-stop');
                try {
                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    }                        
                } catch (e) {
                    console.error('Exception while closing MediaRecorder: ' + e);
                }
                webcam.controls = true;
                webcam.autoplay = true;
                webcam.muted = false;
                $scope.recordMode = false;
                $scope.timerBar = false;
                if (deviceDetector.browser === 'chrome') {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.localFile = new File([superBuffer], new Date().getTime()+"upload.webm" );
                    $scope.videoUrl = $sce.trustAsResourceUrl(window.URL.createObjectURL(superBuffer));
                }
                var stream  = $scope.stream,
                    track   = stream.getTracks()[0];

                track.stop();
            };

            $scope.saveVideo = function() {
                if ($scope.localFile) {
                    var file = $scope.localFile;
                    $common.uploadVideo({ file: file }, function(result) {
                        if (result.status && result.data.result) {
                            $rootScope.$broadcast('url', result.data.url);
                        }
                    });
                }
            };

            $scope.clearVideo = function() {
                $scope.videoUrl = null;
                $scope.localFile = null;
            };
            
            $scope.closeCamera =  function() {
                try {
                    $scope.stream.getVideoTracks()[0].stop();
                } catch (e) {
                    
                }
            };
                        
            $scope.$on('$destroy', function() {
                $scope.closeCamera();
            });

            var init = function() {
                mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
                $scope.recordMode = false;
                $scope.timerBar = false;
                $scope.showRecordControl = false; 
                webcam.autoplay = false;
                webcam.controls = true;
                webcam.volume = 0.8;
                $scope.control = {
                    close:$scope.closeCamera
                };

                if ($scope.url) {
                    $scope.videoUrl = $sce.trustAsResourceUrl($scope.url);
                }

                $scope.startRecording();
            };
            
            init();            
        }
    };
});
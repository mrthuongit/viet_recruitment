"use strict";
angular.module('app').directive('videoCall', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/video-components/video-call/videoCall.html',
        scope: {
            moderator: '@',
            candidate: '@',
            meetingId: '@',
            memberId: '@',
            role: '@',
            control: '=?control'
        },
        controller: function($rootScope, $scope, deviceDetector, $callSocket, $interval, $sce, $translate,$log,iceServers,$window,$one2oneDirect, _) {
            var mediaRecorder;
            var recordedBlobs;
            // var sourceBuffer;
            var onRecordDataReady;
            var remoteStream = null;
            var localStream = null;
            var localWebcam = document.getElementById('localCamera');
            var remoteWebcam = document.getElementById('remoteCamera');

            function sendMessage(message) {
                message.memberId = $scope.memberId;
                message.meetingId = $scope.meetingId;
                var jsonMessage = JSON.stringify(message);
                $log.info('Senging training message: ' + jsonMessage);
                try {
                    $callSocket.send(jsonMessage);
                } catch (exc) {
                    $log.info('Error sending message: ',message );
                    $window.location.reload();
                }
            };

            $scope.toggleAudio = function() {

                if (localWebcam && localStream) {
                    var audioTrack = localStream.getAudioTracks()[0];
                    $scope.audio = !$scope.audio;
                    audioTrack.enabled = $scope.audio;
                }
            };
            $scope.toggleVideo = function() {

                if (localWebcam && localStream) {
                    var videoTrack = localStream.getVideoTracks()[0];
                    $scope.video = !$scope.video;
                    videoTrack.enabled = $scope.video;
                }
            };
            var handleDataAvailable = function(event) {
                if (event.data && event.data.size > 0) {
                    recordedBlobs.push(event.data);
                }
                if (deviceDetector.browser === 'firefox' && !$scope.recordMode) {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.control.file = new File([superBuffer], "upload.webm");
                    onRecordDataReady($scope.control.file);
                }
            };
            var handleStop = function(event) {
                $log.info('Recorder stopped: ', event);
            };
            $scope.startRemoteRecording = function() {
                if ($scope.recordMode) {
                    return;
                }
                recordedBlobs = [];
                var options = {
                    mimeType: 'video/webm;codecs=vp8'
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
                    mediaRecorder = new MediaRecorder(remoteStream, options);
                } catch (e) {
                    $log.error('Exception while creating MediaRecorder: ' + e);
                    $log.error('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType);
                    return;
                }
                $log.info('Created MediaRecorder', mediaRecorder, 'with options', options);
                mediaRecorder.onstop = handleStop;
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.start(10);
                $scope.recordMode = true;
            };
            $scope.stopRemoteRecording = function(callback) {
                onRecordDataReady = callback;
                mediaRecorder.stop();
                $log.info("Stop recording", recordedBlobs);
                $scope.recordMode = false;
                // For Firefox, the browser buffer media data and release upon stop recording
                // For Chrome, the browser release data whenever it is available
                if (deviceDetector.browser === 'chrome') {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.control.file = new File([superBuffer], "upload.webm");
                    onRecordDataReady($scope.control.file);
                }
            };

            $rootScope.$on('$routeChangeStart', function (event, next, current) {
              if (!current) {
                  $callSocket.close();
                  if (remoteStream) {
                    var track = remoteStream.getTracks()[0];
                    track.stop();
                  }
                      
              }
            });

            function init() {
                $scope.bitrate = 256;
                if ($scope.role === 'moderator') {
                    $scope.remoteParty = JSON.parse($scope.candidate);
                    $scope.localParty = JSON.parse($scope.moderator);
                    $scope.remoteParty.title = $translate.instant("conference.candidate");
                    $scope.localParty.title = $translate.instant("conference.interviewer");
                }
                if ($scope.role === 'candidate') {
                    $scope.localParty = JSON.parse($scope.candidate);
                    $scope.remoteParty = JSON.parse($scope.moderator);
                    $scope.remoteParty.title = $translate.instant("conference.interviewer");
                    $scope.localParty.title = $translate.instant("conference.candidate");
                }
                $scope.recordMode = false;
                $scope.control = {
                    stopRemoteRecording: $scope.stopRemoteRecording,
                    startRemoteRecording: $scope.startRemoteRecording,
                    file: null,
                };

                $callSocket.on('joinResponse',joinResponse);
                $callSocket.on('memberStatus',peerConnect);
                var token = $interval(function() {
                   if ($callSocket.instance.readyState == 1) {
                       sendMessage({id:'join'});
                       $interval.cancel(token);
                   }
                },1000 );
            }

            function joinResponse(message) {
                if (message.response != 'accepted')
                    $window.location.reload();

            };

           function peerConnect(message) {
                 var memberList = message.memberList;
                 if (memberList.length==2) {
                     if ($scope.role=='moderator') {
                         $one2oneDirect.initiateCall(localWebcam,remoteWebcam,$scope.memberId,$scope.meetingId,function(localS, remoteS) {
                           localStream = localS;  
                           remoteStream = remoteS;
                         });
                     }
                     if ($scope.role=='candidate') {
                         $one2oneDirect.waitForCall(localWebcam,remoteWebcam,$scope.memberId,$scope.meetingId,function(localS, remoteS) {
                           localStream = localS;  
                           remoteStream = remoteS;
                         });
                     }
                 }
           }

            init();
        }
    };
});

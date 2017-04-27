"use strict";

angular.module('api').factory('$one2oneDirect', function(http,$log,iceServers,$timeout,$interval, $one2oneDirectSocket)
{
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
    window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

    var iceCandidateToken = null;
    var sdpAnswer = null;
    var sdpOffer = null;
    var localStream = null;
    var iceCandidateList = [];
    var peerConnection = null;
    
    function sendMessage(message,callback) {
        var jsonMessage = JSON.stringify(message);
        $log.info('Sending streaming message: ' + jsonMessage);
        if ($one2oneDirectSocket.readyState!=1) {
            return;
        }
        try {   
            $one2oneDirectSocket.send(jsonMessage);
        } catch (exc) {
            $log.info('Error sending message: ',message );
        }
    };
     
    return {
        initiateCall: function(localVideo,remoteVideo,localId,connectionId,callback)
        {
          sdpAnswer = null;
          iceCandidateList = [];
          peerConnection = null;
          if (iceCandidateToken)
            $interval.cancel(iceCandidateToken);
            var message = {
                    id: 'bind',
                    memberId:localId,
                    meetingId:connectionId
             };
            sendMessage(message);            
            function onIceCandidate(event) {
              if (event.candidate != null) {
                var message = {
                    id: 'iceCandidate',
                    memberId:localId,
                    meetingId:connectionId,
                    candidate: event.candidate
                };
                sendMessage(message);
              }                
            }
            
            $one2oneDirectSocket.onmessage = function(message) {
                var parsedMessage = JSON.parse(message.data);
                console.info('Received message: ' + message.data);
                switch (parsedMessage.id) {
                    case 'answer':
                        peerConnection.setRemoteDescription(new RTCSessionDescription(parsedMessage.sdpAnswer), function() {
                          sdpAnswer = parsedMessage.sdpAnswer;
                      });
                        break;
                    case 'iceCandidate':
                        var candidate = parsedMessage.candidate;
                        iceCandidateList.push(candidate);
                        break;
                    default:
                        console.error('Unrecognized message', parsedMessage);
                    }
            };            
            
            iceCandidateToken = $interval(function() {
                if (sdpAnswer) {
                  if (iceCandidateList.length) {
                    console.log('Process candidate by interval');
                    var candidate = iceCandidateList.splice(0,1);
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate[0]));
                  }
              } 
            },100);

            var pc_config = {iceServers: iceServers};
            navigator.getUserMedia( { audio:true,  video:true }, getUserMediaSuccess, getUserMediaError);
            function getUserMediaSuccess(stream) {
              localStream = stream;
              localVideo.src = window.URL.createObjectURL(stream);
              peerConnection = new RTCPeerConnection(pc_config);
              peerConnection.onicecandidate = onIceCandidate;
              peerConnection.onaddstream = gotRemoteStream;
              peerConnection.addStream(stream);
              peerConnection.createOffer(gotDescription, createOfferError);
            }
            
            function getUserMediaError(error) {
                  console.log('Get media error', error);
                  return;
            }
            
            function gotDescription(description) {
              peerConnection.setLocalDescription(description, function () {
                var message = {
                    id: 'offer',
                    sdpOffer: description,
                    memberId:localId,
                    meetingId:connectionId
                };
                sendMessage(message);
              }, function() {console.log('set description error')});
          }
            
            function gotRemoteStream(event) {
              console.log('got remote stream');
              remoteVideo.src = window.URL.createObjectURL(event.stream);
              callback(localStream, event.stream);
          }
            
            function createOfferError(error) {
              console.log(error);
          }
        },        
        waitForCall: function(localVideo,remoteVideo,localId,connectionId,callback){
          sdpOffer = null;
          iceCandidateList = [];
          peerConnection = null;
          if (iceCandidateToken)
            $interval.cancel(iceCandidateToken);
            var message = {
                    id: 'bind',
                    memberId:localId,
                    meetingId:connectionId
             };
            sendMessage(message);
            
            function onIceCandidate(event) {
              if (event.candidate != null) {
                var message = {
                    id: 'iceCandidate',
                    memberId:localId,
                    meetingId:connectionId,
                    candidate: event.candidate
                };
                sendMessage(message);
              }                
            }
            
            $one2oneDirectSocket.onmessage = function(message) {
                var parsedMessage = JSON.parse(message.data);
                console.info('Received message: ' + message.data);
                switch (parsedMessage.id) {
                    case 'offer':   
                        peerConnection.setRemoteDescription(new RTCSessionDescription(parsedMessage.sdpOffer), function() {
                          sdpOffer = parsedMessage.sdpOffer;
                              peerConnection.createAnswer(gotDescription, createAnswerError);
                          
                      });
                        break;
                    case 'iceCandidate':
                        var candidate = parsedMessage.candidate;
                        iceCandidateList.push(candidate);                        
                        break;
                    default:
                        console.error('Unrecognized message', parsedMessage);
                    }
            };
            iceCandidateToken = $interval(function() {
                if (sdpOffer) {
                  if (iceCandidateList.length) {
                    console.log('Process candidate by interval');
                    var candidate = iceCandidateList.splice(0,1);
                    peerConnection.addIceCandidate(new RTCIceCandidate(candidate[0]));
                  }
              } 
            },100);
            
            var pc_config = {iceServers: iceServers};
            navigator.getUserMedia( { audio:true,  video:true }, getUserMediaSuccess, getUserMediaError);
            function getUserMediaSuccess(stream) {
              localStream = stream;
              localVideo.src = window.URL.createObjectURL(stream);
              peerConnection = new RTCPeerConnection(pc_config);
              peerConnection.onicecandidate = onIceCandidate;
              peerConnection.onaddstream = gotRemoteStream;
              peerConnection.addStream(stream);
            }
            
            function getUserMediaError(error) {
                  console.log('Get media error', error);
                  return;
            }
            
            function gotDescription(description) {
              peerConnection.setLocalDescription(description, function () {
                var message = {
                    id: 'answer',
                    sdpAnswer: description,
                    memberId:localId,
                    meetingId:connectionId
                };
                sendMessage(message);
              }, function() {console.log('set description error')});
          }
            
            function gotRemoteStream(event) {
              console.log('got remote stream');
              remoteVideo.src = window.URL.createObjectURL(event.stream);
              callback(localStream, event.stream);
          }
            
            function createAnswerError(error) {
              console.log(error);
          }
            
        }
    }
});
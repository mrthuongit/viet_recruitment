"use strict";

angular.module('api').factory('$one2one', function(http,$log,iceServers,$timeout,$one2oneSocket)
{
    // publication
    var PUB_INITIAL = 0;
    var PUB_INPROGRESS = 1;
    var PUB_CONNECTING = 2;
    var PUB_CONNECTED = 3;
    
    // subscription
    var SUB_INITIAL = 10;
    var SUB_INPROGRESS = 11;
    var SUB_CONNECTING = 12;
    var SUB_CONNECTED = 13;
    
    var GATHER_TIMEOUT = 30*1000;
    var CALLING_TIMEOUT = 30*1000;
    
    var publishMap = {};
    var subscriptionMap = {};
    
    $one2oneSocket.onmessage = function(message) {
        var parsedMessage = JSON.parse(message.data);
        console.info('Received message: ' + message.data);
        switch (parsedMessage.id) {
            case 'publishResponse':
                publishResponse(parsedMessage);
                break;
            case 'subscribeResponse':
                subscribeResponse(parsedMessage);
                break;
            default:
                console.error('Unrecognized message', parsedMessage);
            }
    };
    
    function Channel(publisherId,source,bitrate)
    {
        this.bitrate = bitrate;
        this.webRtcEndpoint = null;
        this.sdpOffer = null;
        this.publisherId = publisherId;
        this.source = source;
        this.state = PUB_INITIAL;
        this.callSetupToken = null;
        this.callConnectToken = null;
        this.candidateSendQueue =  [];  
    }
    
    Channel.prototype.release = function()
    {
        $timeout.cancel(this.callSetupToken);
        try {
            if (this.webRtcEndpoint)
                this.webRtcEndpoint.dispose();
        } catch (e) {
            $log.error(e);
        }
    }
    
    function Subscription(channel,bitrate)
    {
        this.bitrate = bitrate;
        this.channel = channel;
        this.webRtcEndpoint = null;
        this.sdpOffer = null;
        this.state = SUB_INITIAL;
        this.callSetupToken = null;
        this.callConnectToken = null;
        this.candidateSendQueue =  [];
    }
    
    Subscription.prototype.release = function()
    {
        if (this.callSetupToken)
            $timeout.cancel(this.callSetupToken);
        try {
            if (this.webRtcEndpoint)
                this.webRtcEndpoint.dispose();
        } catch (e) {
            $log.error(e);
        }
    }
    
    function onPublishIceCandidate(candidate) {
        this.channel.candidateSendQueue.push(candidate);
    }

    function onPublish(error, sdpOffer) {
        if (error) {
            $log.info(error);
            this.callback(error);
            return;
        }
        this.channel.sdpOffer = sdpOffer;        
    }

    function publishResponse(message) {
        var publisherId = message.publisherId;
        var source = message.source;
        var param = publishMap[publisherId+source];
        $timeout.cancel(param.channel.callConnectToken);
        if (message.response != 'accepted') {
            $log.info('Disconnect due to reject from server');
            param.callback(false);
        } else {
            param.channel.id = message.channelId;
            param.channel.webRtcEndpoint.processAnswer(message.sdpAnswer);
            _.each(message.candidateList,function(candidate) {
                param.channel.webRtcEndpoint.addIceCandidate(candidate);
            })
            param.channel.state = PUB_CONNECTED;
            param.callback(true,param.channel);
            delete publishMap[param.channel.publisherId+param.channel.source];
        }
    }
    
    function onPublishComplete() {
        $timeout.cancel(this.channel.callSetupToken);
        if (this.channel.state != PUB_CONNECTING) {
            this.channel.state = PUB_CONNECTING;
            sendPublishData(this.channel,this.callback);
        } else
            this.callback(false);
    }
    
    function sendPublishData(channel,callback) {
        if (!channel.sdpOffer || !channel.candidateSendQueue.length) {
            $log.info('Disconnect due to device error');
            callback(false);
            return;
        }
        var message = {
                id: 'publish',
                sdpOffer: channel.sdpOffer,
                candidateList: channel.candidateSendQueue,
                publisherId:channel.publisherId,
                source:channel.source,
                bitrate:channel.bitrate
         };
        sendMessage(message);
        channel.sdpOffer = null;
        channel.candidateSendQueue = [];
        channel.callConnectToken = $timeout(function(ch,callback) {
            if (ch.state != PUB_CONNECTED) {
                $log.info('Disconnect due to calling timeout');
                callback(false);
            }
        },CALLING_TIMEOUT,true,channel,callback);
    }
    
    function sendMessage(message,callback) {
        var jsonMessage = JSON.stringify(message);
        $log.info('Senging streaming message: ' + jsonMessage);
        if ($one2oneSocket.readyState!=1) {
            if (callback)
                callback(false);
            return;
        }
        try {   
            $one2oneSocket.send(jsonMessage);
        } catch (exc) {
            $log.info('Error sending message: ',message );
            if (callback)
                callback(false);
        }
    };
    
    function onSubscribeIceCandidate(candidate) {
        this.subscription.candidateSendQueue.push(candidate);
    }

    function onSubscribe(error, sdpOffer) {
        if (error) {
            $log.error(error);
            this.callback(false);
            return;
        }
        this.subscription.sdpOffer = sdpOffer;
    }

    function subscribeResponse(message) {
        console.log(message,subscriptionMap);
        var param = subscriptionMap[message.channelId]

        $timeout.cancel(param.subscription.callConnectToken);

        if (message.response != 'accepted') {           
            param.callback(false);
        } 
        else {
            param.subscription.id = message.subscriptionId;
            param.subscription.webRtcEndpoint.processAnswer(message.sdpAnswer);
            param.subscription.state = SUB_CONNECTED;
            _.each(message.candidateList,function(candidate) {
                param.subscription.webRtcEndpoint.addIceCandidate(candidate);
            });
            sendMessage({
                id: 'connect',
                channelId:message.channelId,
                subscriptionId:message.subscriptionId
            });
            param.callback(true,param.subscription);
            delete subscriptionMap[param.subscription.channel.id];
        }
    }
    
    function onSubscribeComplete() {
        $timeout.cancel(this.subscription.callSetupToken);
        if (this.subscription.state != SUB_CONNECTING) {
            sendSubscribeData(this.subscription,this.callback);
            this.subscription.state = SUB_CONNECTING;
        }
    }
    
    function sendSubscribeData(subscription,callback) {
        if (!subscription.sdpOffer || !subscription.candidateSendQueue.length) {
            callback(false);
            return;
        }
        var message = {
                id: 'subscribe',
                channelId: subscription.channel.id,
                sdpOffer: subscription.sdpOffer,
                candidateList:subscription.candidateSendQueue,
                bitrate:subscription.bitrate
            }
        sendMessage(message,callback);
        subscription.sdpOffer = null;
        subscription.candidateSendQueue = [];
        subscription.callConnectToken = $timeout(function(sub,cb) {
            if (sub.state != SUB_CONNECTED) {
                $log.info('Disconnect due to calling timeout');
                cb(false);
            }
        },CALLING_TIMEOUT,true,subscription,callback);
    }
    
    function updateBandwidthRestriction(sdp, bandwidth) {
        if (sdp.indexOf('b=AS:') === -1) {
          // insert b=AS after c= line.
          sdp = sdp.replace(/c=IN IP4 (.*)\r\n/,
                            'c=IN IP4 $1\r\nb=AS:' + bandwidth + '\r\n');
        } else {
          sdp = sdp.replace(/b=AS:(.*)\r\n/, 'b=AS:' + bandwidth + '\r\n');
        }
        return sdp;
      }
     
    return {
        unpublish: function (channel){
            sendMessage({id:'unpublish',channelId:channel.id});
            // channel.release();
        },
        hangUp: function() {
            for (var key in publishMap) {
                var param = publishMap[key];
                if (param.channel  && param.channel.callSetupToken)
                    $timeout.cancel(param.channel.callSetupToken);
            }
            publishMap = {};
            for (var key in subscriptionMap) {
                var param = subscriptionMap[key];
                if (param.subscription  && param.subscription.callSetupToken)
                    $timeout.cancel(param.subscription.callSetupToken);
            }
            subscriptionMap = {};
        },
        publishWebcam: function(video,publisherId,bitrate,callback)
        {
            var channel = new Channel(publisherId,'webcam',bitrate);
            publishMap[channel.publisherId+channel.source] = {callback:callback,channel:channel};
            var options = {
                localVideo: video,
                onicecandidate: onPublishIceCandidate.bind({channel:channel,callback:callback}),
                iceServers:iceServers,
                oncandidategatheringdone: onPublishComplete.bind({channel:channel,callback:callback})
            };
            channel.webRtcEndpoint = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
                if (error) {
                    $log.error(error);
                    callback(false);
                    return;
                }
                this.generateOffer(onPublish.bind({channel:channel,callback:callback}));
            });
            channel.callSetupToken = $timeout(function(ch,cb) {
                if (ch.pubState != PUB_CONNECTING) {
                    ch.pubState = PUB_CONNECTING;
                    sendPublishData(ch,cb);
                }
            },GATHER_TIMEOUT,true,channel,callback);
            
        },
        disconnect: function (party){
            sendMessage({id:'stop'});
        },
        publishScreen: function(strean,publisherId,bitrate,callback)
        {
            var channel = new Channel(publisherId,'screen',bitrate);
            publishMap[channel.publisherId+channel.source] = {callback:callback,channel:channel};
            var options = {
                videoStream: strean,
                onicecandidate: onPublishIceCandidate.bind({channel:channel,callback:callback}),
                iceServers:iceServers,
                oncandidategatheringdone: onPublishComplete.bind({channel:channel,callback:callback})
            };
            channel.webRtcEndpoint = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
                if (error) {
                    $log.error(error);
                    callback(false);
                    return;
                }
                this.generateOffer(onPublish.bind({channel:channel,callback:callback}));
            });
            channel.callSetupToken = $timeout(function(ch,cb) {
                if (ch.pubState != PUB_CONNECTING) {
                    ch.pubState = PUB_CONNECTING;
                    sendPublishData(ch,cb);
                }
            },GATHER_TIMEOUT,true,channel,callback);
            
        },
        adjustBandwidth:function(webRtcEndpoint,bandwidth) {
            var pc = webRtcEndpoint.peerConnection;
            if (pc) {
                pc.setLocalDescription(pc.localDescription)
                .then(function() {
                  var desc = pc.remoteDescription;
                    desc.sdp = updateBandwidthRestriction(desc.sdp, bandwidth);
                  return pc.setRemoteDescription(desc);
                });
            }            
        },
        unsubscribe: function (subscription){
            sendMessage({id:'unsubscribe',subId:subscription.id});
            subscription.release();
        },
        subscribe: function(video,channel,bitrate,callback){
            var subscription = new Subscription(channel,bitrate);
            subscriptionMap[subscription.channel.id] = {callback:callback,subscription:subscription};
            var options = {
                    remoteVideo: video,
                    onicecandidate: onSubscribeIceCandidate.bind({subscription:subscription,callback:callback }),
                    iceServers: iceServers,
                    oncandidategatheringdone: onSubscribeComplete.bind({subscription:subscription,callback:callback})
                }
            subscription.callSetupToken = $timeout(function(s,cb) {
                if (s.state != SUB_CONNECTING) {
                    sendSubscribeData(s,cb);
                    s.sstate = SUB_CONNECTING;
                }
            },GATHER_TIMEOUT,true,subscription,callback);
            
            subscription.webRtcEndpoint = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
                if (error) {
                    $log.error(error);
                    callback(false);
                    return;
                }
                this.generateOffer(onSubscribe.bind({
                    subscription: subscription,callback:callback
                }));
            });
        }
    }
});
'use strict';
angular.module('api')
    .factory('$callSocket', function($log, callSocketUrl) {
        try {
            var ws = new WebSocket(callSocketUrl);
            var handlers = {};
            ws.onopen = function()
            {
                ws.onmessage = function(message)
                {
                    var parsedMessage = angular.fromJson(message.data);
                    console.log(message.data);
                    if (handlers[parsedMessage.id])
                    {
                        handlers[parsedMessage.id](parsedMessage);
                    }
                };
            };
            
            var onMsg = function(event, callback)
            {
                handlers[event] = callback;
            };
            return {
                instance: ws,
                close: function()
                {
                    ws.close();
                },
                send: function(message)
                {
                    ws.send(message);
                },
                on: onMsg,
                chat: function(info, callback)
                {
                    ws.send(angular.toJson(
                    {
                        'id': 'chat',
                        'memberId': info.userId,
                        'text': info.text,
                        meetingId: info.meetingId
                    }), callback);
                },
                end: function(info, callback)
                {
                    ws.send(angular.toJson(
                    {
                        'id': 'end',
                        'meetingId': info.meetingId
                    }), callback);
                },
                onChatEvent: function(callback)
                {
                    onMsg('chatEvent', callback);
                },
                whiteboard: function(info, callback)
                {
                    ws.send(angular.toJson(
                    {
                        'id': 'whiteboard',
                        'memberId': info.memberId,
                        meetingId: info.meetingId,
                        'object': info.object,
                        'event': info.event
                    }), callback);
                },
                onWhiteboardEvent: function(callback)
                {
                    onMsg('whiteboardEvent', callback);
                },
                onEndMeetingEvent: function(callback)
                {
                    onMsg('endMeetingEvent', callback);
                }
            };
        } catch (exc) {
            $log.error('Cannot connect to server');
            return null;
        }
    })
    .factory('$one2oneSocket', function($log, one2oneSocketUrl) {
        try {
            var ws = new WebSocket(one2oneSocketUrl);
            return ws;
        } catch (exc) {
            $log.error('Cannot connect to server',one2oneSocketUrl);
            return null;
        }
    })
    .factory('$one2oneDirectSocket', function($log, one2oneDirectSocketUrl) {
        try {
            var ws = new WebSocket(one2oneDirectSocketUrl);
            return ws;
        } catch (exc) {
            $log.error('Cannot connect to server',one2oneDirectSocketUrl);
            return null;
        }
    });
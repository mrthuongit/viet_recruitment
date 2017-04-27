'use strict';
angular.module('api').factory('$interview', function(http)
{
    return {
        getInterview: function(info, callback)
        {
            var path = "/interview";
            var param = {
                code: info.code
            };
            http.getRequest(path, param, callback);
        },
        getInterviewQuestion: function(info, callback)
        {
            var path = "/interview/question";
            var param = {
                code: info.code
            };
            http.getRequest(path, param, callback);
        },
        startInterview: function(info, callback)
        {
            var path = "/interview/start";
            var param = {
                code: info.code
            };
            http.postRequest(path, param, callback);
        },
        finishInterview: function(info, callback)
        {
            var path = "/interview/finish";
            var param = {
                code: info.code
            };
            http.postRequest(path, param, callback);
        },
        answerInterviewQuestion: function(info, callback)
        {
            var path = "/interview/answer";
            var param = {
                code: info.code,
                questionId: info.questionId,
                videoUrl: info.videoUrl
            };
            http.postRequest(path, param, callback);
        },
        attachDocument: function(info, callback)
        {
            var path = "/interview/document";
            var param = {
                code: info.code,
                file: info.file,
                filename: info.fileName,
                comment: info.comment
            };
            http.postRequest(path, param, callback);
        }
    };
});
'use strict';
angular.module('api').factory('$quiz', function(http)
{
    return {
        getQuiz: function(info, callback)
        {
            var path = "/quiz";
            var param = {
                code: info.code
            };
            http.getRequest(path, param, callback);
        },
        getQuizQuestion: function(info, callback)
        {
            var path = "/quiz/question";
            var param = {
                code: info.code
            };
            http.getRequest(path, param, callback);
        },
        startQuiz: function(info, callback)
        {
            var path = "/quiz/start";
            var param = {
                code: info.code
            };
            http.postRequest(path, param, callback);
        },
        finishQuiz: function(info, callback)
        {
            var path = "/quiz/finish";
            var param = {
                code: info.code
            };
            http.postRequest(path, param, callback);
        },
        submitQuizAnswer: function(info, callback)
        {
            var path = "/quiz/answer";
            var param = {
                code: info.code,
                questionId: info.questionId,
                optionId: info.optionId
            };
            http.postRequest(path, param, callback);
        }
    };
});
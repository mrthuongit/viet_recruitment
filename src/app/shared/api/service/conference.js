'use strict';
angular.module('api').factory('$conference', function(http)
{
    return {
        getMeetingInfo: function(info, callback)
        {
            var path = "/conference";
            var param = {
                meetingId: info.meetingId,
                memberId: info.memberId
            };
            http.getRequest(path, param, callback);
        },
        answerInterviewQuestion: function(info, callback)
        {
            var path = "/conference/answer";
            var param = {
                meetingId: info.meetingId,
                memberId: info.memberId,
                candidateMemberId: info.candidateMemberId,
                questionId: info.questionId,
                videoUrl: info.videoUrl
            };
            http.postRequest(path, param, callback);
        },
        submitCandidateAssessment: function(info, callback)
        {
            var path = "/conference/assessment";
            var param = {
                meetingId: info.meetingId,
                memberId: info.memberId,
                candidateMemberId: info.candidateMemberId,
                assessmentResult: angular.toJson(info.assessmentResult)
            };
            http.postRequest(path, param, callback);
        }
    };
});
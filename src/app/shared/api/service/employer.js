"use strict";
angular.module('api').factory('$employer', function(http)
{
    return {
        loginAccount: function(info, callback)
        {
            var path = "/employer/account/login";
            var param = {
                email: info.email,
                password: info.password
            };
            http.postRequest(path, param, callback);
        },
        logout: function(info, callback)
        {
            var path = "/employer/account/logout";
            var param = {
                token: info.token
            };
            http.postRequest(path, param, callback);
        },
        changePass: function(info, callback)
        {
            var path = "/employer/account/changepass";
            var param = {
                token: info.token,
                oldpass: info.oldpass,
                newpass: info.newpass
            };
            http.postRequest(path, param, callback);
        },
        getLicenseInfo: function(info, callback)
        {
            var path = "/employer/company/license";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        createAssignment: function(info, callback)
        {
            var path = "/employer/assignment";
            var param = {
                token: info.token,
                assignment: angular.toJson(info.assignment)
            };
            http.postRequest(path, param, callback);
        },
        getAssignment: function(info, callback)
        {
            var path = "/employer/assignment";
            var param = {
                token: info.token,
                offset: info.offset,
                length: info.length,
                count: info.count,
                overview: info.overview
            };
            http.getRequest(path, param, callback);
        },
        updateAssignment: function(info, callback)
        {
            var path = "/employer/assignment";
            var param = {
                token: info.token,
                assignment: angular.toJson(info.assignment)
            };
            http.putRequest(path, param, callback);
        },
        deleteAssignment: function(info, callback)
        {
            var path = "/employer/assignment";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId
            };
            http.deleteRequest(path, param, callback);
        },
        openAssignment: function(info, callback)
        {
            var path = "/employer/assignment/open";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId
            };
            http.postRequest(path, param, callback);
        },
        closeAssignment: function(info, callback)
        {
            var path = "/employer/assignment/close";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId
            };
            http.postRequest(path, param, callback);
        },
        getInterviewStatistic: function(info, callback)
        {
            var path = "/employer/assignment/interview/stats";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.getRequest(path, param, callback);
        },
        getConference: function(info, callback)
        {
            var path = "/employer/assignment/interview/conference";
            var param = {
                token: info.token,
                offset: info.offset,
                length: info.length,
                count: info.count
            };
            http.getRequest(path, param, callback);
        },
        launchConference: function(info, callback)
        {
            var path =
                "/employer/assignment/interview/conference/launch";
            var param = {
                token: info.token,
                conferenceId: info.conferenceId
            };
            http.postRequest(path, param, callback);
        },
        createInterview: function(info, callback)
        {
            var path = "/employer/assignment/interview";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId,
                interview: angular.toJson(info.interview)
            };
            http.postRequest(path, param, callback);
        },
        getInterview: function(info, callback)
        {
            var path = "/employer/assignment/interview";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId
            };
            http.getRequest(path, param, callback);
        },
        updateInterview: function(info, callback)
        {
            var path = "/employer/assignment/interview";
            var param = {
                token: info.token,
                interview: angular.toJson(info.interview)
            };
            http.putRequest(path, param, callback);
        },
        deleteInterview: function(info, callback)
        {
            var path = "/employer/assignment/interview";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.deleteRequest(path, param, callback);
        },
        openInterview: function(info, callback)
        {
            var path = "/employer/assignment/interview/open";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.postRequest(path, param, callback);
        },
        closeInterview: function(info, callback)
        {
            var path = "/employer/assignment/interview/close";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.postRequest(path, param, callback);
        },
        shortListCandidate: function(info, callback)
        {
            var path = "/employer/assignment/interview/shortlist";
            var param = {
                token: info.token,
                candidateId: info.candidateId
            };
            http.postRequest(path, param, callback);
        },
        addInterviewQuestion: function(info, callback)
        {
            var path = "/employer/assignment/interview/question";
            var param = {
                token: info.token,
                interviewId: info.interviewId,
                questionList: angular.toJson(info.questionList)
            };
            http.postRequest(path, param, callback);
        },
        updateInterviewQuestion: function(info, callback)
        {
            var path = "/employer/assignment/interview/question";
            var param = {
                token: info.token,
                questionList: angular.toJson(info.questionList)
            };
            http.putRequest(path, param, callback);
        },
        removeInterviewQuestion: function(info, callback)
        {
            var path = "/employer/assignment/interview/question";
            var param = {
                token: info.token,
                questionIds: angular.toJson(info.questionIds)
            };
            http.deleteRequest(path, param, callback);
        },
        getInterviewQuestion: function(info, callback)
        {
            var path = "/employer/assignment/interview/question";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.getRequest(path, param, callback);
        },
        sendInterviewInvitation: function(info, callback)
        {
            var path = "/employer/assignment/interview/invite";
            var param = {
                token: info.token,
                interviewId: info.interviewId,
                candidateList: angular.toJson(info.candidateList),
                subject: info.subject
            };
            http.postRequest(path, param, callback);
        },
        getCandidateResponse: function(info, callback)
        {
            var path = "/employer/assignment/interview/answer";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.getRequest(path, param, callback);
        },
        getCandidateAssessment: function(info, callback)
        {
            var path = "/employer/assignment/interview/assessment";
            var param = {
                token: info.token,
                assessmentId: info.assessmentId,
                candidateId: info.candidateId
            };
            http.getRequest(path, param, callback);
        },
        getCandidateAssessmentReport: function(info, callback)
        {
            var path = "/employer/report/assessment";
            var param = {
                token: info.token,
                candidateId: info.candidateId
            };
            http.getRequest(path, param, callback);
        },
        submitCandidateAssessment: function(info, callback)
        {
            var path = "/employer/assignment/interview/assessment";
            var param = {
                token: info.token,
                assessmentResult: angular.toJson(info.assessmentResult)
            };
            http.postRequest(path, param, callback);
        },
        getCandidate: function(info, callback)
        {
            var path = "/employer/interview/candidate";
            var param = {
                token: info.token,
                interviewId: info.interviewId
            };
            http.getRequest(path, param, callback);
        },
        getCompanyEmployer: function(info, callback)
        {
            var path = "/employer/company";
            var param = {
                token: info.token
            };
            http.getRequest(path, param, callback);
        },
        updateCompanyEmployer: function(info, callback)
        {
            var path = "/employer/company";
            var param = {
                token: info.token,
                company: angular.toJson(info.company)
            };
            http.putRequest(path, param, callback);
        },
        openMeeting: function(info, callback)
        {
            var path =
                "/employer/assignment/interview/conference/open";
            var param = {
                conferenceId: info.conferenceId,
                token: info.token
            };
            http.postRequest(path, param, callback);
        },
        closeMeeting: function(info, callback)
        {
            var path =
                "/employer/assignment/interview/conference/close";
            var param = {
                conferenceId: info.conferenceId,
                token: info.token
            };
            http.postRequest(path, param, callback);
        },
        searchCandidate: function(info, callback)
        {
            var path = "/employer/employee/search";
            var param = {
                token: info.token,
                offset: info.offset,
                length: info.length,
                count: info.count,
                option: info.option
            };
            http.getRequest(path, param, callback);
        },
        getEmployeeDetail: function(info, callback)
        {
            var path = "/employer/employee";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        getEmployeeContact: function(info, callback)
        {
            var path = "/employer/employee/viewcontact";
            var param = {
                token: info.token,
                employeeId: info.employeeId
            };
            http.getRequest(path, param, callback);
        },
        getEmployeeByEmail: function(info, callback){
            var path = "/employer/employee/searchByEmail";
            var param ={
                email:info.email,
                token:info.token
            };
            http.getRequest(path, param, callback);
        },
        getCandidateApplyList: function(info, callback) {
            var path = "/employer/candidate";
            var param = {
                    token: info.token,
                    offset: info.offset,
                    length: info.length,
                    count: info.count
                };

            http.getRequest(path, param, callback);
        },
        getCandidateByjob: function(info, callback)
        {
            var path = "/employer/assignment/candidate";
            var param = {
                token: info.token,
                assignmentId: info.assignmentId
            };
            http.getRequest(path, param, callback);
        }
    };
});
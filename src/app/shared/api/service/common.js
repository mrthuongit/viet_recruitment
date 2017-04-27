'use strict';
angular.module('api').factory('$common', function(http)
{
    return {
        getCompany: function(info, callback)
        {
            var path = "/common/company";
            var param = {
                assignmentId: info.assignmentId
            };
            http.getRequest(path, param, callback);
        },
        getJobCategory: function(info, callback)
        {
            var path = "/common/assignment/category";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        getJobPosition: function(info, callback)
        {
            var path = "/common/assignment/position";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        getJobLocation: function(info, callback)
        {
            var path = "/common/assignment/location";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        getEducationLevel: function(info, callback)
        {
            var path = "/common/assignment/edulevel";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        searchJob: function(info, callback)
        {
            var path = "/common/assignment";
            var param = {
                keyword: info.keyword,
                option: angular.toJson(info.option),
                offset: info.offset,
                length: info.length,
                count: info.count
            };
            http.postRequest(path, param, callback);
        },
        uploadVideo: function(info, callback)
        {
            var path = "/common/video/upload";
            var file = info.file;
            http.uploadRequest(path, file, callback);
        },
        sendEmailReset: function(info, callback)
        {
            var path = "/common/account/requestresetpass";
            var param = {
                email: info.email
            };
            http.postRequest(path, param, callback);
        },
        sendPasswordReset: function(info, callback)
        {
            var path = "/common/account/resetpass";
            var param = {
                token: info.token,
                newpass: info.newpass
            };
            http.postRequest(path, param, callback);
        },
        getQuestionCategory: function(info, callback)
        {
            var path = "/common/question/category";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        getQuestion: function(info, callback)
        {
            var path = "/common/question";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        getAssessment: function(info, callback)
        {
            var path = "/common/assessment";
            var param = {
                lang: info.lang
            };
            http.getRequest(path, param, callback);
        },
        getEmployee: function(info, callback)
        {
            var path = "/common/employee";
            var param = {
                email: info.email
            };
            http.getRequest(path, param, callback);
        },
        scheduleDemoRequest: function(info, callback)
        {
            var path = "/common/mail";
            var param = {
                body: info.body,
                subject:info.subject
            };
            http.postRequest(path, param, callback);
        }
    };
});
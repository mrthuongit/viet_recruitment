'use strict';
angular.module('employerModule').controller('ReviewConfirmVideoInterviewController', function($scope,
    $employer, $translate, $rootScope, localStorageService, _, $location,$q)
{
    var chooseAssignment = localStorageService.get("chooseAssignment");
    function init()
    {
        $scope.userEmployer = localStorageService.get("userEmployer");
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.interview = localStorageService.get("interview");
        $scope.interviewQuestionList = localStorageService.get("interviewQuestionList");
        $scope.company = localStorageService.get('companyProfile');
        $scope.interview.aboutUsUrl = $scope.company.videoUrl;
    }

    function _createInterviewQuestion(listQuestion, interviewId)
    {
        return $q(function(resolve, reject) {
            if (listQuestion.length === 0){
                resolve();
            }
            else {
                var info = {
                        token: $scope.userEmployer.token,
                        interviewId: interviewId,
                        questionList: listQuestion
                    };
                    $employer.addInterviewQuestion(info, function(result)
                    {
                        if (result.status){
                            resolve();
                        } else {
                            reject();
                        }
                    });
            }
        });
      
    }
    function _updateInterviewQuestion(listQuestion, interviewId)
    {
        return $q(function(resolve, reject) {
            if (listQuestion.length === 0){
                resolve();
            }
            else {
                var info = {
                        token: $scope.userEmployer.token,
                        interviewId: interviewId,
                        questionList: listQuestion
                    };
                $employer.updateInterviewQuestion(info, function(result)
                {
                    if (result.status) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            }
        });
    }
    var _removeInterviewQuestion = function(listQuestion)
    {
        return $q(function(resolve, reject) {
            if (listQuestion.length === 0){
                resolve();
            }
            else {
                var questionIds = [];
                listQuestion.forEach(function(question)
                {
                    questionIds.push(question.id);
                });
                var info = {
                    token: $scope.userEmployer.token,
                    questionIds: questionIds
                };
                $employer.removeInterviewQuestion(info, function(result)
                {
                    if (result.status) {
                        resolve();
                    } else {
                        reject();
                    }
                });
            }
        });
    };
    
    function _createOrUpdateInterview()
    {
        return $q(function(resolve, reject) {
            if ($scope.interview.id)
            {
                $employer.updateInterview(
                {
                    token: $scope.userEmployer.token,
                    interview: $scope.interview
                }, function(result)
                {
                    if (result.status && result.data.result){
                        resolve($scope.interview.id);
                    } else {
                        reject();
                    }
                });
            }
            else
            {
                $employer.createInterview(
                {
                    token: $scope.userEmployer.token,
                    assignmentId: chooseAssignment.id,
                    interview: $scope.interview
                }, function(result)
                {
                    if (result.status && result.data.result){
                        resolve(result.data.interviewId);
                    } else {
                        reject();
                    }
                });
            }
        });
       
    }
    
    function _createOrUpdateInterviewQuestion(interviewId)
    {
        var createInterviewQuestion = _.filter($scope.interviewQuestionList, function(question)
        {
            return !question.id;
        });
        var updateInterviewQuestion = _.filter($scope.interviewQuestionList, function(question)
        {
            return question.id && !question.remove;
        });
        var removeInterviewQuestion = _.filter($scope.interviewQuestionList, function(question)
        {
            return question.id && question.remove;
        });
        return $q(function(resolve) {
            _createInterviewQuestion(createInterviewQuestion, interviewId)
            .then( _updateInterviewQuestion(updateInterviewQuestion, interviewId))
            .then( _removeInterviewQuestion(removeInterviewQuestion))
            .then(resolve());
        });
    }
    
    $scope.doSave = function()
    {
        _createOrUpdateInterview().then(function(interviewId)
        {
            if (interviewId)
            {
                _createOrUpdateInterviewQuestion(interviewId).then(function() {
                    localStorageService.remove("interviewQuestionList");
                    localStorageService.remove("interview");
                    $location.path("/employer/interview_list");
                });
            }
        });
    };
    init();
});
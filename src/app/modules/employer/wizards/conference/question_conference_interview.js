'use strict';
angular.module('employerModule').filter('category', function(_) {
    return function(questionList, categoryId) {
        return  _.filter(questionList, function(question)
                {
                    return question.categoryId === categoryId;
                });
    };
  })
.filter('existQuestion', function(_) {
    return function(questionList, existList) {
        return _.filter(questionList, function(question)
        {
            return !_.find(existList,function(existQ) {
                return existQ.questionId === question.id;
            });
        });
    };
  })
  .filter('freeText', function(_) {
    return function(questionList) {
        return _.filter(questionList, function(question)
        {
            return !question.type || question.type ==='ET';
        });
    };
  })
.controller('QuestionConferenceInterviewController', function($scope, $employer, $rootScope, localStorageService, $location, $common, $q,$cache,_)
{
    
    function getInterviewQuestion()
    {
        return $q(function(resolve) {
            if (localStorageService.get("interviewQuestionList"))
            {
                resolve(localStorageService.get("interviewQuestionList"));
            } else
            {
                if ($scope.interview.id)
                {
                    $employer.getInterviewQuestion(
                    {
                        token: $scope.userEmployer.token,
                        interviewId: $scope.interview.id
                    }, function(result)
                    {
                        if (result.status)
                        {
                            localStorageService.set("interviewQuestionList", result.data.questionList);
                        }
                        resolve(localStorageService.get("interviewQuestionList"));
                    });
                } else {
                    resolve([]);              
                }
            }
        });         
    }
    
    function getQuestionCategory(lang)
    {
        return $q(function(resolve, reject) {
            $cache.getQuestionCategory({  lang: lang }, function(result)
            {
                if (result.status)
                {
                    resolve(result);
                }
                reject();
            });  
        });    
    }
    function getQuestion(lang)
    {
        return $q(function(resolve, reject) {
            $cache.getQuestion({lang: lang }, function(result)
            {
                if (result.status)
                {
                    resolve(result);
                }
                reject();
            });   
        });   
    }

    function resetInterviewQuestion() {
        var lastCategoryId = null;
        if ($scope.questionCategory){
            lastCategoryId = $scope.questionCategory[0].id;
        }
        if ($scope.interviewQuestion && $scope.interviewQuestion.categoryId){
            lastCategoryId = $scope.interviewQuestion.categoryId;
        }
        $scope.interviewQuestion = {
                questionFile: null,
                questionUrl:null,
                response: $scope.interview.response,
                prepare: $scope.interview.prepare,
                title:"",
                categoryId:lastCategoryId,
                questionType:"ET"
            };
    }

    function addQuestionSystem(questionId) {
        var question = _.find($scope.questionList,function(q) {
           return q.id === questionId;
        });
        var questionCount = _.countBy($scope.interviewQuestionList, function(question) {
          return !question.remove;
        });
        if(!questionCount.true) {
            questionCount = {
                true : 0
            };
        }
        $scope.interviewQuestion.title = question.title;
        $scope.interviewQuestion.questionId = question.id;
        $scope.interviewQuestion.order = questionCount.true + 1;
        $scope.interviewQuestion.source = "system";
        $scope.interviewQuestion.type = "text";
        $scope.interviewQuestion.videoUrl = "";
        $scope.interviewQuestionList.push($scope.interviewQuestion);
        localStorageService.set("interviewQuestionList", $scope.interviewQuestionList);
        resetInterviewQuestion();
    }
    
    function init()
    {
        $scope.interview = localStorageService.get('interview');
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        resetInterviewQuestion();
        getInterviewQuestion()
        .then(function(interviewQuestionList) {
            $scope.interviewQuestionList = interviewQuestionList;
        });
    }
    
    $rootScope.$watch('language', function(newValue, oldValue)
    {
        if (newValue) {
            getQuestionCategory(newValue).
            then( function (result) {
                $scope.questionCategory = result.data.categoryList;
                getQuestion(newValue)
                .then ( function (result) {
                    $scope.questionList = result.data.questionList;
                    $scope.interviewQuestion.categoryId = $scope.questionCategory[0].id;
                });
            });
        }
    });      
    
    $scope.chooseQuestion = function()
    {
        addQuestionSystem($scope.interviewQuestion.questionId);      
    };
    
    $scope.removeInterviewQuestion = function(removedQuestion)
    {
        if (removedQuestion.id){
            removedQuestion.remove = true;
        } else {
            $scope.interviewQuestionList = _.reject($scope.interviewQuestionList, function(question)
            {
                return question.title === removedQuestion.title;
            });
        }
        var order = 1;
        for (var i = 0; i < $scope.interviewQuestionList.length; i++){
            if (!$scope.interviewQuestionList[i].remove){
                $scope.interviewQuestionList[i].order =  order++;
            }
        }
        localStorageService.set("interviewQuestionList", $scope.interviewQuestionList);
    };
    
    $scope.moveDownInterviewQuestion = function(interviewQuestion)
    {
        var existQuestion = _.find($scope.interviewQuestionList, function(question)
        {
            return !question.remove && question.order > interviewQuestion.order;
        });
        if (existQuestion)
        {
            var order = existQuestion.order;
            existQuestion.order = interviewQuestion.order;
            interviewQuestion.order = order;
        }
    };

    function addQuestionSearch(question) {
        var questionCount = _.countBy($scope.interviewQuestionList, function(question) {
          return !question.remove;
        });
        if(!questionCount.true) {
            questionCount = {
                true : 0
            };
        }
        $scope.interviewQuestion.title = question.title;
        $scope.interviewQuestion.questionId = question.id;
        $scope.interviewQuestion.order = questionCount.true + 1;
        $scope.interviewQuestion.source = "system";
        $scope.interviewQuestion.type = "text";
        $scope.interviewQuestion.videoUrl = "";
        $scope.interviewQuestionList.push($scope.interviewQuestion);
        localStorageService.set("interviewQuestionList", $scope.interviewQuestionList);
        resetInterviewQuestion();
    }
    $scope.chooseQuestionSearch = function(question)
    {
           addQuestionSearch(question);       
    };
          
    $scope.addQuestionManual = function()
    {
        var questionCount = _.countBy($scope.interviewQuestionList, function(question) {
          return !question.remove;
        });
        if(!questionCount.true) {
            questionCount = {
                true : 0
            };
        }
        $scope.interviewQuestion.order = questionCount.true + 1;
        $scope.interviewQuestion.source = "manual";
        $scope.interviewQuestion.type = "text";    
        $scope.interviewQuestion.videoUrl = "";    
        
        $scope.interviewQuestionList.push($scope.interviewQuestion);
        localStorageService.set("interviewQuestionList", $scope.interviewQuestionList);
        resetInterviewQuestion();
    };

    $scope.back = function()
    {
        localStorageService.set('interview', $scope.interview);
        $location.path("/employer/conference/interview");
    };
    $scope.gotoReview = function()
    {
         localStorageService.set('interview', $scope.interview);
         $location.path("/employer/conference/review_confirm_interview");
    };
    init();
});
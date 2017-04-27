'use strict';
angular.module('interviewQuizModule').controller('QuizSplashController', function($rootScope, $scope,
    Fullscreen, $location, $quiz, $routeParams, deviceDetector, $route, $translate)
{
    if (deviceDetector.browser !== 'firefox' && deviceDetector.browser !== 'chrome')
    {
        $location.path("/quiz/unsupport");
        $route.reload();
    }
    var translateInterview = $routeParams.translate;
    $translate.refresh();
    $translate.use(translateInterview);
    $scope.proceed = function()
    {
        Fullscreen.all();
        var code = $routeParams.code;
        if (code !== null)
        {
            sessionStorage.clear();
            sessionStorage.setItem('code', code);
            var getQuestion = function()
            {
                $quiz.getQuizQuestion(
                {
                    code: code
                }, function(result)
                {
                    if (result.status && result.data.result)
                    {
                        $rootScope.questionList = result.data.questionList;
                        sessionStorage.setItem('questionList', JSON.stringify(result.data
                            .questionList));
                        sessionStorage.setItem("stage", "welcome");
                        $location.path("/quiz/start");
                    }
                });
            };
            var getInterview = function()
            {
                $quiz.getQuiz(
                {
                    code: code
                }, function(result)
                {
                    if (result.status && result.data.result)
                    {
                        $rootScope.interview = result.data.interview;
                        $rootScope.candidate = result.data.candidate;
                        $rootScope.history = result.data.history;
                        console.log('========= interview', $rootScope.interview);
                        sessionStorage.setItem('interview', JSON.stringify(result.data
                            .interview));
                        sessionStorage.setItem('candidate', JSON.stringify(result.data
                            .candidate));
                        sessionStorage.setItem('history', JSON.stringify(result.data.history));
                        $quiz.startQuiz(
                        {
                            code: code
                        }, function(result)
                        {
                            if (result.status && result.data.result)
                            {
                                getQuestion();
                            }
                            else
                            {
                                $location.path('/quiz/thankyou');
                            }
                        });
                    }
                });
            };
            getInterview();
        }
    };
});
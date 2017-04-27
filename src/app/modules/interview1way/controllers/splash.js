'use strict';
angular.module('interview1wayModule').controller('InterviewSplashController', function($rootScope, $scope,
    Fullscreen, $location, $interview, $routeParams, deviceDetector, $route, $translate)
{
    if (deviceDetector.browser !== 'firefox' && deviceDetector.browser !== 'chrome')
    {
        $location.path("/interview/unsupport");
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
                $interview.getInterviewQuestion(
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
                        $location.path("/interview/start");
                    }
                });
            };
            var getInterview = function()
            {
                $interview.getInterview(
                {
                    code: code
                }, function(result)
                {
                    if (result.status && result.data.result)
                    {
                        $rootScope.interview = result.data.interview;
                        $rootScope.candidate = result.data.candidate;
                        $rootScope.history = result.data.history;
                        sessionStorage.setItem('interview', JSON.stringify(result.data
                            .interview));
                        sessionStorage.setItem('candidate', JSON.stringify(result.data
                            .candidate));
                        sessionStorage.setItem('history', JSON.stringify(result.data.history));
                        $interview.startInterview(
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
                                $location.path('/interview/thankyou');
                            }
                        });
                    }
                });
            };
            getInterview();
        }
    };
});
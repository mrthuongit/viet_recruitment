'use strict';
angular.module('employerModule').controller('QuizInterviewController', function($scope, $employer, $rootScope, localStorageService, $location)
{
    function init()
    {
        $scope.chooseAssignment = localStorageService.get('chooseAssignment');
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        if (localStorageService.get('interview')){
            $scope.interview = localStorageService.get('interview');
        } else {
            $scope.interview = {
                name: $scope.chooseAssignment.name,
                mode: 'quiz',
                language: 'vi',
                shuffle:false
            };
        }
    }

    $scope.gotoQuestionInterview = function()
    {
        localStorageService.set('interview', $scope.interview);
        $location.path("/employer/quiz/setting_interview");
    };
    init();
});
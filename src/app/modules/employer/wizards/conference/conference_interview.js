'use strict';
angular.module('employerModule').controller('ConferenceInterviewController', function($scope, $employer, $rootScope, localStorageService, $location)
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
                mode: 'conference',
                language: 'vi'
            };
        }
    }

    $scope.gotoQuestionInterview = function()
    {
        localStorageService.set('interview', $scope.interview);
        $location.path("/employer/conference/question_interview");
    };
    init();
});
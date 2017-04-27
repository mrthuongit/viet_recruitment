'use strict';
angular.module('employerModule').controller('VideoInterviewController', function($scope, $employer,
    $translate, $rootScope, localStorageService, $location, toastr)
{
    $scope.gotoSettingInterview = function()
    {
        if (!$scope.video_interview.$error.required)
        {
            localStorageService.set('interview', $scope.interview);
            $location.path("/employer/video/setting_interview");
        }
        else
        {
            var alert = $translate.instant('toarster.alert');
            var required = $translate.instant('toarster.required');
            toastr.error(required, alert);
        }
    };
    
    function init()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.chooseAssignment = localStorageService.get('chooseAssignment');
        if (localStorageService.get('interview')){
            $scope.interview = localStorageService.get('interview');
        } else {
            $scope.interview = {
                name: $scope.chooseAssignment.name,
                mode: 'video',
                language: 'vi',
                response:1,
                prepare:1
            };
        }
    }
    
   

    init();
});
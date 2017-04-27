'use strict';
angular.module('interview1wayModule').controller('InterviewSetup2Controller', function($scope, toastr,
    $translate, $rootScope, $location, _, $route)
{
    var checkSetting = $translate.instant('interview.check-setting');
    $scope.recorder = {};
    $scope.proceed = function()
    {
        $scope.recorder.close();
        sessionStorage.setItem("step", 3);
        $route.reload();
    };
    $scope.alert = function()
    {
        toastr.error(checkSetting,"");
    };
    $scope.$on('camera-on', function()
    {
        $scope.recorder.video.autoplay = true;
        $scope.recorder.video.controls = false;
        $scope.recorder.video.muted = true;
        $scope.recorder.actionBar = false;
        $scope.$apply();
    });
});
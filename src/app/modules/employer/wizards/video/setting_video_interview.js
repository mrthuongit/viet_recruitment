'use strict';
angular.module('employerModule').controller('SettingVideoInterviewController', function($scope, $employer,
    $translate, $rootScope, localStorageService, $location, $common, $route, $q, toastr)
{
    function init()
    {
        $scope.interview = localStorageService.get('interview');
        $scope.uploadFile = {
            intro: null,
            exit: null
        };
        $scope.userEmployer = localStorageService.get("userEmployer");
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
    }
    
    $scope.backInterview = function()
    {
        localStorageService.set('interview', $scope.interview);
        $location.path("/employer/video/interview");
    };

    function uploadVideo(file, urlProp)
    {
            return $q(function(resolve) {
            if (file)
            {
                $common.uploadVideo(
                {
                    file: file
                }, function(result)
                {
                    if (result.status && result.data.result)
                    {
                        $scope.interview[urlProp] = result.data.url;
                    }
                    resolve();
                });
            }
            else
            {
                if (!$scope.interview[urlProp]){
                    $scope.interview[urlProp] = "";
                }
                resolve();
            }
        });
    }
    $scope.gotoQuestionInterview = function()
    {
        if (!$scope.setting_video.$error.required)
        {
            uploadVideo($scope.uploadFile.intro, "introUrl")
            .then(function() {
                uploadVideo($scope.uploadFile.exit, "exitUrl")
                .then(function() {
                    localStorageService.set('interview', $scope.interview);
                $location.path("/employer/video/question_interview");
                });
            });
        }
        else
        {
            var alert = $translate.instant('toarster.alert');
            var required = $translate.instant('toarster.required');
            toastr.error(required,alert);
        }
    };

    init();
});
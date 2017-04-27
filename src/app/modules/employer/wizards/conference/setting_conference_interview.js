'use strict';
angular.module('employerModule').controller('SettingConferenceInterviewController', function($scope,
    $employer, $rootScope, localStorageService, $location, $common, $route, $q,$log)
{
    var init = function()
    {
        $scope.interview = localStorageService.get('interview');
        $scope.uploadFile = {
            intro: null,
            exit: null
        };
        $scope.videoControl = {
            intro: null,
            exit: null
        };
        $scope.userEmployer = localStorageService.get("userEmployer");
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
    };
    $scope.backInterview = function()
    {
        localStorageService.set('interview', $scope.interview);
        $location.path("/employer/conference/interview");
    };
    var uploadVideo = function(file, urlProp, defer)
    {
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
                    $log.info($scope.interview);
                }
                defer.resolve();
            });
        }
        else
        {
            if (!$scope.interview[urlProp]) {
                $scope.interview[urlProp] = "";
            }
            defer.resolve();
        }
    };
    $scope.gotoQuestionInterview = function()
    {
        var deferArray = [$q.defer(), $q.defer()];
        var loopPromises = [];
        angular.forEach(deferArray, function(deferItem)
        {
            loopPromises.push(deferItem.promise);
        });
        deferArray[0].promise.then(function()
        {
            uploadVideo($scope.uploadFile.exit, "exitUrl", deferArray[1]);
        });
        uploadVideo($scope.uploadFile.intro, "introUrl", deferArray[0]);
        $q.all(loopPromises).then(function()
        {
            localStorageService.set('interview', $scope.interview);
            $location.path("/employer/conference/question_interview");
        });
    };
    $scope.doCancel = function()
    {
        $location.path("/employer/interview_list");
    };
    init();
});
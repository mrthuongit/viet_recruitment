'use strict';
angular.module('employerModule').controller('InterviewListController', function($scope, $employer, $translate, $uibModal, $log,
    $rootScope, toastr, localStorageService, $location,_)
{
    var alert = $translate.instant('toarster.alert');
    var updateSuccess = $translate.instant('toarster.updateSuccess');
    var updateError = $translate.instant('toarster.updateError');
    var openJob = $translate.instant('toastr.openJob');
    var openOneRound = $translate.instant('toastr.openOneRound');
    
    $scope.openJob = function()
    {
        $employer.openAssignment(
        {
            token: $scope.userEmployer.token,
            assignmentId: $scope.chooseAssignment.id
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                $scope.chooseAssignment.status = "published";
                localStorageService.set('changeStatusAssignment', true);
                localStorageService.set('chooseAssignment', $scope.chooseAssignment);                
                toastr.success(  updateSuccess,alert);
            }
            else
            {
                $scope.chooseAssignment.status = "initial";
                toastr.error(  updateError,alert);
            }
        });
    };
    $scope.closeJob = function()
    {
        $employer.closeAssignment(
        {
            token: $scope.userEmployer.token,
            assignmentId: $scope.chooseAssignment.id
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                $scope.chooseAssignment.status = "closed";
                localStorageService.set('changeStatusAssignment', true);
                localStorageService.set('chooseAssignment', $scope.chooseAssignment);
                toastr.success(  updateSuccess,alert);
            }
            else
            {
                toastr.error(  updateError,alert);
            }
        });
    };
    $scope.openInterview = function(interview)
    {
        if($scope.chooseAssignment.status !== "published"){
            interview.status = "closed";
            toastr.warning(  openJob,alert);
        } else {
            $employer.openInterview(
            {
                token: $scope.userEmployer.token,
                interviewId: interview.id
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    interview.status = "published";
                    toastr.success(  updateSuccess,alert);
                }
                else
                {
                    interview.status = "closed";
                    toastr.error(openOneRound,alert);
                    // interview.status = 'initial';
                    // toastr.error(  updateError,alert);
                }
            });
        }
    };
    $scope.closeInterview = function(interview)
    {
        $employer.closeInterview(
        {
            token: $scope.userEmployer.token,
            interviewId: interview.id
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                interview.status = "closed";
                toastr.success(  updateSuccess,alert);
            }
            else
            {
                interview.status = 'initial';
                toastr.error(  updateError,alert);
            }
        });
    };

    function init()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        $scope.licenseInfo = localStorageService.get('licenseInfo');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.chooseAssignment = localStorageService.get('chooseAssignment');
        $employer.getInterview(
        {
            token: $scope.userEmployer.token,
            assignmentId: $scope.chooseAssignment.id
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                $scope.interviewList = result.data.interviewList;
            }
        });
    }
    init();
    $scope.newVideoInterview = function()
    {
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path('employer/video/interview');
    };
    $scope.newConferenceInterview = function()
    {
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path('employer/conference/interview');
    };
    $scope.newQuizInterview = function()
    {
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path('employer/quiz/interview');
    };
    $scope.gotoInterview = function(interview)
    {
        localStorageService.remove("interviewQuestionList");
        localStorageService.set('interview', interview);
        if (interview.mode === 'video'){ 
            $location.path('employer/video/interview');
        }
        if (interview.mode === 'conference'){
            $location.path('employer/conference/interview');
        }
        if (interview.mode === 'quiz'){
            $location.path('employer/quiz/interview');
        }
    };

    $scope.deleteInterview = function(interview)
    {
        if (interview.id && interview.status === 'initial')
        {
            $employer.deleteInterview(
            {
                token: $scope.userEmployer.token,
                interviewId: interview.id
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    $scope.interviewList = _.reject($scope.interviewList, function(item)
                    {
                        return interview.id === item.id;
                    });
                }
                else
                {
                    toastr.error(  updateError,alert);
                }
            });
        }
    };

    $scope.openModalPremiumSuggest = function(size) {
        var modalInstance = $uibModal.open( {
            animation: true,
            templateUrl: 'modalPremiumSuggestView.html',
            controller: 'ModalPremiumSuggestCtrl',
            size: size,
            resolve: {
                    data: function() {
                        return {

                        };
                    }
                }
        });

        modalInstance.result.then(function() {

        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
});
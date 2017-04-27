'use strict';
angular.module('mainModule')
.controller('DefaultController', function($scope, $common, $log, $uibModal, $window)
{
    $window.scrollTo(0, 0);

    $scope.countToCv          = 215539;
    $scope.countToInterview   = 120164;
    $scope.countToConference  = 100006;
    $scope.countToStudent     = 99560;
    $scope.countToFrom        = 1;
    $scope.countDuration      = 5;

    $scope.scheduleDemo = function(){
        $scope.sendDemo = !$scope.sendDemo;
        var body = 'Full name:' + $scope.contact.fullname +' ; '
                    + 'Company:' + $scope.contact.company +' ; '
                    + 'Job:' + $scope.contact.job +' ; '
                    + 'Email:' + $scope.contact.email +' ; '
                    + 'Phone:' + $scope.contact.phone +' ; '
                    + 'Information:' + $scope.contact.information ;
        var info = {subject:'Schedule Demo Request',body:body};
        $common.scheduleDemoRequest(info, function(result) {
            if (result.status) {
                $scope.sendDemo = !$scope.sendDemo;
            } else {
                $log.info('Send mail error');
            }
        });
    };

    $scope.openyoutube = function(){
        var modalInstance = $uibModal.open({
            templateUrl: 'app/modules/main/modals/youtube.html',
            controller: 'ModalVideoCtrl',
            resolve: {
                data: function () {
                  return null;
                }
            }
        });
    };
});

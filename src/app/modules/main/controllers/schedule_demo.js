'use strict';
angular.module('mainModule').controller('ScheduleDemoController', function($scope,$common,$log)
{

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

});
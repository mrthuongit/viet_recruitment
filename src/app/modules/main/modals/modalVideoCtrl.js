angular.module('mainModule')
    .controller('ModalVideoCtrl', function($scope, $uibModalInstance, data) {
        $scope.type = data;
        
        $scope.close = function() {
            $uibModalInstance.close();
        }
    });
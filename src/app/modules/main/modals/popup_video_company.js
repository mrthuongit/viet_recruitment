'use strict';
angular.module('mainModule').controller('ModalVideoCompanyCtrl', 
        function ($scope, $uibModalInstance, $sce, data) {
            $scope.videoUrl = data.videoUrl;

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
    });

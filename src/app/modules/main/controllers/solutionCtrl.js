'use strict';
angular.module('mainModule')
.controller('SolutionController', function($scope, $window, $uibModal) {
    $window.scrollTo(0, 0);
    $scope.openVideoModal = function(type){
        var modalInstance = $uibModal.open({
            templateUrl: 'app/modules/main/modals/modalVideoView.html',
            controller: 'ModalVideoCtrl',
            resolve: {
                data: function () {
                  return type;
                }
            }
        });
    };
});


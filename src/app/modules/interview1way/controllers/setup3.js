'use strict';


angular.module('interview1wayModule') .controller('InterviewSetup3Controller', function ($scope, $rootScope, $location, _,$route,$uibModal) {
	
	 $scope.$on('camera-on',function() {
			$scope.recorder.video.autoplay = true;
			$scope.recorder.video.controls = false;
			$scope.recorder.video.muted = true;
			$scope.recorder.actionBar = true;
			$scope.recorder.timerBar = true;
		});
	  
	  $scope.openDialog = function () {

		    var modalInstance = $uibModal.open({
		      animation: true,
		      templateUrl: 'app/modules/interview1way/views/selectionDialog.html',
		      controller: 'InterviewSelectionDialogController',
		      controllerAs: 'app/modules/interview1way/controllers/selectionDialog',
		      size:'sm'  
		    });	
	  };	
});

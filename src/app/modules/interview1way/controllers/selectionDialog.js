'use strict';
angular.module('interview1wayModule').controller('InterviewSelectionDialogController', function ($scope, $uibModalInstance, $route) {

	$scope.proceedInterview = function(){
		$uibModalInstance.dismiss('cancel');
		sessionStorage.setItem("stage","interview");
  		$route.reload();
     };		
	$scope.proceedPractice = function(){
		$uibModalInstance.dismiss('cancel');
		sessionStorage.setItem("stage","practice");
  		$route.reload();
     };


	  $scope.cancel = function () {
	    $uibModalInstance.dismiss('cancel');
	  };
	});
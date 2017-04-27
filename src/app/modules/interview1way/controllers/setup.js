'use strict';


angular.module('interview1wayModule')
  .controller('InterviewSetupController', function ($scope) {
	if (sessionStorage.getItem("step") === null) {
	  	$scope.step =1;
  	} else {
  		$scope.step = JSON.parse(sessionStorage.getItem("step"));
  	}
 
  });

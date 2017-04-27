'use strict';


angular.module('interview1wayModule')
  .controller('InterviewSetup1Controller', function ($scope, $rootScope, $location, _,$route) {
	 
	  $scope.recorder = null;

  	
	  $scope.proceed = function(){
		    $scope.recorder.close();
	  		sessionStorage.setItem("step",2);
	  		$route.reload();
	     };
  });

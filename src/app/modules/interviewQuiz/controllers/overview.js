'use strict';


angular.module('interviewQuizModule')
  .controller('QuizOverviewController', function ($scope, $rootScope, $location, _,$route) {
	  $scope.questionList = JSON.parse(sessionStorage.getItem("questionList"));
	  $scope.interview = JSON.parse(sessionStorage.getItem("interview"));
	  	
	  	$scope.agreeToProceed = function(){
	  		sessionStorage.setItem("stage","interview");
	  		$route.reload();
	     };
				
	  	

  	
  });

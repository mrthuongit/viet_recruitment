'use strict';


angular.module('interview1wayModule')
  .controller('InterviewOverviewController', function ($scope, $rootScope, $location, _,$route) {
	  $scope.questionList = JSON.parse(sessionStorage.getItem("questionList"));
	  var interviewTime = 0;
	  var prepare = 0;
	  var response =0;
	  _.each($scope.questionList, function(question) {
		  interviewTime += question.prepare + question.response;
		  prepare += question.prepare;
		  response += question.response; 
	  });
	  	$scope.time = {
  				prepare: prepare,
  				answer: response,
  				practice:5,
  				total:interviewTime
  		};
	  	
	  	$scope.agreeToProceed = function(){
	  		sessionStorage.setItem("stage","setup");
	  		$route.reload();
	     };
				
	  	

  	
  });

'use strict';


angular.module('interview1wayModule')
  .controller('InterviewWelcomeController', function ($scope, $rootScope, $routeParams,$location, _, $route) {
	    var webcam = document.querySelector('video#webcam');
	    var finishAboutUs =  function() {	
	  		webcam.removeEventListener('ended',finishAboutUs);
	  		if ($rootScope.interview.introUrl) {
	  			webcam.src = $rootScope.interview.introUrl;
	  		}	    	
	    };
	    if ($rootScope.interview.aboutUsUrl) {
	    	webcam.addEventListener('ended',finishAboutUs);
	    	$scope.welcomeSrc = $rootScope.interview.aboutUsUrl;
	    } else {
	    	$scope.welcomeSrc = $rootScope.interview.introUrl;
	    }
	    
	    
	    
	  	$scope.agreeToProceed = function(){
	  		sessionStorage.setItem("stage","overview");
	  		$route.reload();
	     };

  	
  });

'use strict';

angular.module('interview1wayModule').controller('InterviewThankyouController',
	function($scope,Fullscreen) {
		function closeinterview(){
			Fullscreen.cancel();
		}

        closeinterview();
        sessionStorage.clear();
	});

'use strict';

angular.module('interviewQuizModule').controller('QuizThankyouController',
	function($scope,Fullscreen) {

		function closeinterview(){
			Fullscreen.cancel();
		}

        closeinterview();
        sessionStorage.clear();
	});

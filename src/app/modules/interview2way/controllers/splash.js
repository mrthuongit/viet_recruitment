'use strict';
angular.module('interview2wayModule').controller('ConferenceInterviewSplashController', function($rootScope, 
		$scope, Fullscreen, $location, $routeParams,$conference ,deviceDetector, 
		$route, $translate) {
    if (deviceDetector.browser !== 'firefox' && deviceDetector.browser !== 'chrome') {
        $location.path("/conference/unsupport");
        $route.reload();
    }
    var lang = $routeParams.translate?$routeParams.translate:'vi';
    var params = {
    		meetingId : $routeParams.meetingId,
			memberId : $routeParams.memberId
    };
    $translate.refresh();
    $translate.use(lang);
    $scope.proceed = function() {
        Fullscreen.all();
		$conference.getMeetingInfo(params, function(result) {
			if (result.status && result.data.result) {
				var conferenceInfo = result.data.info;
				if (conferenceInfo.status === 'ended'){
					 $location.path("/conference/thankyou");
				} else {
					sessionStorage.setItem("conference", JSON.stringify(result.data.info));
					$location.path("/conference/start");				
					
				}
			}
		});
        
    };
 
});
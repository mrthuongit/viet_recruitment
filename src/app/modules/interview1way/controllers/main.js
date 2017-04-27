'use strict';


angular.module('interview1wayModule').controller('InterviewMainController', 
    function ($scope) {
        $scope.stage = sessionStorage.getItem("stage");
    });

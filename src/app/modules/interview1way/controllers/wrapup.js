'use strict';
angular.module('interview1wayModule').controller('InterviewWrapupController', function($scope, $rootScope, $route,$location, $interview, _, $q) {
    var code = sessionStorage.getItem('code');

    var uploadSingleFile = function(file, comment, defer) {
        if (file) {
            var filename = file.name;
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                var base64 = theFile.target.result;
                base64 = base64.split(',')[1];
                // var fileComment = (comment ? comment : "");
                $interview.attachDocument({
                    code: code,
                    file: base64,
                    fileName: filename,
                    comment: comment
                }, function() {
                    defer.resolve()();
                });
            });
            // Read in the image file as a data URL.
            reader.readAsDataURL(file);
        } else {
            defer.resolve();
        }
    };
    
    $scope.uploadFile = function() {
        var deferArray = [$q.defer(), $q.defer(), $q.defer()];
        var loopPromises = [];
        angular.forEach(deferArray, function(deferItem) {
            loopPromises.push(deferItem.promise);
        });
        deferArray[0].promise.then(function() {
            uploadSingleFile($scope.picFile2, $scope.comment2, deferArray[1]);
        });
        deferArray[1].promise.then(function() {
            uploadSingleFile($scope.picFile3, $scope.comment3, deferArray[2]);
        });
        $q.all(loopPromises).then(function() {
            $location.path("/interview/thankyou");
            $route.reload();
        });
        uploadSingleFile($scope.picFile1, $scope.comment1, deferArray[0]);
    };
    
});
'use strict';
angular.module('app').controller('sharePdfCtrl', function($scope) {

  $scope.pdfName = 'Relativity: The Special and General Theory by Albert Einstein';
  // $scope.pdfUrl = 'app/shared/share-pdf/relativity.pdf';
  $scope.scroll = true;
  $scope.loading = 'loading';

  $scope.getNavStyle = function(scroll) {
    if(scroll > 100) {
      return 'pdf-controls fixed';
    } else {
      return 'pdf-controls';
    }
  };

  $scope.onError = function(error) {
    console.log(error);
  };

  $scope.onLoad = function() {
    $scope.loading = '';
  };

  $scope.onProgress = function(progress) {
    console.log(progress);
  };

});

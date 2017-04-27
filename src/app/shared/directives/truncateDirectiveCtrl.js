var app = angular.module('app');

app.directive("truncateText", function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/directives/truncateDirectiveView.html',
        scope: {
            longText: '@longText',
            limit: '@limit',
            class: '@class'
        },
        controller: function($scope, $filter, $translate) {  

            $scope.expand = $translate.instant("expandText");
            $scope.collapse = $translate.instant("collapseText");

            $scope.toggleTruncate = function() {
                $scope.truncate = !$scope.truncate;
            }

            function init() {
                $scope.truncate = true;
                if ($scope.longText) {
                    $scope.shortText = $filter('limitTo')($scope.longText, $scope.limit, 0);
                }
            }

            init();
        }
    };
});
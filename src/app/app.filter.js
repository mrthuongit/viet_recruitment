'use strict';

angular.module('app')
    .filter('randomStatistic', function() {
        return function(statistic) {
            var randomNum = Math.ceil(Math.random() * 50);

            return (statistic + randomNum);
        }
    })
    .filter('htmlToPlaintext', function() {
        return function(text) {
            return text ? String(text).replace(/<[^>]+>/gm, ' ') : '';
        };
    })
    .filter('trusted', ['$sce', function ($sce) {
        return function(url) {
            return url ? $sce.trustAsResourceUrl(url) : '';
        };
    }])
    .filter('setFullName', [function() {
        return function(name) {
            var fullName = name;

            if (name && name.indexOf('-') !== -1) {
                var firstName   = name.split('-')[0],
                    lastName    = name.split('-')[1];
                fullName = firstName + ' ' + lastName;
            } 

            return fullName;
        };
    }]);
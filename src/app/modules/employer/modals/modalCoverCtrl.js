'use strict';
angular.module('employerModule')
.controller('ModalCoverLetterCtrl', function($scope, $uibModalInstance, $coverLetterToPdf, data) {

    $scope.candidate = data.candidate;

    $scope.exportPdf = function() {
        var fileName = $scope.candidate.name.replace(/\s+/g, '-') + '_cover_letter.pdf';
        var contentToPdf = $coverLetterToPdf.setContentList($scope.candidate.letter);

        contentToPdf.map(function(obj) {
        	obj.fontSize = 12;
        	obj.color = "#333";

        	return obj;
        });

        var docDefinition = {
            content: contentToPdf
        };

        pdfMake.createPdf(docDefinition).download(fileName);
    }

    /* UI logic */
    $scope.cancel = function () {
        $uibModalInstance.close();
    };
});
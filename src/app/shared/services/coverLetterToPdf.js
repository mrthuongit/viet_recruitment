"use strict";
angular.module('app')
.factory('$coverLetterToPdf', function(http, $filter, PdfMakeConverter) {

    function setContentList(htmlText) {
        var contentList = [];

        if (htmlText) {
            var convertHtmlForPdfmake = PdfMakeConverter.createInstance(); 
            contentList = convertHtmlForPdfmake.convertHTML(htmlText, 'none');
        }

        return contentList;
    }

    return {
        setContentList: setContentList
    };
});
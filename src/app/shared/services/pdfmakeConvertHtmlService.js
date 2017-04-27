"use strict";
angular.module('app')

.factory('HTMLValidizer', function() {
    var HTMLValidizer = {};

    //checks if str is valid HTML. Returns valid HTML if not,
    //return emptystring if empty
    HTMLValidizer.validize = function(str) {
        if (str) {
            var a = document.createElement('div');
            a.innerHTML = str;
            angular.forEach(a.childNodes, function (child) {
                if (child.nodeType == 1) {
                    return str;
                }
            });
            return "<p>" + str + "</p>";
        } else {
            return ""; //needed for blank "reaons" field
        }
    };
    return HTMLValidizer;
})

.factory('PdfMakeConverter', [
    'HTMLValidizer',
    function(HTMLValidizer) {
        /**
         * Converter component for HTML->JSON for pdfMake
         * @constructor
         * @param {object} images   - Key-Value structure representing image.src/BASE64 of images
         * @param {object} pdfMake  - the converter component enhances pdfMake
         */
        var createInstance = function(images, pdfMake) {
            var slice = Function.prototype.call.bind([].slice),
                map = Function.prototype.call.bind([].map),

                DIFF_MODE_NORMAL = 0,
                DIFF_MODE_INSERT = 1,
                DIFF_MODE_DELETE = 2,

                /**
                 * Convertes HTML for use with pdfMake
                 * @function
                 * @param {object} html - html
                 * @param {string} lineNumberMode - [inline, outside, none]
                 */
                convertHTML = function(html, lineNumberMode) {
                    var elementStyles = {
                            "b": ["font-weight:bold"],
                            "strong": ["font-weight:bold"],
                            "u": ["text-decoration:underline"],
                            "em": ["font-style:italic"],
                            "i": ["font-style:italic"],
                            "h1": ["font-size:30"],
                            "h2": ["font-size:28"],
                            "h3": ["font-size:26"],
                            "h4": ["font-size:24"],
                            "h5": ["font-size:22"],
                            "h6": ["font-size:20"],
                            "a": ["color:blue", "text-decoration:underline"],
                            "del": ["color:red", "text-decoration:line-through"],
                            "ins": ["color:green", "text-decoration:underline"]
                        },
                        classStyles = {
                            "delete": ["color:red", "text-decoration:line-through"],
                            "insert": ["color:green", "text-decoration:underline"]
                        },
                        /**
                         * Removes all line number nodes (not line-breaks)
                         * and returns an array containing the reoved numbers (as integer, not as node)
                         *
                         * @function
                         * @param {object} element
                         */
                        extractLineNumbers = function(element) {
                            var foundLineNumbers = [];
                            if (element.nodeName == 'SPAN' && element.getAttribute('class') && element.getAttribute('class').indexOf('os-line-number') > -1) {
                                foundLineNumbers.push(element.getAttribute('data-line-number'));
                                element.parentNode.removeChild(element);
                            } else {
                                var children = element.childNodes,
                                    childrenLength = children.length;
                                for (var i = 0; i < children.length; i++) {
                                    foundLineNumbers = _.union(foundLineNumbers, extractLineNumbers(children[i]));
                                    if (children.length < childrenLength) {
                                        i -= (childrenLength - children.length);
                                        childrenLength = children.length;
                                    }
                                }
                            }
                            return foundLineNumbers;
                        },
                        /**
                         * Parses Children of the current paragraph
                         * @function
                         * @param {object} converted  -
                         * @param {object} element   -
                         * @param {object} currentParagraph -
                         * @param {object} styles -
                         * @param {number} diff_mode
                         */
                        parseChildren = function(converted, element, currentParagraph, styles, diff_mode) {
                            var elements = [];
                            var children = element.childNodes;
                            if (children.length !== 0) {
                                _.forEach(children, function(child) {
                                    currentParagraph = ParseElement(elements, child, currentParagraph, styles, diff_mode);
                                });
                            }
                            if (elements.length !== 0) {
                                _.forEach(elements, function(el) {
                                    converted.push(el);
                                });
                            }
                            return currentParagraph;
                        },
                        /**
                         * Extracts the style from an object
                         * @function
                         * @param {object} o       - the current object
                         * @param {object} styles  - an array with styles
                         */
                        ComputeStyle = function(o, styles) {
                            styles.forEach(function(singleStyle) {
                                var styleDefinition = singleStyle.trim().toLowerCase().split(":");
                                var style = styleDefinition[0];
                                var value = styleDefinition[1];
                                if (styleDefinition.length == 2) {
                                    switch (style) {
                                        case "padding-left":
                                            o.margin = [parseInt(value), 0, 0, 0];
                                            break;
                                        case "font-size":
                                            o.fontSize = parseInt(value);
                                            break;
                                        case "text-align":
                                            switch (value) {
                                                case "right":
                                                case "center":
                                                case "justify":
                                                    o.alignment = value;
                                                    break;
                                            }
                                            break;
                                        case "font-weight":
                                            switch (value) {
                                                case "bold":
                                                    o.bold = true;
                                                    break;
                                            }
                                            break;
                                        case "text-decoration":
                                            switch (value) {
                                                case "underline":
                                                    o.decoration = "underline";
                                                    break;
                                                case "line-through":
                                                    o.decoration = "lineThrough";
                                                    break;
                                            }
                                            break;
                                        case "font-style":
                                            switch (value) {
                                                case "italic":
                                                    o.italics = true;
                                                    break;
                                            }
                                            break;
                                        case "color":
                                            o.color = value;
                                            break;
                                        case "background-color":
                                            o.background = value;
                                            break;
                                    }
                                }
                            });
                        },
                        /**
                         * Parses a single HTML element
                         * @function
                         * @param {object} alreadyConverted  -
                         * @param {object} element   -
                         * @param {object} currentParagraph -
                         * @param {object} styles -
                         * @param {number} diff_mode
                         */
                        ParseElement = function(alreadyConverted, element, currentParagraph, styles, diff_mode) {
                            styles = styles || [];
                            if (element.getAttribute) {
                                var nodeStyle = element.getAttribute("style");
                                if (nodeStyle) {
                                    nodeStyle.split(";").forEach(function(nodeStyle) {
                                        var tmp = nodeStyle.replace(/\s/g, '');
                                        styles.push(tmp);
                                    });
                                }
                                var nodeClass = element.getAttribute("class");
                                if (nodeClass) {
                                    nodeClass.split(" ").forEach(function(nodeClass) {
                                        if (typeof(classStyles[nodeClass]) != 'undefined') {
                                            classStyles[nodeClass].forEach(function(style) {
                                                styles.push(style);
                                            });
                                        }
                                        if (nodeClass == 'insert') {
                                            diff_mode = DIFF_MODE_INSERT;
                                        }
                                        if (nodeClass == 'delete') {
                                            diff_mode = DIFF_MODE_DELETE;
                                        }
                                    });
                                }
                            }
                            var nodeName = element.nodeName.toLowerCase();
                            switch (nodeName) {
                                case "h1":
                                case "h2":
                                case "h3":
                                case "h4":
                                case "h5":
                                case "h6":
                                    currentParagraph = create("text");
                                    /* falls through */
                                case "a":
                                    currentParagraph = parseChildren(alreadyConverted, element, currentParagraph, styles.concat(elementStyles[nodeName]), diff_mode);
                                    alreadyConverted.push(currentParagraph);
                                    break;
                                case "b":
                                case "strong":
                                case "u":
                                case "em":
                                case "i":
                                case "ins":
                                case "del":
                                    currentParagraph = parseChildren(alreadyConverted, element, currentParagraph, styles.concat(elementStyles[nodeName]), diff_mode);
                                    break;
                                case "table":
                                    var t = create("table", {
                                        widths: [],
                                        body: []
                                    });
                                    var border = element.getAttribute("border");
                                    var isBorder = false;
                                    if (border)
                                        if (parseInt(border) == 1) isBorder = true;
                                    if (!isBorder) t.layout = 'noBorders';
                                    currentParagraph = parseChildren(t.table.body, element, currentParagraph, styles, diff_mode);
                                    var widths = element.getAttribute("widths");
                                    if (!widths) {
                                        if (t.table.body.length !== 0) {
                                            if (t.table.body[0].length !== 0)
                                                for (var k = 0; k < t.table.body[0].length; k++)
                                                    t.table.widths.push("*");
                                        }
                                    } else {
                                        var w = widths.split(",");
                                        for (var ko = 0; ko < w.length; ko++) t.table.widths.push(w[ko]);
                                    }
                                    alreadyConverted.push(t);
                                    break;
                                case "tbody":
                                    currentParagraph = parseChildren(alreadyConverted, element, currentParagraph, styles, diff_mode);
                                    break;
                                case "tr":
                                    var row = [];
                                    currentParagraph = parseChildren(row, element, currentParagraph, styles, diff_mode);
                                    alreadyConverted.push(row);
                                    break;
                                case "td":
                                    currentParagraph = create("text");
                                    var st = create("stack");
                                    st.stack.push(currentParagraph);
                                    var rspan = element.getAttribute("rowspan");
                                    if (rspan)
                                        st.rowSpan = parseInt(rspan);
                                    var cspan = element.getAttribute("colspan");
                                    if (cspan)
                                        st.colSpan = parseInt(cspan);
                                    currentParagraph = parseChildren(st.stack, element, currentParagraph, styles, diff_mode);
                                    alreadyConverted.push(st);
                                    break;
                                case "span":
                                    if (element.getAttribute("data-line-number")) {
                                        if (lineNumberMode == "inline") {
                                            if (diff_mode != DIFF_MODE_INSERT) {
                                                var lineNumberInline = element.getAttribute("data-line-number"),
                                                    lineNumberObjInline = {
                                                        text: lineNumberInline,
                                                        color: "#333",
                                                        fontSize: 5
                                                    };
                                                currentParagraph.text.push(lineNumberObjInline);
                                            }
                                        } else if (lineNumberMode == "outside") {
                                            var lineNumberOutline;
                                            if (diff_mode == DIFF_MODE_INSERT) {
                                                lineNumberOutline = "";
                                            } else {
                                                lineNumberOutline = element.getAttribute("data-line-number");
                                            }
                                            var lineNumberObject = {
                                                    width: 20,
                                                    text: lineNumberOutline,
                                                    color: "#333",
                                                    fontSize: 8,
                                                    margin: [0, 2, 0, 0]
                                            },
                                                col = {
                                                    columns: [
                                                        lineNumberObject,
                                                    ]
                                            };
                                            currentParagraph = create("text");
                                            col.columns.push(currentParagraph);
                                            alreadyConverted.push(col);
                                        }
                                    }
                                    else {
                                        currentParagraph = parseChildren(alreadyConverted, element, currentParagraph, styles, diff_mode);
                                    }
                                    break;
                                case "br":
                                    //in case of inline-line-numbers and the os-line-break class ignore the break
                                    if (!(lineNumberMode == "inline" && element.getAttribute("class") == "os-line-break")) {
                                        currentParagraph = create("text");
                                        alreadyConverted.push(currentParagraph);
                                    }
                                    break;
                                case "li":
                                case "div":
                                    currentParagraph = create("text");
                                    var stackDiv = create("stack");
                                    stackDiv.stack.push(currentParagraph);
                                    ComputeStyle(stackDiv, styles);
                                    currentParagraph = parseChildren(stackDiv.stack, element, currentParagraph, [], diff_mode);
                                    alreadyConverted.push(stackDiv);
                                    break;
                                case "p":
                                    currentParagraph = create("text");
                                    currentParagraph.margin = [0,5];
                                    var stackP = create("stack");
                                    stackP.stack.push(currentParagraph);
                                    ComputeStyle(stackP, styles);
                                    currentParagraph = parseChildren(stackP.stack, element, currentParagraph, [], diff_mode);
                                    alreadyConverted.push(stackP);
                                    break;
                                case "img":
                                    // TODO: need a proper way to calculate the space
                                    // left on the page.
                                    // This requires further information
                                    // A4 in 72dpi: 595px x 842px
                                    var maxResolution = {
                                        width: 435,
                                        height: 830
                                    },
                                        width = parseInt(element.getAttribute("width")),
                                        height = parseInt(element.getAttribute("height"));

                                    if (width > maxResolution.width) {
                                        var scaleByWidth = maxResolution.width/width;
                                        width *= scaleByWidth;
                                        height *= scaleByWidth;
                                    }
                                    if (height > maxResolution.height) {
                                        var scaleByHeight = maxResolution.height/height;
                                        width *= scaleByHeight;
                                        height *= scaleByHeight;
                                    }
                                    alreadyConverted.push({
                                        image: BaseMap[element.getAttribute("src")],
                                        width: width,
                                        height: height
                                    });
                                    break;
                                case "ul":
                                case "ol":
                                    var list = create(nodeName);
                                    if (lineNumberMode == "outside") {
                                        var lines = extractLineNumbers(element);
                                        currentParagraph = parseChildren(list[nodeName], element, currentParagraph, styles, diff_mode);
                                        if (lines.length > 0) {
                                            var listCol = {
                                                    columns: [{
                                                        width: 20,
                                                        stack: []
                                                    }]
                                                };
                                            _.forEach(lines, function(line) {
                                                listCol.columns[0].stack.push({
                                                    width: 20,
                                                    text: line,
                                                    color: "#333",
                                                    fontSize: 8,
                                                    margin: [0, 2.35, 0, 0]
                                                });
                                            });
                                            listCol.columns.push(list);
                                            listCol.margin = [0,10,0,0];
                                            alreadyConverted.push(listCol);
                                        } else {
                                            alreadyConverted.push(list);
                                        }
                                    } else {
                                        currentParagraph = parseChildren(list[nodeName], element, currentParagraph, styles, diff_mode);
                                        alreadyConverted.push(list);
                                    }
                                    break;
                                default:
                                    var defaultText = create("text", element.textContent.replace(/\n/g, ""));
                                    ComputeStyle(defaultText, styles);
                                    if (!currentParagraph) {
                                        currentParagraph = {};
                                        currentParagraph.text = [];
                                    }
                                    currentParagraph.text.push(defaultText);
                                    break;
                            }
                            return currentParagraph;
                        },
                        /**
                         * Parses HTML
                         * @function
                         * @param {string} converted      -
                         * @param {object} htmlText   -
                         */
                        ParseHtml = function(converted, htmlText) {
                            var html = HTMLValidizer.validize(htmlText);
                            html = angular.element(html.replace(/\t/g, "").replace(/\n/g, ""));
                            var emptyParagraph = create("text");
                            slice(html).forEach(function(element) {
                                ParseElement(converted, element, null, [], DIFF_MODE_NORMAL);
                            });
                        },
                        content = [];
                    ParseHtml(content, html);
                    return content;
                },
                BaseMap = images,
                /**
                 * Creates containerelements for pdfMake
                 * e.g create("text":"MyText") result in { text: "MyText" }
                 * or complex objects create("stack", [{text:"MyText"}, {text:"MyText2"}])
                 *for units / paragraphs of text
                 *
                 * @function
                 * @param {string} name      - name of the attribute holding content
                 * @param {object} content   - the actual content (maybe empty)
                 */
                create = function(name, content) {
                    var o = {};
                    content = content || [];
                    o[name] = content;
                    return o;
                };
            return {
                convertHTML: convertHTML,
                createElement: create
            };
        };
        return {
            createInstance: createInstance
        };
}]);

var mypdf = (function mypdf() {
    var self = {};

    PDFJS.disableWorker = true;


    self.load = function(url, callback) {
        PDFJS.getDocument(url).then(function getPdfHelloWorld(pdf) {
          var numPages = pdf.numPages;
          var allText = '';

          for(var i=0; i<= numPages; i++) {
            (function(i) {
              pdf.getPage(i).then(function getPageHelloWorld(page) {
                var scale = 1.5;
                var viewport = page.getViewport(scale);

                page.getTextContent().then(function (text) {
                    var extractedString = $.makeArray($(text.bidiTexts).map(function(element,value){return value.str})).join(' '); 

                    allText += extractedString;

                    if(i == numPages) { // last
                        callback(allText);
                    }

                    /*
                    var canvas = document.getElementById('the-canvas');
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };

                    page.render(renderContext);
                    */
                });
              });

            })(i); // i
          }
        });
    };

    return self;

})()

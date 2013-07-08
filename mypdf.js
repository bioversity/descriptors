var mypdf = (function mypdf() {
    var self = {};

    PDFJS.disableWorker = true;


    self.load = function(url) {
        PDFJS.getDocument(url).then(function getPdfHelloWorld(pdf) {
          //
          // Fetch the first page
          //
          pdf.getPage(10).then(function getPageHelloWorld(page) {
            var scale = 1.5;
            var viewport = page.getViewport(scale);

            page.getTextContent().then(function (text) {
                var extractedString = $.makeArray($(text.bidiTexts).map(function(element,value){return value.str})).join(' '); 
                console.log(extractedString);

                var canvas = document.getElementById('the-canvas');
                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                page.render(renderContext);
            });
          });
        });
    };

    return self;

})()

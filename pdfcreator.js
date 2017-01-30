var PDFDocument = require('pdfkit');

var doc = new PDFDocument({
    margin : 0
});
doc.pipe(require('fs').createWriteStream('out.pdf'));

var lstImages = [];

for (var i = 0; i < lstImages.length; i++) {
    doc.addPage({
        size : [ 400, 533 ]
    });
    doc.image('./test.jpeg', 0, 0, {

    });
}

// end and display the document in the iframe to the right
doc.end();

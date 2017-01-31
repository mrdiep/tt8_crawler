var database = require('./tt-database');
var parser = require('./tt-web-parser');
parser.init();

var parserDetail = function(doc) {

    console.log("parser detail for " + doc.commic.href);

    parser.parseRssDetail(doc.commic.href, function(chapter) {

        parser.parseChapter(chapter, function(err, imageArray) {

            if (err === null) {
                database.updateCommicDetail(doc.commic, {
                    info : chapter,
                    images : imageArray
                });
            } else {
                console.log("parse error: " + chapter.link);
                database.insertLog({
                    commic : doc.commic,
                    chapter : chapter,
                    reason : err
                });
            }
        });
    });

}

function parseRss() {

    database.findNotParesed(function(commics) {

        commics.each(function(err, doc) {

            if (doc !== null)
                parserDetail(doc);

        });
    });
}

function parsePage() {

    for (var page = 1; page <= 378; page++) {// 378
        parser.getPage(page, function(comic) {

            database.insertCommic({
                commic : comic
            });
        });
    }
}

database.init(function() {

    parseRss();
});
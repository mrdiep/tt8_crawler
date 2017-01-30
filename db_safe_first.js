var database = require('./database');
var parser = require('./WebParser');

function parseRss() {

    database.findNotParesed(function(commics) {

        console.log(commics.length);
        commics.each(function(err, doc) {

            if (doc !== null && doc.commic !== null && doc.commic !== undefined) {
                parser.parseRssDetail(doc.commic.href, function(chapter) {

                    parser.parseChapter(chapter, function(err, imageArray) {

                        if (err === null) {
                            database.updateCommicDetail(doc, {
                                info : chapter,
                                images : imageArray
                            });
                        } else {
                            console.log("parse error: " + chapter.link);
                            database.insertLog({
                                commic : comic,
                                chapter : chapter,
                                reason : err
                            });
                        }
                    });
                });
            } else {
                console.log('errr');
                console.log(doc);
            }

        });
    });
}

database.init(function() {

    parseRss();
});
parser.init();

function parsePage() {

    for (var page = 1; page <= 378; page++) {// 378
        parser.getPage(page, function(comic) {

            database.insertCommic({
                commic : comic
            });
        });
    }
}

// for (var page = 1; page <= 378; page++) {// 378
// parser.getPage(page, function(comic) {
//
// database.insertCommic({
// commic : comic
// });
//
// parser.parseRssDetail(comic.href, function(chapter) {
//
// parser.parseChapter(chapter, function(err, imageArray) {
//
// if (err === null) {
// database.insertCommic({
// commic : comic,
// chapter : chapter,
// images : imageArray
// });
// } else {
// console.log("parse error: " + chapter.link);
// database.insertLog({
// commic : comic,
// chapter : chapter,
// reason : err
// });
//
// console.log(err);
// }
// });
// });
// });
// }

var database = require('./tt-database');
var parser = require('./tt-web-parser');

database.init();
parser.init();

for (var page = 1; page <= 378; page++) {// 378
    parser.getPage(page, function(comic) {

        parser.parseRssDetailUsingRssRequest(comic.href, function(chapter) {

            parser.parseChapter(chapter, function(err, imageArray) {

                if (err === null) {
                    database.insertCommic({
                        commic : comic,
                        chapter : chapter,
                        images : imageArray
                    });
                } else {
                    console.log("parse error: " + chapter.link);
                    database.insertLog({
                        commic : comic,
                        chapter : chapter,
                        reason : err
                    });

                    console.log(err);
                }
            });
        });
    });
}

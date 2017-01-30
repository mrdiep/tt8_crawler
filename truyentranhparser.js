var truyentranhparser = {
    _http : null,
    _parse5 : null,
    _htmlParser : null,

    init : function() {

        _http = require('http');
        _http.globalAgent.maxSockets = 5;
        _parse5 = require('parse5');
        _htmlParser = require('htmlparser2');

        return this;
    },

    getPage : function(pageIndex, itemCallback) {

        console.log("request get pageIndex = " + pageIndex);
        var triggerenter = '';
        var parse = new _htmlParser.Parser({
            onopentag : function(name, attribute) {

                if (name === 'div' && attribute.id === 'tblChap') {
                    triggerenter = true;
                }
                if (name === 'a' && attribute.class === 'tipsy' && attribute.href !== 'http://truyentranh8.net//') {
                    itemCallback(attribute);
                }
            }
        }, {
            decodeEntities : true
        });

        _http.get('http://truyentranh8.net/search.php?act=search&sort=ten&page=' + pageIndex + '&view=list', function(res) {

            var body = '';
            res.on('data', function(data) {

                body += data;
            });

            res.on('end', function() {

                console.log("get page [index = " + pageIndex + "] completed.");
                parse.write(body);
            });
        });
    },
    parseRssDetail : function(comicLink, chapterCallback) {

        _http.get(comicLink.replace('http://truyentranh8.net/', 'http://truyentranh8.net/RSS.php?truyen='), function(res) {

            var body = '';
            res.on('data', function(data) {

                body += data;
            });

            res.on('end', function() {

                chapterCallback(body);
            });
        });
    },
    parseChapter : function(chapter) {

    }
};

module.exports = truyentranhparser;
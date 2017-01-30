var truyentranhparser = {
    _http : null,

    init : function() {

        _http = require('http');
        _http.globalAgent.maxSockets = 5;

        return this;
    },
    getPage : function(pageIndex, itemCallback) {

        console.log("request get pageIndex = " + pageIndex);

        var parse = function(text) {

            var jsdom = require('jsdom');
            var fs = require("fs");
            var jquery = fs.readFileSync("./jquery.js", "utf-8");

            jsdom.env({
                html : text,
                src : [ jquery ],
                done : function(err, window) {

                    var $ = window.$;
                    $('#tblChap .tipsy').each(function(index, item) {

                        if (item.href !== undefined && item.href !== 'http://truyentranh8.net//') {
                            console.log(item.href);
                            itemCallback({
                                href : item.href,
                                title : item.title
                            });
                        }
                    });
                }
            });
        }

        _http.get('http://truyentranh8.net/search.php?act=search&sort=ten&page=' + pageIndex + '&view=list', function(res) {

            var body = '';
            res.on('data', function(data) {

                body += data;
            });

            res.on('end', function() {

                console.log("get page [index = " + pageIndex + "] completed.");
                parse(body);
            });
        });
    },
    parseRssDetail : function(comicLink, chapterCallback) {

        var link = comicLink.replace('http://truyentranh8.net/', 'http://truyentranh8.net/RSS.php?truyen=');

        if (link.endsWith('/')) {
            link = link.substring(0, link.length - 1);
        }

        console.log("request link = " + link);

        _http.get(link, function(res) {

            var body = '';
            res.on('data', function(data) {

                body += data;
            });

            res.on('end', function() {

                var feed = require('rss-to-json');
                feed.parseString(body, function(err, rss) {

                    if (err != null) {
                        console.log(err);
                        console.log(link);
                    } else {
                        try {
                            rss.items.forEach(function(item, index) {

                                chapterCallback(item);
                            });
                        } catch (err) {
                            console.log(err);
                            console.log(rss);
                        }
                    }
                });

            });
        });

    },
    parseRssDetailUsingRssRequest : function(comicLink, chapterCallback) {

        var link = comicLink.replace('http://truyentranh8.net/', 'http://truyentranh8.net/RSS.php?truyen=');

        if (link.endsWith('/')) {
            link = link.substring(0, link.length - 1);
        }

        console.log("request link = " + link);

        var feed = require('rss-to-json');
        feed.load(link, function(err, rss) {

            try {
                rss.items.forEach(function(item, index) {

                    chapterCallback(item);
                });
            } catch (err) {
                console.log(err);
                console.log(rss);
            }

        });

    },
    parseChapter : function(chapter, imagesCallback) {

        var parse = function(text) {

            var jsdom = require('jsdom');
            var fs = require("fs");
            var jquery = fs.readFileSync("./jquery.js", "utf-8");
            function guid() {

                function s4() {

                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            }
            jsdom.env({
                html : text,
                src : [ jquery ],
                done : function(err, window) {

                    var $ = window.$;
                    var txt = $('#wrapper + script').text().trim();
                    txt = txt.substring(5, txt.length - 1);

                    try {
                        var name = guid();

                        fs.writeFile('./w/' + name + '.js', "module.exports = { imglist : " + txt + " }", 'utf8', function() {

                            try {
                                fs.writeFile('./w/' + name + 'build.js', "module.exports = { imglist : function(){" + require('./w/' + name).imglist + "; return {vip: lstImagesVIP, normal:lstImages}; }}", 'utf8', function() {

                                    try {

                                        var file2 = require('./w/' + name + 'build').imglist();
                                        imagesCallback(null, file2);

                                    } catch (err) {
                                        imagesCallback(err);
                                    }
                                });

                            } catch (err) {
                                imagesCallback(err);
                            }
                        });
                    } catch (err) {
                        imagesCallback(err);
                    }
                }
            });
        }

        _http.get(chapter.link, function(res) {

            var body = '';
            res.on('data', function(data) {

                body += data;
            });

            res.on('end', function() {

                parse(body);
            });
        });
    }
};

module.exports = truyentranhparser;
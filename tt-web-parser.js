var util = require('util'), xml2js = require('xml2js');

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
                            console.log("item.href = " + item.href);
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

        var getRss = function(json) {

            var channel = json.rss.channel;
            var rss = {
                items : []
            };
            if (util.isArray(json.rss.channel))
                channel = json.rss.channel[0];

            if (channel.title) {
                rss.title = channel.title[0];
            }
            if (channel.description) {
                rss.description = channel.description[0];
            }
            if (channel.link) {
                rss.url = channel.link[0];
            }
            if (channel.item) {
                if (!util.isArray(channel.item)) {
                    channel.item = [ channel.item ];
                }
                channel.item.forEach(function(val) {

                    var obj = {};
                    obj.title = !util.isNullOrUndefined(val.title) ? val.title[0] : '';
                    obj.description = !util.isNullOrUndefined(val.description) ? val.description[0] : '';
                    obj.url = obj.link = !util.isNullOrUndefined(val.link) ? val.link[0] : '';

                    if (val.pubDate) {
                        // lets try basis js date parsing for now
                        obj.created = Date.parse(val.pubDate[0]);
                    }
                    if (val['media:content']) {
                        obj.media = val.media || {};
                        obj.media.content = val['media:content'];
                    }
                    if (val['media:thumbnail']) {
                        obj.media = val.media || {};
                        obj.media.thumbnail = val['media:thumbnail'];
                    }
                    if (val.enclosure) {
                        obj.enclosures = [];
                        if (!util.isArray(val.enclosure))
                            val.enclosure = [ val.enclosure ];
                        val.enclosure.forEach(function(enclosure) {

                            var enc = {};
                            for ( var x in enclosure) {
                                enc[x] = enclosure[x][0];
                            }
                            obj.enclosures.push(enc);
                        });

                    }
                    rss.items.push(obj);

                });

            }
            return rss;

        }

        console.log("request link = " + link);

        function parse(xml) {

            var parser = new xml2js.Parser({
                trim : false,
                normalize : true,
                mergeAttrs : true
            });

            parser.addListener("error", function(err) {

                callback(err, null);
            });
            parser.parseString(xml, function(err, result) {

                var rss = getRss(result);

                rss.items.forEach(function(item, index) {

                    chapterCallback(item);
                });
            });

        }

        _http.get(link, function(res) {

            var body = '';
            res.on('data', function(data) {

                body += data;
            });

            res.on('end', function() {

                parse(body);
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

            if (err !== null && err !== undefined) {
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

    },
    parseChapter : function(chapter, imagesCallback) {

        var parse = function(text) {

            var fs = require("fs");

            function guid() {

                function s4() {

                    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            }
            ;

            function parseScriptEncoded(imageScript) {

                try {
                    var name = guid();

                    fs.writeFile('./w/' + name + '.js', "module.exports = { imglist : " + imageScript + " }", 'utf8', function() {

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

            var jquery = fs.readFileSync("./jquery.js", "utf-8");
            var jsdom = require('jsdom');
            jsdom.env({
                html : text,
                src : [ jquery ],
                done : function(err, window) {

                    var $ = window.$;
                    var txt = $('#wrapper + script').text().trim();
                    txt = txt.substring(5, txt.length - 1);
                    parseScriptEncoded(txt);
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
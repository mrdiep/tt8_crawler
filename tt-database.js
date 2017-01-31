var database = {
    _db : '',
    init : function(completed) {

        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost:27017/tt8';

        MongoClient.connect(url, function(err, db) {

            _db = db;
            console.log("Connected correctly to server.");
            completed();
        });

        return this;
    },
    close : function() {

        _db.close();
    },
    insertLog : function(log) {

        var insertDocument = function(log) {

            _db.collection('log').insertOne(log, function(err, result) {

                console.log("Log inserted.")
            });
        };

        insertDocument(log);
        return this;
    },
    insertCommic : function(comic) {

        var insertDocument = function(comic) {

            if (comic == undefined) {
                return this;
            }

            _db.collection('commic4').insertOne(comic, function(err, result) {

                if (err == null) {
                    console.log("Detail inserted: " + comic.href);
                } else {
                    console.log("errors: " + comic.href);
                    console.log(err);
                }
            });
        };

        insertDocument(comic);
        return this;
    },
    updateCommicDetail : function(comic, detail) {

        if (comic == undefined) {
            return this;
        }

        _db.collection('commic3').update({
            'commic.href' : comic.href
        }, {
            $push : {
                chapter : {
                    $each : [ detail ]
                }
            }

        }, function(err, result) {

            if (err == null) {
                console.log("Detail updated: " + detail.info.link);
            } else {
                console.log("errors: " + comic.href);
                console.log(err);
            }
        });

        return this;
    },
    findNotParesed : function(results) {

        results(_db.collection('commic3').find({
            chapter : {
                $exists : false
            }
        }).limit(400));
        console.log(results);
    }
};

module.exports = database;

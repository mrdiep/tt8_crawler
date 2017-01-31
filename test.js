var parser = require('./tt-web-parser');
parser.init();
parser.parseChapter('http://truyentranh8.net/bungaku-shoujo-to-shi-ni-tagari-no-douke-chap-6', function(err, item) {

    console.log(item);
});

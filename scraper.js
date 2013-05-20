var nodeio = require('node.io'),
options = {
    timeout: 10,
    max: 20,
    retries: 3
};

var urls = ['http://www.complex.com/music/2013/05/the-50-best-houston-rap-songs/',
'http://www.complex.com/music/2010/11/the-50-greatest-dipset-songs/',
'http://www.complex.com/music/2013/04/the-25-greatest-harlem-rap-songs-/'];

var createJob = function(urls, dataGrabFn) {
    return {
        input: urls,
        run: function(url) {
            this.getHtml(url, function(err, $, data, headers) {
                if (err) this.exit(err);

                var data = dataGrabFn(url, $, data, headers);

                this.emit(data);
            });
        }
    };
};

var getBaseUrl = function(url) {
    var cleaned = url.replace('//', ''),
    index = cleaned.indexOf('/');

    if (-1 != index) {
        return url.substr(0, index + 2);
    }
    return url;
};

var grabUrls = function(url, $) {
    var urls = [],
    baseUrl = getBaseUrl(url);
    $('.article-slide-belt-slide a').each(function(a) {
        var href = a.attribs.href,
        hashIndex = href.indexOf('#');
        if (-1 != hashIndex) {
            href = href.substr(0, hashIndex);
        }
        var newUrl = baseUrl + href;
        if (newUrl != url) {
            urls.push(newUrl);
        }
    });
    return urls;
};

var getSongInfo = function(url, $, data, headers) {
    try {
        return songInfo = $('#gl_center h1').text;
    } catch (error) {
        console.log('Error: ' + url + '\n' + error);
    }
};

var urlJob = new nodeio.Job(options, createJob(urls, grabUrls)),
capture_output = true,
getSongs = function(dunno, urls) {
    var songJob = new nodeio.Job(options, createJob(urls, getSongInfo));
    nodeio.start(songJob, options, function(huh, songs) {
        var formatted = [];
        for (var x in songs) {
            var songInfo = songs[x];
            matched = songInfo.match(/[0-9]+\.[ ]*([^\"]+)"([^\"]+)"[ ]*(\([0-9]+\))?/);
            if (matched) {
                formatted.push({artist: matched[1], title: matched[2], year: matched[3] || null});
            } else {
                console.log(songInfo);
                formatted.push(songInfo);
            }
        }
        console.log(formatted);
    }, capture_output);
};

nodeio.start(urlJob, options, getSongs, capture_output);

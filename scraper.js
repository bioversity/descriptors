var scraper = {
    get: function(url, callback) {
        $.getJSON(scraperUrl + '?url=' + encodeURIComponent(url) + '&callback=?', function(html) {
            // remove everything but BODY, cuz $() has issues parsing <html> strings.
            //var html = html.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '');
            var $html = $('<div style="display:none;"></div>');
            $('body').append($html);
            $html.html('');

            // add HTMLstring to DOM
            var html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
            $html.append(html);

            callback($html.clone());

            $html.remove();

        })
    }
};

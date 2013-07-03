var descriptors = {
    allPubs: [],
    loadPublication: function(publication) {
        var $descriptor = $('.descriptor').clone();
        $descriptor.removeClass('descriptor');
        $descriptor.show();

        $descriptor.find('img').attr('src', publication.image);
        $descriptor.find('[name=item1]').text(publication.title || publication.subtitle);
        $descriptor.find('.url').attr('href', publication.url);
        if(publication.pdf) {
            $pdf = $descriptor.find('.pdf');
            $pdf.show();
            $pdf.attr('href', publication.pdf);
        }
        $descriptor.find('.price').text(publication.publication_year || publication.pages);

        $('.product-list').append($descriptor);

    },
    getPublicaton: function(url, $html) {
        var cont = $html.find('.user-bioversitypublications-pi1');
        var desc = cont.find('.descTD');

        var publication = {
            url: url,
            title: $.trim(cont.find('h2:first').text()),
            subtitle: $.trim(cont.find('span:first').text()),

            image: base + cont.find('#tablePub tr:first td:first img').attr('src')
        };

        var $pdescs = desc.children('p');

        var firstP = $.trim($pdescs.eq(0).text());
        if(firstP) { // there's a PDF
            publication.description = $.trim($pdescs.eq(2).text());

        } else { // no PDF
            // description it's at index 1
            publication.description = $.trim($pdescs.eq(1).text());
        }

        // PDF
        var $child = desc.children();
        if($child.eq(0).is('a')) {
            // there's a PDF
            publication.pdf = base + $child.eq(0).attr('href');
        }

        // now get second last P
        var $secondLastP = $pdescs.eq($pdescs.length - 2);
        // all B's are keys
        $secondLastP.find('b').each(function(idx, elem) {
            var $elem = $(elem);
            var text = $elem.text();
            text = text.toLowerCase();
            text = text.replace(':', '');
            text = text.replace(' ', '_');
            text = $.trim(text);

            if(text) {
                publication[text] = $.trim($($elem.get(0).nextSibling).text());
            }
        });


        //this.loadPublication(publication);
        this.allPubs.push(publication);

        $dump = $('textarea.dump');
        $dump.show();
        $dump.val(JSON.stringify(this.allPubs, null, 2));
    },

    getUrls: function($html) {
        var urls = $html.find('.publicationBox h4.title a');
        urls.each(function(idx, elem) {
            var $url = $(elem);

            var url = base + $url.attr('href');

            // load this url
            scraper.get(url, function($html) {
                descriptors.getPublicaton(url, $html);
            });
        });
    },

    load: function() {
        for(var i=0; i<dump.length; i++) {
            descriptors.loadPublication(dump[i]);
        }
    },
    getAll: function() {
        function descLoad(counter) {
            scraper.get(all + '&page=' + counter, function($html) {
                descriptors.getUrls($html);

                var found = $html.html().match('No publications found')

                // get second page only if this page doesn't show 
                if(!found) {  //continue to next page
                    descLoad(counter + 1); 
                }
            });
        }

        descLoad(1);
    }

};

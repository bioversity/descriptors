var descriptors = {
    allPubs: [],
    showTextarea: function($elem, $descriptor, val) {
        if($elem.hasClass('selected')) {
            $descriptor.find('.url').show();
            $descriptor.find('textarea').hide();

            $elem.removeClass('selected');

        } else {

            $descriptor.find('.url').hide();
            $descriptor.find('textarea').show().val(val);

            $elem.addClass('selected');
        }
    },
    assignEvents: function($descriptor) {
        var obj = $.data($descriptor, "json");
        var json = JSON.stringify(obj, null, 2);

        $descriptor.find('.parse a').click(function() {
            var $this = $(this);

            $this.text('Parsing...')

            mypdf.load('pdfs/' + obj.pdf, function(text) {
                console.log(text);
                // woo extract regex!
                var space1 = '      ';
                var space2 = '         '; 
                var arr = text.match(/[\d]+\.([\d]+)?(\.[\d]+)?[ ]+[^\(\)\d\.]+/g);
                //var arr = text.match(/[\d]+\.([\d]+)?(\.[\d]+)?[ ]+[A-Z][a-z ]+/g);
                //var arr = text.match(/\d[.\d]+\s+[A-Z][^A-Z]+(?!\S)/g);
                str = 'couldn\'t match regex';
                if(arr) {
                    str = arr.map(function(d) { 
                        var s = $.trim(d).replace(/ +(?= )/g, '');
                        var digits = s.match(/[\d]+/g);
                        var spaces = 0;
                        if(digits) {
                            spaces = digits.length - 1;
                        }
                        for(var i=0; i<spaces; i++) {
                            s = '  ' + s;
                        }
                        return s;
                    }).join('\n');
                }
                descriptors.showTextarea($this, $descriptor, str);
                $this.text('Parse')
            })
        });

        $descriptor.find('.json').click(function() {
            descriptors.showTextarea($(this), $descriptor, json);
        });
    },
    loadPublication: function(publication) {
        var $descriptor = $('.descriptor').clone();
        $descriptor.removeClass('descriptor');
        $descriptor.show();

        $descriptor.find('img').attr('src', 'thumbs/'+ publication.image);
        $descriptor.find('[name=item1]').attr('href', publication.url).text(publication.title || publication.subtitle);
        $descriptor.find('.url').attr('href', publication.url);
        if(publication.pdf) {
            $pdf = $descriptor.find('.parse');
            $pdf.show();
        }
        //$descriptor.find('.price').text(publication.publication_year || publication.pages);

        $.data($descriptor, 'json', publication);

        $('.product-list').append($descriptor);

        this.assignEvents($descriptor);
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
        // description
        if(firstP) { 
            publication.description = $.trim($pdescs.eq(2).text());

        } else { 
            // description it's at index 1
            publication.description = $.trim($pdescs.eq(1).text());
        }

        // PDF
        var $child = desc.children();
        if($child.eq(0).is('a')) {
            // there's a PDF
            publication.pdf = base + $child.eq(0).attr('href');
        }

        // bottom properties
        // get all bolds in desc TD
        var $bolds = $('.descTD b, .descTD p[style="font-weight:bold;"]');

        $bolds.each(function(idx, elem) {
            var $elem = $(elem);
            var text = $elem.text();
            text = text.toLowerCase();
            text = text.replace(':', '');
            text = text.replace(/ /g, '_');
            text = $.trim(text);

            if(text) {
                // check whether it's empty or not
                var $next = $($elem.get(0).nextSibling);
                var value = $.trim($next.text());

                if(value) {
                    publication[text] = value;
                }
            }
        });


        // RAW HTML
        publication.descriptionHTML = $.trim($('.descTD').html());


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

    load: function(searchTerm) {
        $('.product-list').html('');
        for(var i=0; i<pdfs.length; i++) {
            var pub = pdfs[i];
            if(searchTerm) {
                var jsonPub = JSON.stringify(pub);
                if(jsonPub.search(new RegExp(searchTerm, "i")) !== -1) { // found it!
                    descriptors.loadPublication(pub);
                }
            } else {
                descriptors.loadPublication(pub);
            }
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

var mutual_friends;
(function( jq ) {

    mutual_friends = {

        init: function() {
            mutual_friends.init_maginific_popup();

            jq('body').on( 'click', 'a.mutual-friends', mutual_friends.fetch_mutual_friend );
            jq( 'body' ).on('click', '.friendship-button a', mutual_friends.add_remove_friendship )
            jq( document ).ajaxComplete( mutual_friends.rebind_magnific_popup );
        },

        fetch_mutual_friend: function( e ) {

            jqelement = jq(this);

            e.preventDefault();

            jq('div.bmf-white-popup').html('<div class="bmf-spinner"></div>');

            var user_id = jqelement.data('user-id');
            var send_data = {
                action: 'mutual_friends_dialog',
                user_id: user_id
            };

            jq.post( ajaxurl, send_data, function( response ) {

                jq('div.bmf-white-popup').find("div.bmf-spinner").remove();
                jq('div.bmf-white-popup').append( '<button title="Close (Esc)" type="button" class="mfp-close">×</button>'+response );
                jq('div.bmf-white-popup').perfectScrollbar();
            });
        },

        init_maginific_popup: function () {

            jq('a.mutual-friends').magnificPopup({
                items: {
                    src: jq('<div id="buddypress" class="bmf-white-popup"></div>'),
                    type: 'inline'
                },
                showCloseBtn: true,
                closeBtnInside:true
            });
        },

        rebind_magnific_popup: function( event, xhr, settings ) {
            var url = settings.data;
            var action = parameter_value( url, 'action' );

            if ( 'members_filter' == action ) {
                var timer = setTimeout( function() {

                    jqelement = jq('#buddypress').find('a.mutual-friends');

                    if ( 'undefined' != typeof jqelement ) {
                        mutual_friends.init_maginific_popup();
                        clearInterval( timer );
                        return false;
                    }
                }, 1000);
            }
        },
        
        add_remove_friendship: function() {

            jq(this).parent().addClass('loading');
            var fid   = jq(this).attr('id'),
                nonce   = jq(this).attr('href'),
                thelink = jq(this);

            fid = fid.split('-');
            fid = fid[1];

            nonce = nonce.split('?_wpnonce=');
            nonce = nonce[1].split('&');
            nonce = nonce[0];

            jq.post( ajaxurl, {
                    action: 'addremove_friend',
                    'cookie': bp_get_cookies(),
                    'fid': fid,
                    '_wpnonce': nonce
                },
                function(response)
                {
                    var action  = thelink.attr('rel');
                    parentdiv = thelink.parent();

                    if ( action === 'add' ) {
                        jq(parentdiv).fadeOut(200,
                            function() {
                                parentdiv.removeClass('add_friend');
                                parentdiv.removeClass('loading');
                                parentdiv.addClass('pending_friend');
                                parentdiv.fadeIn(200).html(response);
                            }
                        );

                    } else if ( action === 'remove' ) {
                        jq(parentdiv).fadeOut(200,
                            function() {
                                parentdiv.removeClass('remove_friend');
                                parentdiv.removeClass('loading');
                                parentdiv.addClass('add');
                                parentdiv.fadeIn(200).html(response);
                            }
                        );
                    }
                });
            return false;

        }

    };

    
    jq( document).ready( function() { mutual_friends.init() });
})(jQuery);

function parameter_value( url, name ) {
    var result = new RegExp( name + "=([^&]*)", "i").exec(url);
    return result && unescape(result[1]) || "";
}
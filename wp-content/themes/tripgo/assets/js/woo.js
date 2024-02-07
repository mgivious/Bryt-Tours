(function($){
	"use strict";

	/* Popup Sinlge Gallery */
	if( $('.woocommerce-product-gallery__image').length && typeof Fancybox != 'undefined' ){
		Fancybox.bind("[data-fancybox]", {
		  // Your options go here
		});
	}

	/* Login & Register form */
	$('.ova-login-register-woo li a').on('click', function(){
		var type = $(this).data('type');
		$('.ova-login-register-woo li').removeClass('active');
		$(this).parent('li').addClass('active');
		if( type === 'login' ){
			$('.woocommerce #customer_login .woocommerce-form.woocommerce-form-login').css('display', 'block');
			$('.woocommerce #customer_login .woocommerce-form.woocommerce-form-register').css('display', 'none');
		} else if( type === 'register' ){
			$('.woocommerce #customer_login .woocommerce-form.woocommerce-form-register').css('display', 'block');
			$('.woocommerce #customer_login .woocommerce-form.woocommerce-form-login').css('display', 'none');
		}
	})

	/* Video & Gallery */
	$('.ova-video-gallery').each( function() {
    	var that = $(this);

    	// Video
    	var btn_video 		= that.find('.btn-video');
    	var video_container = that.find('.video-container');
    	var modal_close 	= that.find('.ovaicon-cancel');
    	var modal_video 	= that.find('.modal-video');

    	// btn video click
    	btn_video.on( 'click', function() {
    		var url 		= get_url( $(this).data('src') );
    		var controls 	= $(this).data('controls');
    		var option		= '?';
    		option += ( 'yes' == controls.autoplay ) ? 'autoplay=1' 	: 'autoplay=0';
    		option += ( 'yes' == controls.mute ) 	? '&mute=1' 	: '&mute=0';
    		option += ( 'yes' == controls.loop ) 	? '&loop=1' 	: '&loop=0';
    		option += ( 'yes' == controls.controls ) ? '&controls=1' : '&controls=0';
    		option += ( 'yes' == controls.rel ) 		? '&rel=1' 		: '&rel=0';
    		option += ( 'yes' == controls.modest ) 	? '&modestbranding=1' : '&modestbranding=0';

    		if ( url != 'error' ) {
    			option += '&playlist='+url;
    			modal_video.attr('src', "https://www.youtube.com/embed/" + url + option );
    			video_container.css('display', 'flex');
    		}
    	});

    	// close video
    	modal_close.on('click', function() {
    		video_container.hide();
    		modal_video.removeAttr('src');
    	});

    	// window click
    	$(window).click( function(e) {
    		if ( e.target.className == 'video-container' ) {
    			video_container.hide();
    			modal_video.removeAttr('src');
    		}
		});

		// Gallery
		var btn_gallery = that.find('.btn-gallery');

        btn_gallery.on('click', function(){
        	var gallery_data = $(this).data('gallery');
            Fancybox.show(gallery_data, {
            	Image: {
				    Panzoom: {
				      	zoomFriction: 0.7,
				      	maxScale: function () {
				        	return 3;
				      	},
				    },
			  	},
			});
        });
    });

	function get_url( url ) {
	    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	    var match = url.match(regExp);

	    if (match && match[2].length == 11) {
	        return match[2];
	    } else {
	        return 'error';
	    }
	}

	/* Gallery Slideshow */
	$('.ova-gallery-slideshow').each( function() {
		var that 	= $(this);
		var options = that.data('options') ? that.data('options') : {};

		var responsive_value = {
            0:{
                items:1,
                nav:false,
          		slideBy: 1,
            },
            768:{
              	items: 2,
              	slideBy: 1,
            },
            1025:{
              	items: 3,
              	slideBy: 1,
            },
            1300:{
              	items: options.items,
            }
        };
        
        that.owlCarousel({
        	autoWidth: options.autoWidth,
			margin: options.margin,
			items: options.items,
			loop: options.loop,
			autoplay: options.autoplay,
			autoplayTimeout: options.autoplayTimeout,
			center: options.center,
			lazyLoad: options.lazyLoad,
			nav: options.nav,
			dots: options.dots,
			autoplayHoverPause: options.autoplayHoverPause,
			slideBy: options.slideBy,
			smartSpeed: options.smartSpeed,
			rtl: options.rtl,
			navText:[
	          	'<i aria-hidden="true" class="'+ options.nav_left +'"></i>',
	          	'<i aria-hidden="true" class="'+ options.nav_right +'"></i>'
	        ],
			responsive: responsive_value,
        });

        that.find('.gallery-fancybox').off('click').on('click', function() {
			var index = $(this).data('index');
			var gallery_data = $(this).closest('.ova-gallery-popup').find('.ova-data-gallery').data('gallery');

			Fancybox.show(gallery_data, {
            	Image: {
				    Panzoom: {
				      	zoomFriction: 0.7,
				      	maxScale: function () {
				        	return 3;
				      	},
				    },
			  	},
			  	startIndex: index,
			});
		});
	});

	/* Forms */
	$('.ova-forms-product').each( function() {
		var that = $(this);
		var item = that.find('.tabs .item');

		if ( item.length > 0 ) {
			item.each( function( index ) {
			  	if ( index == 0 ) {
			  		$(this).addClass('active');
			  		var id = $(this).data('id');
			  		$(id).show();
			  	}
			});
		}

		item.on('click', function() {
			item.removeClass('active');
			$(this).addClass('active');
			var id = $(this).data('id');

			if ( id == '#booking-form' ) {
				that.find('#request-form').hide();
			}

			if ( id == '#request-form' ) {
				that.find('#booking-form').hide();
			}
			
			$(id).show();
		});
	});

	/* Tabs */
	$('.ova-tabs-product').each( function() {
		var that = $(this);
		var item = that.find('.tabs .item');

		if ( item.length > 0 ) {
			item.each( function( index ) {
			  	if ( index == 0 ) {
			  		$(this).addClass('active');
			  		var id = $(this).data('id');
			  		$(id).show();
			  	}
			});
		}

		item.on('click', function() {
			item.removeClass('active');
			$(this).addClass('active');
			var id = $(this).data('id');

			if ( id == '#tour-description' ) {
				that.find('#tour-included-excluded, #tour-plan, #ova-tour-map, #ova-tour-review ').hide();
			}

			if ( id == '#tour-included-excluded' ) {
				that.find('#tour-description, #tour-plan, #ova-tour-map, #ova-tour-review ').hide();
			}

			if ( id == '#tour-plan' ) {
				that.find('#tour-included-excluded, #tour-description, #ova-tour-map, #ova-tour-review ').hide();
			}

			if ( id == '#ova-tour-map' ) {
				that.find('#tour-included-excluded, #tour-plan, #tour-description, #ova-tour-review ').hide();
			}

			if ( id == '#ova-tour-review' ) {
				that.find('#tour-included-excluded, #tour-plan, #ova-tour-map, #tour-description ').hide();
			}
			
			$(id).show();
		});
	});

	/* Tour Plan Toggled */
	$('.ova-content-single-product .item-tour-plan').each( function() {

		var that = $(this);
		var item = that.find('.tour-plan-title');

		item.on('click', function() {
			$(this).closest('.item-tour-plan').toggleClass('active');
			// change icon
        	if ( that.hasClass('active') ) {
        		$(this).find('i').removeClass('icomoon-chevron-down');
        		$(this).find('i').addClass('icomoon-chevron-up');
        	} else {
        		$(this).find('i').removeClass('icomoon-chevron-up');
        		$(this).find('i').addClass('icomoon-chevron-down');
        	}
		});

	});

	// Tour Location
	if ( $('.tripgo-tour-map').length > 0 ) {
		$('.tripgo-tour-map').each(function() {
			var that 		= $(this);
			var input 		= $('#pac-input')[0];
			var address 	= that.find('.address');
			var latitude 	= address.attr('latitude');
			var longitude 	= address.attr('longitude');
			var zoom 		= address.data('zoom');

			if ( ! zoom ) zoom = 17;
			
			if ( typeof google !== 'undefined' && latitude && longitude ) {
				var map = new google.maps.Map( $('#tour-show-map')[0], {
                    center: {
                        lat: parseFloat(latitude),
                        lng: parseFloat(longitude)
                    },
                    zoom: zoom,
                    gestureHandling: 'cooperative',
                });

                var autocomplete = new google.maps.places.Autocomplete(input);

	            autocomplete.bindTo('bounds', map);

	            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	            var mapIWcontent = $('#pac-input').val();
	            var infowindow = new google.maps.InfoWindow({
	               content: mapIWcontent,
	            });

	            var marker = new google.maps.Marker({
                   map: map,
                   position: map.getCenter(),
                });

                marker.addListener('click', function() {
                   infowindow.open(map, marker);
                });
			}

		});
	}

	$(".ova-content-single-product .elementor-ralated-slide .elementor-ralated").each(function(){
        var owlsl      = $(this) ;
        var owlsl_ops  = owlsl.data('options') ? owlsl.data('options') : {};

        var responsive_value = {
            0:{
                items:1,
            },
            576:{
                items:1,
            },
            767: {
            	items:2,
            },
            960:{
                items:owlsl_ops.items - 1,
            },
            1200:{
                items:owlsl_ops.items
            }
        };
        
        owlsl.owlCarousel({
            margin: owlsl_ops.margin,
            items: owlsl_ops.items,
            loop: owlsl_ops.loop,
            autoplay: owlsl_ops.autoplay,
            autoplayTimeout: owlsl_ops.autoplayTimeout,
            nav: owlsl_ops.nav,
            dots: true,
            autoplayHoverPause: owlsl_ops.autoplayHoverPause,
            slideBy: owlsl_ops.slideBy,
            smartSpeed: owlsl_ops.smartSpeed,
            rtl: owlsl_ops.rtl,
            navText:[
	            '<i class="fa-solid fa-chevron-left"></i>',
	            '<i class="fa-solid fa-chevron-right"></i>',
            ],
            responsive: responsive_value,
        });

      	/* Fixed WCAG */
		owlsl.find(".owl-nav button.owl-prev").attr("title", "Previous");
		owlsl.find(".owl-nav button.owl-next").attr("title", "Next");
		owlsl.find(".owl-dots button").attr("title", "Dots");

    });

 
})(jQuery);
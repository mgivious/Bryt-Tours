(function( $ ) {
    'use strict';
    
        // For View Map in destination detail
        function initMap( $el ) {

            // Find marker elements within map.
            var $markers = $el.find('.marker');

            // Create gerenic map.
            var mapArgs = {
                zoom        : $el.data('zoom') || 16,
                mapTypeId   : google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map( $el[0], mapArgs );

            // Add markers.
            map.markers = [];
            $markers.each(function(){
                initMarker( $(this), map );
            });

            // Center map based on markers.
            centerMap( map );

            // Return map instance.
            return map;
        }

        function initMarker( $marker, map ) {

            // Get position from marker.
            var lat = $marker.data('lat');
            var lng = $marker.data('lng');
            var latLng = {
                lat: parseFloat( lat ),
                lng: parseFloat( lng )
            };

            // Create marker instance.
            var marker = new google.maps.Marker({
                position : latLng,
                map: map
            });

            // Append to reference for later use.
            map.markers.push( marker );

            // If marker contains HTML, add it to an infoWindow.
            if( $marker.html() ){

                // Create info window.
                var infowindow = new google.maps.InfoWindow({
                    content: $marker.html()
                });

                // Show info window when marker is clicked.
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open( map, marker );
                });
            }
        }

        function centerMap( map ) {

            // Create map boundaries from all map markers.
            var bounds = new google.maps.LatLngBounds();
            map.markers.forEach(function( marker ){
                bounds.extend({
                    lat: marker.position.lat(),
                    lng: marker.position.lng()
                });
            });

            // Case: Single marker.
            if( map.markers.length == 1 ){
                map.setCenter( bounds.getCenter() );

            // Case: Multiple markers.
            } else{
                map.fitBounds( bounds );
            }
        }

        // Render on page load.
        $(document).ready(function(){

            // Render map
            $('#ova_destination_admin_show_map').each(function(){
                var map = initMap( $(this) );
            });

            // Mansory Destination Archive
            $('.content-archive-destination').each( function() {
                
                var grid = $(this);
                var run  = grid.masonry({
                    itemSelector: '.item-destination',
                    columnWidth: '.grid-sizer',
                    gutter: 0,
                    percentPosition: true,
                    transitionDuration: 0,
                });

                run.imagesLoaded().progress( function() {
                    run.masonry();
                });
                
            });

            /* Related Tour Destination */
            $('.ova-destination-related-wrapper .ova-product-slider').each( function() {
                var that    = $(this);
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
                        items: options.items-1,
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
            });

        });

})( jQuery );
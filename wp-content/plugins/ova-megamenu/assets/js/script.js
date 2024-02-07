(function($){
    "use strict";

        if (typeof(OVA_MegaMenu) == "undefined") {
            var OVA_MegaMenu = {}; 
        }

        OVA_MegaMenu.init = function(){
            this.FrontEnd.init();
        }
        
        /* Metabox */
        OVA_MegaMenu.FrontEnd = {

            init: function(){
                this.megamenu();  
            },

            megamenu: function(){
                
                var w_window     = $(window).width();
                var w_container  = $('.ovamegamenu_container_default').width();

                $('ul.ova-mega-menu.sub-menu').each(function() {

                    var offset_left  = $(this).offset().left;
                    var offset_right = w_window - ( offset_left + $(this).outerWidth() );   

                    $(this).css('max-width', w_container);

                    if ( $('body').hasClass('rtl') ) {
                        $(this).css({ right: '0', left: '100%' });
                        $(this).css('width', w_window - offset_right - 30);
                    } else {
                        $(this).css('width', w_window - offset_left - 30); 
                    }

                });

            }   
            

        }  

    $(document).ready(function(){
        OVA_MegaMenu.init();
    });

    $(window).resize(function(){
        OVA_MegaMenu.FrontEnd.megamenu(); 
    });

})(jQuery);
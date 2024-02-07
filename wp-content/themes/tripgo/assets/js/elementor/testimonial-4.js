(function($){
	"use strict";
	
	$(window).on('elementor/frontend/init', function () {
		
        elementorFrontend.hooks.addAction('frontend/element_ready/tripgo_elementor_testimonial_4.default', function(){
	       
	        $(".ova-testimonial-4 .slide-testimonials").each(function(){

		        var owlsl 		= $(this) ;
		        var owlsl_ops 	= owlsl.data('options') ? owlsl.data('options') : {};
		        var template 	= owlsl_ops.template;
		       
		        if (template === 'template1') {
			        var responsive_value = {
			            0:{
			              	items:1,
			              	nav:false,
			              	dots: true,
			            },
			            768:{
			              	items:2,
			              	dots:owlsl_ops.dots,
			              	center:false,
			            },
			            1150:{
			             	items:owlsl_ops.items
			            },
			        };
		        }

		        if (template === 'template2' ) {
			        var responsive_value = {
			            0:{
			              items:1,
			              dots: true,
			              nav:false,
			            },
			            767:{
			              items:1
			            },
			            1024:{
			              items:owlsl_ops.items
			            }
			        };
		        }

		        owlsl.owlCarousel({
		          autoWidth: owlsl_ops.autoWidth,
		          margin: owlsl_ops.margin,
		          items: owlsl_ops.items,
		          loop: owlsl_ops.loop,
		          autoplay: owlsl_ops.autoplay,
		          autoplayTimeout: owlsl_ops.autoplayTimeout,
		          center: owlsl_ops.center,
		          nav: false,
		          dots: owlsl_ops.dots,
		          thumbs: owlsl_ops.thumbs,
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
	    	
        });
        
   });

})(jQuery);

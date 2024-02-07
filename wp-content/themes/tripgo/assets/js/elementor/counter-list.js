(function($){
	"use strict";
	

	$(window).on('elementor/frontend/init', function () {
		
        
		elementorFrontend.hooks.addAction('frontend/element_ready/tripgo_elementor_counter_list.default', function(){

			$(".ova-counter-list").appear(function(){
				var count    = $(this).attr('data-count');
				var odometer = $(this).closest('.ova-counter-list').find('.odometer');

		        setTimeout(function(){
				    odometer.html(count);
				}, 500);
				
		    });
		    
		});


   });

})(jQuery);

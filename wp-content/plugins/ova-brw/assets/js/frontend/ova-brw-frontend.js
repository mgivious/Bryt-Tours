(function ($) {
	"use strict";

    var Brw_Frontend = {
       	init: function () {
       		this.brw_datepicker();
            this.submit_button();
            this.ova_collapsed();
            this.ova_ajax_show_total();
            this.ova_ajax_show_total_after_load();
            this.ova_guestspicker();
            this.ova_search_ajax();
            this.ova_choose_time();
            this.ova_duration();
            this.ova_deposit();
            this.ova_remove_from_cart();
        },

        brw_datepicker: function() {
            // get firstday
            var firstDay = 0;
            if ( typeof brw_first_day !== 'undefined' ) {
                firstDay = brw_first_day;
            } else {
                firstDay = $('.ovabrw_datetimepicker').data('firstday');
            }

            /* Calendar language */
            if ( typeof brw_lang_general_calendar !== 'undefined' ) {
                $.datetimepicker.setLocale( brw_lang_general_calendar );
            }

            /* Disabled WeekDays */
            var disabledWeekDays = '';
            if ( typeof brw_disable_week_day !== 'undefined' ) {
                disabledWeekDays = brw_disable_week_day.split(',').map(function(item) {
                    return parseInt(item, 10);
                });
            }
            
            var date_format = 'd-m-Y';
            if ( typeof brw_date_format !== 'undefined' ) {
                date_format = brw_date_format;
            }    
            switch( date_format ){
                case 'd-m-Y':
                    date_format = 'DD-MM-Y';
                    break;
                case 'm/d/Y':
                    date_format = 'MM/DD/Y';
                    break;
                case 'Y/m/d':
                    date_format = 'Y/MM/DD';
                    break;
                case 'Y-m-d':
                    date_format = 'Y-MM-DD';
                    break;
                default:
                    date_format = 'DD-MM-Y';
            }
            
            var today = new Date();

            var nextYear, yearStart, yearEnd;
            if ( typeof brw_next_year !== 'undefined' ) {
                nextYear = brw_next_year;

                if ( nextYear ) {
                    yearStart   = today.getFullYear();
                    yearEnd     = parseInt( yearStart ) + parseInt( nextYear );
                }
            }

            // Setup Mask date for datetimepicker via moment library
            $.datetimepicker.setDateFormatter({
                parseDate: function (date, format) {
                    var d = moment(date, format);
                    return d.isValid() ? d.toDate() : false;
                },
                
                formatDate: function (date, format) {
                    return moment(date).format(format);
                },
            });

            $('.ovabrw_datetimepicker').each(function(){

                /* Disable Date */
                var disabledDates = [];
                var order_time = $(this).data( 'order-time' );

                if ( order_time ) {
                    disabledDates = order_time;
                }

                var tourDisableWeekDay = $(this).data('disable-week-day');
                if ( tourDisableWeekDay ) {
                    disabledWeekDays = tourDisableWeekDay.toString().split(',').map(function(item) {
                        return parseInt( item, 10 );
                    });
                }

                var readonly = $(this).data('readonly');

                if ( readonly != 'readonly' ) {
                    var datePickerOptions = {
                        scrollInput: false,
                        dayOfWeekStart: firstDay,
                        minDate: today,
                        disabledWeekDays: disabledWeekDays,
                        disabledDates: disabledDates,
                        format: date_format,
                        formatDate: date_format,
                        timepicker: false,
                        autoclose: true,
                    }

                    if ( yearStart ) datePickerOptions.yearStart = yearStart;
                    if ( yearEnd ) datePickerOptions.yearEnd = yearEnd;

                    $(this).datetimepicker(datePickerOptions);
                }
            });

            $('.ovabrw_datetimepicker.ovabrw_start_date').focus(function(e) {
                $(this).blur();
            });

            $('.ovabrw_end_date').focus(function() {
                $(this).blur();
            });
            
            $('.ovabrw_datetimepicker.ovabrw_start_date').on('click', function(e){
                /* Disable Date */
                var disabledDates = [];
                var order_time = $(this).data( 'order-time' );

                if ( order_time ) {
                    disabledDates = order_time;
                }

                var readonly = $(this).data('readonly');

                if ( readonly != 'readonly' ) {
                    var datePickerOptions = {
                        scrollInput: false,
                        dayOfWeekStart: firstDay,
                        minDate: today,
                        disabledWeekDays: disabledWeekDays,
                        disabledDates: disabledDates,
                        format: date_format,
                        formatDate: date_format,
                        timepicker: false,
                        autoclose: true,
                    };

                    $(this).datetimepicker(datePickerOptions);
                }
            });

            // Booking Form
            var currentCheckIn = '';

            $('input[name="ovabrw_pickup_date"].ovabrw_datetimepicker').on( 'change', function() {
                var that = $(this);

                if ( that.val() && that.val() != currentCheckIn ) {
                    currentCheckIn  = that.val();
                    var currentForm = that.closest('form');
                    var checkIn     = currentForm.find('.ovabrw_checkin_field');
                    var times       = currentForm.find('.ovabrw_times_field').remove();
                    var checkOut    = currentForm.find('.ovabrw_end_date');
                    var ajaxLoading = currentForm.find('.ovabrw-date-loading');
                    var productID   = currentForm.find('input[name="product_id"]').val();
                    var adults      = currentForm.find('input[name="ovabrw_adults"]').val();
                    var children    = currentForm.find('input[name="ovabrw_childrens"]').val();
                    var babies      = currentForm.find('input[name="ovabrw_babies"]').val();
                    var quantity    = currentForm.find('input[name="ovabrw_quantity"]').val();
                    var error       = currentForm.find('.ajax-show-total .ajax-error');

                    ajaxLoading.show();
                    error.html('').hide();

                    $.ajax({
                        url: ajax_object.ajax_url,
                        type: 'POST',
                        data: ({
                            action: 'ovabrw_show_time',
                            product_id: productID,
                            adults: adults,
                            children: children,
                            babies: babies,
                            quantity: quantity,
                            pickup_date: that.val(),
                        }),
                        success: function(response){
                            if ( response ) {
                                var data = JSON.parse(response);

                                if ( 'error' in data ) {
                                    currentForm.find('button.booking-form-submit').prop('disabled', true);
                                    error.html('').append(data['error']).show();
                                } else {
                                    currentForm.find('button.booking-form-submit').prop('disabled', false);

                                    if ( 'checkout' in data ) {
                                        checkOut.val(data['checkout']);
                                    }

                                    if ( 'durration' in data ) {
                                        checkIn.after(data['durration']);
                                    }

                                    Brw_Frontend.ova_duration();

                                    // Quantity by Guests
                                    if ( 'qty_by_guests' in data && data.qty_by_guests ) {
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('max', data['max_adults']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('min', data['min_adults']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').val(data['val_adults']);

                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('max', data['max_children']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('min', data['min_children']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').val(data['val_children']);

                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('max', data['max_babies']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('min', data['min_babies']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').val(data['val_babies']);

                                        Brw_Frontend.ova_guests_calculate( currentForm );
                                    }

                                    if ( currentForm.hasClass('booking-form') ) {
                                        Brw_Frontend.ova_ajax_show_total_after_load(currentForm);
                                    }
                                }
                            }

                            ajaxLoading.hide();
                        },
                    });
                }
            });

            // Request Booking
            var currentCheckInRB = '';
            
            $('input[name="ovabrw_request_pickup_date"].ovabrw_datetimepicker').on( 'change', function() {
                var that = $(this);

                if ( that.val() && that.val() != currentCheckInRB ) {
                    currentCheckInRB  = that.val();
                    var currentForm = that.closest('form');
                    var checkIn     = currentForm.find('.ovabrw_checkin_field');
                    var times       = currentForm.find('.ovabrw_times_field').remove();
                    var checkOut    = currentForm.find('.ovabrw_end_date');
                    var ajaxLoading = currentForm.find('.ovabrw-date-loading');
                    var productID   = currentForm.find('input[name="product_id"]').val();
                    var adults      = currentForm.find('input[name="ovabrw_adults"]').val();
                    var children    = currentForm.find('input[name="ovabrw_childrens"]').val();
                    var babies      = currentForm.find('input[name="ovabrw_babies"]').val();
                    var quantity    = currentForm.find('input[name="ovabrw_quantity"]').val();
                    var error       = currentForm.find('.ajax-error');

                    ajaxLoading.show();
                    error.html('').hide();

                    $.ajax({
                        url: ajax_object.ajax_url,
                        type: 'POST',
                        data: ({
                            action: 'ovabrw_show_time',
                            product_id: productID,
                            adults: adults,
                            children: children,
                            babies: babies,
                            quantity: quantity,
                            pickup_date: that.val(),
                        }),
                        success: function(response){
                            if ( response ) {
                                var data = JSON.parse(response);

                                if ( 'error' in data ) {
                                    currentForm.find('button.request-form-submit').prop('disabled', true);
                                    error.html('').append(data['error']).show();
                                } else {
                                    currentForm.find('button.request-form-submit').prop('disabled', false);

                                    if ( 'checkout' in data ) {
                                        checkOut.val(data['checkout']);
                                    }

                                    if ( 'durration' in data ) {
                                        checkIn.after(data['durration']);
                                    }

                                    Brw_Frontend.ova_duration();

                                    // Quantity by Guests
                                    if ( 'qty_by_guests' in data && data.qty_by_guests ) {
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('max', data['max_adults']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('min', data['min_adults']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').val(data['val_adults']);

                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('max', data['max_children']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('min', data['min_children']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').val(data['val_children']);

                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('max', data['max_babies']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('min', data['min_babies']);
                                        currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').val(data['val_babies']);

                                        Brw_Frontend.ova_guests_calculate( currentForm );
                                    }

                                    if ( currentForm.hasClass('request-form') ) {
                                        Brw_Frontend.ova_check_max_guests(currentForm);
                                    }
                                }
                            }

                            ajaxLoading.hide();
                        },
                    });
                }
            });
        },

        ova_duration: function() {
            $('form input[name="ovabrw_time_from"]').on( 'change', function() {
                var that = $(this);
                var currentForm = that.closest('form');
                var time        = that.val();
                var productID   = currentForm.find('input[name="product_id"]').val();
                var checkIn     = currentForm.find('input.ovabrw_start_date').val();
                var checkOut    = currentForm.find('input.ovabrw_end_date');
                var ajaxLoading = currentForm.find('.ovabrw_checkout_field .ovabrw-date-loading');
                var adults      = currentForm.find('input[name="ovabrw_adults"]').val();
                var children    = currentForm.find('input[name="ovabrw_childrens"]').val();
                var babies      = currentForm.find('input[name="ovabrw_babies"]').val();
                var quantity    = currentForm.find('input[name="ovabrw_quantity"]').val();
                var error       = currentForm.find('.ajax-show-total .ajax-error');

                ajaxLoading.show();
                checkOut.val('');
                error.html('').hide();
                
                $.ajax({
                    url: ajax_object.ajax_url,
                    type: 'POST',
                    data: ({
                        action: 'ovabrw_duration_change',
                        time: time,
                        product_id: productID,
                        adults: adults,
                        children: children,
                        babies: babies,
                        quantity: quantity,
                        pickup_date: checkIn,
                    }),
                    success: function(response){
                        if ( response ) {
                            var data = JSON.parse(response);

                            if ( 'error' in data ) {
                                if ( currentForm.hasClass('booking-form') ) {
                                    currentForm.find('button.booking-form-submit').prop('disabled', true);
                                }

                                if ( currentForm.hasClass('request-form') ) {
                                    currentForm.find('button.request-form-submit').prop('disabled', true);
                                }
                                
                                error.html('').append(data['error']).show();
                            } else {
                                if ( currentForm.hasClass('booking-form') ) {
                                    currentForm.find('button.booking-form-submit').prop('disabled', false);
                                }

                                if ( currentForm.hasClass('request-form') ) {
                                    currentForm.find('button.request-form-submit').prop('disabled', false);
                                }

                                if ( 'checkout' in data ) {
                                    checkOut.val(data['checkout']);
                                }

                                // Quantity by Guests
                                if ( 'qty_by_guests' in data && data.qty_by_guests ) {
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('max', data['max_adults']);
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('min', data['min_adults']);
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').val(data['val_adults']);

                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('max', data['max_children']);
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('min', data['min_children']);
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').val(data['val_children']);

                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('max', data['max_babies']);
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('min', data['min_babies']);
                                    currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').val(data['val_babies']);

                                    Brw_Frontend.ova_guests_calculate( currentForm );
                                }

                                if ( currentForm.hasClass('booking-form') ) {
                                    Brw_Frontend.ova_ajax_show_total_after_load(currentForm);
                                }

                                if ( currentForm.hasClass('request-form') ) {
                                    Brw_Frontend.ova_check_max_guests(currentForm);
                                }
                            }
                        }

                        ajaxLoading.hide();
                    },
                });
            });
        },

        ova_guests_calculate: function( that = null ) {
            if ( that ) {
                var guestsTotal     = that.find('.ovabrw-guestspicker .gueststotal');
                var inputAdults     = that.find('input[name="ovabrw_adults"]');
                var inputChildren   = that.find('input[name="ovabrw_childrens"]');
                var inputBabies     = that.find('input[name="ovabrw_babies"]');

                var adults = inputAdults.val();
                if ( typeof adults === "undefined" || ! adults ) adults = 0;

                var children = inputChildren.val();
                if ( typeof children === "undefined" || ! children ) children = 0;

                var babies = inputBabies.val();
                if ( typeof babies === "undefined" || ! babies ) babies = 0;

                if ( guestsTotal ) {
                    guestsTotal.text( parseInt(adults) + parseInt(children) + parseInt(babies) );
                }
            }
        },

        ova_check_max_guests: function( that = null ) {
            if ( that ) {
                var productID   = that.find('input[name="product_id"]').val();
                var adults      = that.find('input[name="ovabrw_adults"]').val();
                var children    = that.find('input[name="ovabrw_childrens"]').val();
                var babies      = that.find('input[name="ovabrw_babies"]').val();
                var ajaxLoading = that.find('.ovabrw-date-loading');
                var error       = that.find('.ajax-error');

                ajaxLoading.show();
                error.html('').hide();

                $.ajax({
                    url: ajax_object.ajax_url,
                    type: 'POST',
                    data: ({
                        action: 'ovabrw_check_max_guests',
                        product_id: productID,
                        adults: adults,
                        children: children,
                        babies: babies,
                    }),
                    success: function(response) {
                        if ( response ) {
                            var data = JSON.parse(response);

                            if ( 'error' in data ) {
                                if ( that.hasClass('request-form') ) {
                                    that.find('button.request-form-submit').prop('disabled', true);
                                }
                                
                                error.html('').append(data['error']).show();
                            } else {
                                if ( that.hasClass('request-form') ) {
                                    that.find('button.request-form-submit').prop('disabled', false);
                                }
                            }
                        }

                        ajaxLoading.hide();
                    },
                });
            }
        },

        submit_button: function() {
        	$('.ovabrw_btn_submit').on('click', function(e){
    			var content_required = $(this).closest('.ovabrw_search').data('mesg_required');
    			var flag = true;

    			$(this).closest('.ovabrw_search').find('.content .wrap-error').empty();
                var class_require = $(this).closest('.form_ovabrw').find('.required');
                class_require.each(function(){
    				if ( ! $(this).val() ) {
    					flag = false;
    					$(this).parent('.content').children('.wrap-error').append('<p class="error">'+content_required+'</p>');
    				}
    			});
    			if ( ! flag ) {
    				e.preventDefault();
    				return false;
    			}
    		});

            /* Booking Form submit */
            $('form.booking-form button.booking-form-submit').on('click', function(e) {
                var that = $(this);

                // Loading
                that.addClass('disabled');
                that.find('.ovabrw-submit-loading').show();

                var fieldsRequired = true;

                // Required fields
                function ovabrwBookingRequiredFields() {
                    that.closest('.ova-booking-form').find('.required').each(function() {
                        if ( ! $(this).val() ) {
                            var error = $(this).data('error');

                            $(this).closest('form.booking-form').find('.ajax-error').html('').append(error).show();

                            return fieldsRequired = false;
                        }

                        // Checkbox
                        var type = $(this).attr('type');

                        if ( type == 'checkbox' ) {
                            var val = $(this).closest('.rental_item').find('input:checked').val();

                            if ( ! val ) {
                                var error = $(this).closest('.ovabrw-checkbox').data('error');

                                $(this).closest('form.booking-form').find('.ajax-error').html('').append(error).show();

                                return fieldsRequired = false;
                            }
                        }
                    });

                    return fieldsRequired;
                }

                fieldsRequired = ovabrwBookingRequiredFields();

                if ( ! fieldsRequired ) {
                    // Hide-Loading
                    that.removeClass('disabled');
                    that.find('.ovabrw-submit-loading').hide();

                    return false;
                }

                // reCAPTCHA
                var verifyReCAPTCHA = true;
                var reCAPTCHA = that.closest('form.booking-form').find('#ovabrw-recaptcha-booking-token');

                if ( fieldsRequired && reCAPTCHA.length > 0 ) {
                    var token = reCAPTCHA.val();                    

                    if ( token ) {
                        // Loading
                        that.addClass('disabled');
                        that.find('.ovabrw-submit-loading').show();
                        that.closest('.ova-booking-form').find('.ajax-error').html('').hide();

                        $.ajax({
                            url: ajax_object.ajax_url,
                            type: 'POST',
                            data: ({
                                action: 'ovabrw_verify_reCAPTCHA',
                                token: token,
                            }),
                            success: function(response) {
                                if ( response ) {
                                    that.closest('form.booking-form').find('.ajax-error').html('').append(response).show();

                                    // Hide-Loading
                                    that.removeClass('disabled');
                                    that.find('.ovabrw-submit-loading').hide();
                                } else {
                                    that.closest('form.booking-form').submit();
                                }
                            }
                        });
                    } else {
                        var error = reCAPTCHA.attr('data-mess');
                        that.closest('form.booking-form').find('.ajax-error').html('').append(error).show();

                        // Hide-Loading
                        that.removeClass('disabled');
                        that.find('.ovabrw-submit-loading').hide();
                    }

                    return false;
                }
            });

            /* Request Form submit */
            $('form.request-form button.request-form-submit').on('click', function(e) {
                var that = $(this);

                // Loading
                that.addClass('disabled');
                that.find('.ovabrw-submit-loading').show();

                var fieldsRequired = true;

                // Required fields
                function ovabrwEnquiryRequiredFields() {
                    that.closest('.ova-request-form').find('.required').each(function() {
                        if ( ! $(this).val() ) {
                            var error = $(this).data('error');
                            $(this).closest('form.request-form').find('.ajax-error').html('').append(error).show();

                            return fieldsRequired = false;
                        }

                        // Checkbox
                        var type = $(this).attr('type');

                        if ( type == 'checkbox' ) {
                            var val = $(this).closest('.rental_item').find('input:checked').val();

                            if ( ! val ) {
                                var error = $(this).closest('.ovabrw-checkbox').data('error');

                                $(this).closest('form.request-form').find('.ajax-error').html('').append(error).show();

                                return fieldsRequired = false;
                            }
                        }
                    });

                    return fieldsRequired;
                }
                
                fieldsRequired = ovabrwEnquiryRequiredFields();

                if ( ! fieldsRequired ) {
                    // Hide-Loading
                    that.removeClass('disabled');
                    that.find('.ovabrw-submit-loading').hide();

                    return false;
                }

                // reCAPTCHA
                var reCAPTCHA = that.closest('form.request-form').find('#ovabrw-recaptcha-enquiry-token');

                if ( fieldsRequired && reCAPTCHA.length > 0 ) {
                    var token = reCAPTCHA.val();

                    if ( token ) {
                        // Loading
                        that.addClass('disabled');
                        that.find('.ovabrw-submit-loading').show();
                        that.closest('form.request-form').find('.ajax-error').html('').hide();                        
                        
                        $.ajax({
                            url: ajax_object.ajax_url,
                            type: 'POST',
                            data: ({
                                action: 'ovabrw_verify_reCAPTCHA',
                                token: token,
                            }),
                            success: function(response) {
                                if ( response ) {
                                    that.closest('form.request-form').find('.ajax-error').html('').append(response).show();

                                    // Hide-Loading
                                    that.removeClass('disabled');
                                    that.find('.ovabrw-submit-loading').hide();
                                } else {
                                    that.closest('form.request-form').submit();
                                }
                            }
                        });
                    } else {
                        var error = reCAPTCHA.attr('data-mess');
                        that.closest('form.request-form').find('.ajax-error').html('').append(error).show();

                        // Hide-Loading
                        that.removeClass('disabled');
                        that.find('.ovabrw-submit-loading').hide();
                    }

                    return false;
                }
            });

            /* File */
            $('.ovabrw-file input[type="file"]').each( function() {
                $(this).on( 'change', function(e) {
                    e.preventDefault();
                    var file            = $(this);
                    var limit           = file.data('max-file-size');
                    var max_size_msg    = file.data('max-file-size-msg');
                    var formats_msg     = file.data('formats');
                    var file_mimes      = file.data('file-mimes');
                    var formats_file    = [];

                    if ( typeof( file_mimes ) == 'object' ) {
                        $.each( file_mimes, function( key, val ) {
                            formats_file.push( val );
                        });
                    }

                    file.closest('.ovabrw-file').find('.ovabrw-file-name').html('');
                    
                    var name = this.files[0].name;
                    var size = this.files[0].size;
                    var type = this.files[0].type;
                    
                    if ( name && size && type ) {
                        file.closest('.ovabrw-file').find('.ovabrw-file-name').html(name);

                        var mb = ( size/1048576 ).toFixed(2);

                        if ( mb > limit ) {
                            file.closest('.ovabrw-file').find('.ovabrw-file-name').html(max_size_msg);
                        }

                        if ( $.inArray( type, formats_file ) == -1 ) {
                            file.closest('.ovabrw-file').find('.ovabrw-file-name').html(formats_msg);
                        }
                    }
                });
            });
        },

        ova_collapsed: function() {
            $('.ovabrw-according').off().on('click', function(e){
                e.preventDefault();
                $(this).siblings('.ovabrw_collapse_content').slideToggle();
            });

            //open popup
            $('.ovabrw_open_popup').off().on('click', function(e){
                e.preventDefault();
                $(this).siblings('.popup').css('display', 'block');
            });

            //close popup
            $('.popup-close').on('click', function(e){
                e.preventDefault();
                $(this).parent('.popup-inner').parent('.popup').css('display', 'none');
            });

            $('.popup-close-2').on('click', function(e){
                e.preventDefault();
                $(this).parent('.close_discount').parent('.popup-inner').parent('.popup').css('display', 'none');
            });
        },

        ova_ajax_show_total: function(){
            $( 'body' ).on( 'change', 'form.booking-form', function() {
                if ( $(this).find('input[name="qty-by-guests"]').val() ) {
                    $(this).find('input[name="ovabrw_pickup_date"]').on( 'change', function(e) {
                        return false;
                    });
                    $(this).find('input[name="ovabrw_pickoff_date"]').on( 'change', function(e) {
                        return false;
                    });
                    $(this).find('input[name="ovabrw_time_from"]').on( 'change', function() {
                        return false;
                    });
                }

                Brw_Frontend.ova_ajax_show_total_after_load($(this));
            });

            $('form.booking-form').each( function() {
                var that = $(this);

                var check_in    = that.find('input[name="ovabrw_pickup_date"]').val();
                var check_out   = that.find('input[name="ovabrw_pickoff_date"]').val();
            
                if ( check_in ) {
                    $('.ovabrw_datetimepicker.ovabrw_start_date').blur();
                    Brw_Frontend.ova_ajax_show_total_after_load(that);
                }
            });
        },

        ova_ajax_show_total_after_load: function( that = null ) {
            var pickup_date, timeFrom, dropoff_date, adults, childrens, babies, quantity, resources, services, product_id, deposit, current_date;
            var resources   = [];
            var services    = [];
            var obj_resource, obj_service;
            var custom_ckf = {};

            if ( that != null ) {
                if ( that.find('input[name="product_id"]').val() ) {
                    product_id = that.find('input[name="product_id"]').val();
                }

                if ( that.find('input[name="ovabrw_pickup_date"]').val() ){
                    pickup_date = that.find('input[name="ovabrw_pickup_date"]').val();
                }

                if ( pickup_date ) {
                    setTimeout( function() {
                        if ( that.find('input[name="ovabrw_time_from"]:checked') ) {
                            timeFrom = that.find('input[name="ovabrw_time_from"]:checked').val();
                        }

                        if ( that.find('input[name="ovabrw_pickoff_date"]').val() ) {
                            dropoff_date = that.find('input[name="ovabrw_pickoff_date"]').val();
                        }

                        if ( that.find('input[name="ovabrw_adults"]').val() ) {
                            adults = that.find('input[name="ovabrw_adults"]').val();
                        }

                        if ( that.find('input[name="ovabrw_childrens"]').val() ) {
                            childrens = that.find('input[name="ovabrw_childrens"]').val();
                        }

                        if ( that.find('input[name="ovabrw_babies"]').val() ) {
                            babies = that.find('input[name="ovabrw_babies"]').val();
                        }

                        if ( that.find('input[name="ovabrw_quantity"]').val() ) {
                            quantity = that.find('input[name="ovabrw_quantity"]').val();
                        }

                        if ( that.find('input[name="ova_type_deposit"]:checked').val() ) {
                            deposit = that.find('input[name="ova_type_deposit"]:checked').val();
                        }

                        if ( that.find('input[name="data_custom_ckf"]') ) {
                            var ckf = that.find('input[name="data_custom_ckf"]').data('ckf');
                            
                            if ( ckf ) {
                                $.each( ckf, function( key, obj ) {
                                    if ( obj.type == 'radio' ) {
                                        custom_ckf[key] = that.find('input[name="'+key+'"]:checked').val();
                                    }
                                    if ( obj.type == 'checkbox' ) {
                                        var ob_checkbox = [];
                                        that.find(".ovabrw-checkbox input[type=checkbox]:checked").each(function () {
                                            ob_checkbox.push($(this).val());
                                        });

                                        custom_ckf[key] = ob_checkbox;
                                    }
                                    if ( obj.type == 'select' ) {
                                        custom_ckf[key] = that.find('select[name="'+key+'"]').val();
                                    }
                                });
                            }
                        }

                        // Reference the CheckBoxes and insert the checked CheckBox value in Array.
                        that.find(".ovabrw-resources input[type=checkbox]:checked").each(function () {
                            resources[$(this).data('rs-key')] = $(this).val();
                        });
                        obj_resource = $.extend({}, resources);

                        // Service
                        that.find( "select[name='ovabrw_service[]']" ).each( function() {
                            if( $(this).val() ){
                                services.push($(this).val());    
                            }
                        });
                        obj_service = $.extend({}, services);

                        if ( pickup_date && dropoff_date ) {
                            var ajax_loading = that.find('.ajax-show-total .ajax-loading-total').show();

                            that.find('.ajax-show-total .ajax-error').html('').hide();
                            that.find('.ajax-show-total .show-availables-number').html('');
                            that.find('.ajax-show-total .show-amount-insurance').html('');
                            that.find('.ajax-show-total .show-total-number').html('');

                            $.ajax({
                                url: ajax_object.ajax_url,
                                type: 'POST',
                                data: ({
                                    action: 'ovabrw_calculate_total',
                                    product_id: product_id,
                                    pickup_date: pickup_date,
                                    time_from: timeFrom,
                                    dropoff_date: dropoff_date,
                                    adults: adults,
                                    childrens: childrens,
                                    babies: babies,
                                    quantity: quantity,
                                    deposit: deposit,
                                    resources: JSON.stringify( obj_resource ),
                                    services: JSON.stringify( obj_service ),
                                    custom_ckf: JSON.stringify( custom_ckf ),
                                }),
                                success: function(response){
                                    var data = JSON.parse(response);
                                    if ( data ) {
                                        if ( data.error ) {
                                            that.find('button.booking-form-submit').prop('disabled', true);
                                            that.find('.ajax-show-total .ovabrw-show-amount').css('display', 'none');
                                            that.find('.ajax-show-total .ovabrw-ajax-amount-insurance').hide();
                                            that.find('.ajax-show-total .ajax-error').html('').append(data['error']).show();
                                        } else {
                                            that.find('button.booking-form-submit').prop('disabled', false);

                                            if ( data['adults_price'] ) {
                                                that.find('.ovabrw-wrapper-guestspicker .adults-price').html('').append(data['adults_price']);
                                            }

                                            if ( data['childrens_price'] ) {
                                                that.find('.ovabrw-wrapper-guestspicker .childrens-price').html('').append(data['childrens_price']);
                                            }

                                            if ( data['babies_price'] ) {
                                                that.find('.ovabrw-wrapper-guestspicker .babies-price').html('').append(data['babies_price']);
                                            }

                                            that.find('.ajax-show-total .ovabrw-show-amount').css('display', 'flex');

                                            if ( 'qty_by_guests' in data && data.qty_by_guests ) {
                                                that.find('.ajax-show-total .ovabrw-ajax-availables').css('display', 'none');
                                            } else {
                                                that.find('.ajax-show-total .show-availables-number').html('').append(data['quantity_available']);
                                            }

                                            that.find('.ajax-show-total .show-amount-insurance').html('').append(data['amount_insurance']);
                                            that.find('.ajax-show-total .show-total-number').html('').append(data['line_total']);
                                            that.find('.ajax-show-total .ovabrw-ajax-amount-insurance').show();
                                        }

                                        ajax_loading.hide();
                                    }
                                },
                            });
                        }
                    }, 300 );
                }
            }
        },

        ova_search_ajax: function() {
            if ( $('.ovabrw-search-ajax .wrap-search-ajax').length > 0 ) {
                loadAjaxSearch();
            }

            $('.ovabrw-search-ajax .wrap-search-ajax .ovabrw-btn').on('click', function(e) {
                loadAjaxSearch( true );

                $('html, body').animate({
                    scrollTop: $("#brw-search-ajax-result").offset().top - 250
                }, 500);

                // hide avanced search dropdown and change icon
                var advanced_search       = $(this).closest('.wrap-search-ajax').find('.search-advanced-field-wrapper');
                var advanced_search_input = advanced_search.closest('.ovabrw-search-advanced').find('.search-advanced-input i');
                advanced_search.removeClass('toggled');
                advanced_search_input.removeClass('icomoon-chevron-up');
                advanced_search_input.addClass('icomoon-chevron-down');
                
                // hide filter sort by dropdown 
                $(this).closest('.wrap-search-ajax').find('.input_select_list').hide();

                e.preventDefault();
            });

            /* Result Layout */
            $('.ovabrw-search-ajax').on('click', '.wrap-search-ajax .filter-layout' , function(e) {
                e.preventDefault();

                var that          = $(this);
                var layout_active = $('.wrap-search-ajax .filter-layout-active').attr('data-layout');
                var layout        = that.attr('data-layout');
                var clicked       = that.closest('.wrap-search-ajax').find('.ovabrw-products-result').data('clicked');

                if ( layout != layout_active ) {
                    $('.wrap-search-ajax .filter-layout').removeClass('filter-layout-active');
                    that.addClass('filter-layout-active');

                    if ( clicked ) {
                        loadAjaxSearch( true );
                    } else {
                        loadAjaxSearch();
                    }
                }
            });

            /* Sort by */
            $('.ovabrw-search-ajax').on('click', '.wrap-search-ajax .ovabrw-tour-filter .input_select_list .term_item' , function(e) {
                e.preventDefault();

                var that          = $(this);
                var sort_by_value = that.closest('.filter-sort').find('.input_select_input_value').val();
                var search_result = that.closest('.wrap-search-ajax').find('.brw-search-ajax-result');
                var clicked       = that.closest('.wrap-search-ajax').find('.ovabrw-products-result').data('clicked');

                if( sort_by_value == 'id_desc') {
                    search_result.data('order','DESC');
                    search_result.data('orderby','ID');
                    search_result.data('orderby_meta_key','');
                } else if( sort_by_value == 'rating_desc' ) {
                    search_result.data('order','DESC');
                    search_result.data('orderby','meta_value_num');
                    search_result.data('orderby_meta_key','_wc_average_rating');
                } else if( sort_by_value == 'price_asc' ) {
                    search_result.data('order','ASC');
                    search_result.data('orderby','meta_value_num');
                    search_result.data('orderby_meta_key','_price');
                } else if( sort_by_value == 'price_desc' ) {
                    search_result.data('order','DESC');
                    search_result.data('orderby','meta_value_num');
                    search_result.data('orderby_meta_key','_price');
                }

                if ( clicked ) {
                    loadAjaxSearch( true );
                } else {
                    loadAjaxSearch();
                }
            });

            /* Pagination */
            $(document).on('click', '.ovabrw-search-ajax .wrap-search-ajax .ovabrw-pagination-ajax .page-numbers', function(e) {
                e.preventDefault();

                var that    = $(this);
                var current = $('.wrap-search-ajax .ovabrw-pagination-ajax .current').attr('data-paged');
                var paged   = that.attr('data-paged');
                var clicked = that.closest('.brw-search-ajax-result').find('.ovabrw-products-result').data('clicked');

                if ( current != paged ) {
                    $(window).scrollTop(0);
                    $('.wrap-search-ajax .ovabrw-pagination-ajax .page-numbers').removeClass('current');
                    that.addClass('current');

                    if ( clicked ) {
                        loadAjaxSearch( true );
                    } else {
                        loadAjaxSearch();
                    }
                }
            });

            // Event click clear filter
            $(".ovabrw-tour-filter .clear-filter").on( "click", function(e) {
                e.preventDefault();
                var clear_btn       = $(this);
                var wrap_search     = clear_btn.closest('.wrap-search-ajax');
                var adults          = wrap_search.data('adults');
                var childrens       = wrap_search.data('childrens');
                var babies          = wrap_search.data('babies');
                var sort_by_default = wrap_search.data('sort_by_default');
                var start_price     = wrap_search.data('start-price');
                var end_price       = wrap_search.data('end-price');

                //reset data-paged
                clear_btn.closest('.wrap-search-ajax').find('.ovabrw-pagination-ajax').attr('data-paged', 1);

                // reset all input search bar
                wrap_search.find('#brw-destinations-select-box, .brw_custom_taxonomy_dropdown').val("all").trigger("change");
                wrap_search.find('input[name="ovabrw_pickup_date"]').val('').trigger("change");

                wrap_search.find('input[name="ovabrw_adults"]').val(adults);
                wrap_search.find('input[name="ovabrw_childrens"]').val(childrens);
                wrap_search.find('input[name="ovabrw_babies"]').val(babies);

                if ( typeof adults === "undefined" || ! adults ) {
                    adults = 0;
                }

                if ( typeof childrens === "undefined" || ! childrens ) {
                    childrens = 0;
                }

                if ( typeof babies === "undefined" || ! babies ) {
                    babies = 0;
                }

                wrap_search.find('.ovabrw-guestspicker .gueststotal').html(adults + childrens + babies);

                wrap_search.find('.search-advanced-field-wrapper input:checkbox, .search-advanced-field-wrapper input:radio').removeAttr('checked');

                wrap_search.find('.brw-tour-price-from').val(start_price);
                wrap_search.find('.brw-tour-price-to').val(end_price);
                wrap_search.find('#brw-tour-price-slider .ui-slider-range').css({"left":"0","width":"100%"});
                wrap_search.find('#brw-tour-price-slider  span').css("left","100%");
                wrap_search.find('#brw-tour-price-slider .ui-slider-range + span').css("left","0");

                // reset sort by
                wrap_search.find('.input_select_list .term_item ').removeClass('term_item_selected');
                wrap_search.find('.input_select_list .term_item[data-id="'+sort_by_default+'"]').addClass('term_item_selected');

                var input_select_text = wrap_search.find('.input_select_list .term_item[data-id="'+sort_by_default+'"]').data('value');
                wrap_search.find('.input_select_input').val(input_select_text);
                wrap_search.find('.input_select_input_value').val(sort_by_default);

                var search_result = wrap_search.find('.brw-search-ajax-result');
                if ( sort_by_default == 'id_desc' ) {
                    search_result.data('order','DESC');
                    search_result.data('orderby','ID');
                    search_result.data('orderby_meta_key','');
                } else if( sort_by_default == 'rating_desc' ) {
                    search_result.data('order','DESC');
                    search_result.data('orderby','meta_value_num');
                    search_result.data('orderby_meta_key','_wc_average_rating');
                }  
                else if( sort_by_default == 'price_asc' ) {
                    search_result.data('order','ASC');
                    search_result.data('orderby','meta_value_num');
                    search_result.data('orderby_meta_key','_price');
                } else if( sort_by_default == 'price_desc' ) {
                    search_result.data('order','DESC');
                    search_result.data('orderby','meta_value_num');
                    search_result.data('orderby_meta_key','_price');
                }      

                loadAjaxSearch();
            });

            /* Video & Gallery */
            function video_popup( that ) {

                // Video
                var btn_video = that.find('.btn-video');

                // btn video click
                btn_video.each( function() {
                    $(this).on( 'click', function() {
                        var video_container = $(this).closest('.ova-video-gallery').find('.video-container');
                        var modal_close     = $(this).closest('.ova-video-gallery').find('.ovaicon-cancel');
                        var modal_video     = $(this).closest('.ova-video-gallery').find('.modal-video');

                        var url         = get_url( $(this).data('src') );
                        var controls    = $(this).data('controls');
                        var option      = '?';
                        option += ( 'yes' == controls.autoplay ) ? 'autoplay=1'     : 'autoplay=0';
                        option += ( 'yes' == controls.mute )    ? '&mute=1'     : '&mute=0';
                        option += ( 'yes' == controls.loop )    ? '&loop=1'     : '&loop=0';
                        option += ( 'yes' == controls.controls ) ? '&controls=1' : '&controls=0';
                        option += ( 'yes' == controls.rel )         ? '&rel=1'      : '&rel=0';
                        option += ( 'yes' == controls.modest )  ? '&modestbranding=1' : '&modestbranding=0';

                        if ( url != 'error' ) {
                            option += '&playlist='+url;
                            modal_video.attr('src', "https://www.youtube.com/embed/" + url + option );
                            video_container.css('display', 'flex');
                        }

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
                    });
                });
            }

            function get_url( url ) {
                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var match = url.match(regExp);

                if (match && match[2].length == 11) {
                    return match[2];
                } else {
                    return 'error';
                }
            }

            $(document).find(".wrap-search-ajax .brw-search-ajax-result .ova-video-gallery").each( function() {
                var that = $(this);
            });

            /* Product Gallery Fancybox */
            function product_gallery_fancybox( that ) {
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
            }

            function product_gallery_slider() {
                $('.ova-gallery-slideshow').each( function() {
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
            }

            $(document).find(".wrap-search-ajax .brw-search-ajax-result .ova-video-gallery").each( function() {
                var that = $(this);
            });

            /* load ajax search tour */
            function loadAjaxSearch( clicked = null ) {
                var that            = $(document).find('.ovabrw-search-ajax .wrap-search-ajax');
                var layout          = that.find('.filter-layout-active').attr('data-layout');
                var grid_column     = that.data('grid_column');
                var thumbnailType   = that.data('thumbnail-type');
                
                var destination     = that.find('#brw-destinations-select-box :selected').val();

                var custom_taxonomy = [];
                var taxonomy_value  = [];

                that.find(".brw_custom_taxonomy_dropdown").each(function (index) {
                    var nameTaxonomy    = $(this).attr('name');
                    var valueTaxonomy   = $(this).val();
                    custom_taxonomy[index]  = nameTaxonomy; 
                    taxonomy_value[index]   = valueTaxonomy;
                });

                var start_date      = that.find('input[name="ovabrw_pickup_date"]').val();
                var adults          = that.find('input[name="ovabrw_adults"]').val();
                var childrens       = that.find('input[name="ovabrw_childrens"]').val();
                var babies          = that.find('input[name="ovabrw_babies"]').val();
                var start_price     = that.find('.brw-tour-price-from').val();
                var end_price       = that.find('.brw-tour-price-to').val();
                var review_score    = [];
                var categories      = [];
                var duration_from   = that.find('.duration-filter:checked').val();
                var duration_to     = that.find('.duration-filter:checked').nextAll('.duration-filter-to').val();
                var duration_type   = that.find('.duration-filter:checked').nextAll('.duration-filter-type').val();

                that.find(".rating-filter:checked").each(function (index) {
                    review_score[index] = $(this).val(); 
                });
                
                that.find(".tour-category-filter:checked").each(function (index) {
                    categories[index] = $(this).val();
                });

                var result           = that.find('.brw-search-ajax-result');
                var order            = result.data('order');
                var orderby          = result.data('orderby');
                var orderby_meta_key = result.data('orderby_meta_key');
                var posts_per_page   = result.data('posts-per-page');
                var default_category = result.data('defautl-category');
                var show_category    = result.data('show-category');
                var paged            = result.find('.ovabrw-pagination-ajax .current').attr('data-paged');

                that.find('.wrap-load-more').show();

                var data_ajax   = {
                    action: 'ovabrw_search_ajax',
                    order: order,
                    orderby: orderby,
                    orderby_meta_key: orderby_meta_key,
                    posts_per_page: posts_per_page,
                    default_category: default_category,
                    show_category: show_category,
                    paged: paged,
                    layout: layout,
                    grid_column: grid_column,
                    thumbnail_type: thumbnailType,
                    destination: destination,
                    custom_taxonomy: custom_taxonomy,
                    taxonomy_value: taxonomy_value,
                    start_date: start_date,
                    adults: adults,
                    childrens: childrens,
                    babies: babies,
                    start_price: start_price,
                    end_price: end_price,
                    review_score: review_score,
                    categories: categories,
                    duration_from: duration_from,
                    duration_to: duration_to,
                    duration_type: duration_type,
                    clicked: clicked,
                };

                $.ajax({
                    url: ajax_object.ajax_url,
                    type: 'POST',
                    data: data_ajax,
                    success:function(response) {
                        if( response ){
                            var json = JSON.parse( response );
                            var item = $(json.result).fadeOut(300).fadeIn(500);
                            result.html(item);

                            // update number results found
                            var number_results_found =  result.find('.tour_number_results_found').val();

                            if ( number_results_found == undefined ) {
                                number_results_found = 0 ;
                            };

                            result.closest('.wrap-search-ajax').find('.number-result-tour-found').html('').append( number_results_found  );
                            
                            // hide icon loading ajax
                            that.find('.wrap-load-more').hide();
                            video_popup( that );
                            product_gallery_fancybox( that );
                            product_gallery_slider();
                        }
                    },
                });
            }
        },

        ova_guestspicker: function() {
            $("form.booking-form .ovabrw-wrapper-guestspicker").each(function(){
                var that = $(this);
                var guestspicker = that.find('.ovabrw-guestspicker');
                var guestspicker_content = that.find('.ovabrw-guestspicker-content')

                guestspicker.on('click', function() {
                    guestspicker_content.toggle();
                });

                $(window).click( function(e) {
                    if ( !guestspicker.is(e.target) && guestspicker.has(e.target).length === 0 && !guestspicker_content.is(e.target) && guestspicker_content.has(e.target).length === 0 ) {
                        guestspicker_content.hide();
                    }
                });

                var minus = that.find('.minus');
                minus.on('click', function() {
                    gueststotal($(this), 'sub', 'booking');
                });

                var plus = that.find('.plus');
                plus.on('click', function() {
                    gueststotal($(this), 'sum', 'booking');
                });
            });

            $("form.request-form .ovabrw-wrapper-guestspicker").each(function(){
                var that = $(this);
                var guestspicker = that.find('.ovabrw-guestspicker');
                var guestspicker_content = that.find('.ovabrw-guestspicker-content')

                guestspicker.on('click', function() {
                    guestspicker_content.toggle();
                });

                $(window).click( function(e) {
                    if ( !guestspicker.is(e.target) && guestspicker.has(e.target).length === 0 && !guestspicker_content.is(e.target) && guestspicker_content.has(e.target).length === 0 ) {
                        guestspicker_content.hide();
                    }
                });

                var minus = that.find('.minus');
                minus.on('click', function() {
                    gueststotal($(this), 'sub', 'request');
                });

                var plus = that.find('.plus');
                plus.on('click', function() {
                    gueststotal($(this), 'sum', 'request');
                });
            });

            function gueststotal( that, cal, form = 'booking' ) {
                var maxGuest        = that.closest('.ovabrw-wrapper-guestspicker').find('input[name="ovabrw_max_total_guest"]').val();
                var formBooking     = that.closest('form.booking-form');
                var formRequest     = that.closest('form.request-form');
                var guests_button   = that.closest('.guests-button');
                var input   = guests_button.find('input[type="text"]');
                var value   = input.val();
                var min     = input.attr('min');
                var max     = input.attr('max');
                var wrapper_guestspicker = that.closest('.ovabrw-wrapper-guestspicker');

                if ( cal == 'sub' && parseInt(value) > parseInt(min) ) {
                    input.val(parseInt(value) - 1);

                    if ( 'booking' === form ) {
                        Brw_Frontend.ova_ajax_show_total_after_load(formBooking);
                    }

                    if ( 'request' === form ) {
                        if ( formRequest.hasClass('request-form') ) {
                            Brw_Frontend.ova_check_max_guests(formRequest);
                        }
                    }
                }

                if ( cal == 'sum' && parseInt(value) < parseInt(max) ) {
                    if ( maxGuest ) {
                        var adults = wrapper_guestspicker.find('.ovabrw_adults').val();

                        if ( typeof adults === "undefined" || ! adults ) adults = 0;

                        var childrens = wrapper_guestspicker.find('.ovabrw_childrens').val();

                        if ( typeof childrens === "undefined" || ! childrens ) childrens = 0;

                        var babies = wrapper_guestspicker.find('.ovabrw_babies').val();

                        if ( typeof babies === "undefined" || ! babies ) babies = 0;

                        if ( ( parseInt(adults) + parseInt(childrens) + parseInt(babies) ) > ( maxGuest - 1 ) ) {
                            return false;
                        }
                    }
                    
                    input.val(parseInt(value) + 1);

                    if ( 'booking' === form ) {
                        Brw_Frontend.ova_ajax_show_total_after_load(formBooking);
                    }

                    if ( 'request' === form ) {
                        if ( formRequest.hasClass('request-form') ) {
                            Brw_Frontend.ova_check_max_guests(formRequest);
                        }
                    }
                }

                var adults = wrapper_guestspicker.find('.ovabrw_adults').val();

                if ( typeof adults === "undefined" || ! adults ) adults = 0;

                var childrens = wrapper_guestspicker.find('.ovabrw_childrens').val();

                if ( typeof childrens === "undefined" || ! childrens ) childrens = 0;

                var babies = wrapper_guestspicker.find('.ovabrw_babies').val();

                if ( typeof babies === "undefined" || ! babies ) babies = 0;

                var gueststotal = wrapper_guestspicker.find('.gueststotal');

                if ( gueststotal ) {
                    gueststotal.text( parseInt(adults) + parseInt(childrens) + parseInt(babies) );
                }
            }
        },

        ova_choose_time: function() {
            $('.ovabrw_fixed_time').each( function() {
                ova_generate_time($(this));
            });

            $('.ovabrw_fixed_time').on( 'change', function() {
                ova_generate_time($(this));
            });

            function ova_generate_time( that ) {
                if ( that ) {
                    var currentForm = that.closest('form');
                    var qtyByGuest  = currentForm.find('input[name="qty-by-guests"]').val();
                    var times       = that.val();

                    if ( times ) {
                        var data_time   = times.split('|');
                        var check_in    = data_time[0];
                        var check_out   = data_time[1];

                        that.closest('form').find('.ovabrw_start_date').val(check_in);
                        that.closest('form').find('.ovabrw_end_date').val(check_out);

                        if ( qtyByGuest && check_in && check_out ) {
                            var ajaxLoading = currentForm.find('.ovabrw-date-loading');
                            var productID   = currentForm.find('input[name="product_id"]').val();
                            var adults      = currentForm.find('input[name="ovabrw_adults"]').val();
                            var children    = currentForm.find('input[name="ovabrw_childrens"]').val();
                            var babies      = currentForm.find('input[name="ovabrw_babies"]').val();
                            var quantity    = currentForm.find('input[name="ovabrw_quantity"]').val();
                            var error       = currentForm.find('.ajax-show-total .ajax-error');

                            ajaxLoading.show();
                            error.html('').hide();

                            $.ajax({
                                url: ajax_object.ajax_url,
                                type: 'POST',
                                data: ({
                                    action: 'ovabrw_choose_time',
                                    check_in: check_in,
                                    check_out: check_out,
                                    product_id: productID,
                                    adults: adults,
                                    children: children,
                                    babies: babies,
                                    quantity: quantity
                                }),
                                success: function(response){
                                    if ( response ) {
                                        var data = JSON.parse(response);

                                        if ( 'error' in data ) {
                                            currentForm.find('button.booking-form-submit').prop('disabled', true);
                                            error.html('').append(data['error']).show();
                                        } else {
                                            currentForm.find('button.booking-form-submit').prop('disabled', false);

                                            // Quantity by Guests
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('max', data['max_adults']);
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').attr('min', data['min_adults']);
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_adults"]').val(data['val_adults']);

                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('max', data['max_children']);
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').attr('min', data['min_children']);
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_childrens"]').val(data['val_children']);

                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('max', data['max_babies']);
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').attr('min', data['min_babies']);
                                            currentForm.find('.ovabrw-wrapper-guestspicker input[name="ovabrw_babies"]').val(data['val_babies']);

                                            Brw_Frontend.ova_guests_calculate( currentForm );

                                            if ( currentForm.hasClass('booking-form') ) {
                                                Brw_Frontend.ova_ajax_show_total_after_load(currentForm);
                                            }

                                            if ( currentForm.hasClass('request-form') ) {
                                                Brw_Frontend.ova_check_max_guests(currentForm);
                                            }
                                        }
                                    }

                                    ajaxLoading.hide();
                                },
                            });
                        }
                    }
                }
            }
        },

        ova_deposit: function() {
            $('form.booking-form .ovabrw-deposit .ovabrw-type-deposit').each( function() {
                var deposit = $(this).find('input[name="ova_type_deposit"]:checked').val();

                if ( deposit == 'full' ) {
                    $(this).closest('.ovabrw-deposit').find('.title-deposite').hide();
                } else {
                    $(this).closest('.ovabrw-deposit').find('.title-deposite').show();
                }
            });

            $('form.booking-form .ovabrw-deposit .ovabrw-type-deposit').on( 'change', function() {
                var deposit = $(this).find('input[name="ova_type_deposit"]:checked').val();

                if ( deposit == 'full' ) {
                    $(this).closest('.ovabrw-deposit').find('.title-deposite').hide();
                } else {
                    $(this).closest('.ovabrw-deposit').find('.title-deposite').show();
                }
            });
        },

        ova_remove_from_cart: function() {
            $(document).on( 'click', '.remove_from_cart_button', function() {
                var that = $(this);
                var cart_item_key = that.data( 'cart_item_key' );

                ovabrwRemoveCart(cart_item_key);
            });

            $(document).on( 'click', '.cart .product-remove a.remove', function(e) {
                e.preventDefault();
                var url     = $(this).attr('href');
                var params  = ovabrwGetUrlParams( url );

                if ( params.remove_item ) {
                    ovabrwRemoveCart(params.remove_item);
                }
            });

            function ovabrwRemoveCart( cart_item_key = '' ) {
                if ( cart_item_key ) {
                    $.ajax({
                        url: ajax_object.ajax_url,
                        type: 'POST',
                        data: {
                            action: 'ovabrw_remove_cart',
                            cart_item_key: cart_item_key,
                        },
                        success:function(response) {
                            if ( response != '' ) {
                                $('.ova-menu-cart').find('.cart-total .items').html( response );
                            }
                        },
                    });
                }
            }

            function ovabrwGetUrlParams( inputUrl = '' ) {
                var params = {};

                if ( inputUrl && inputUrl.trim() !== '' ) {
                    var tempAnchor  = document.createElement('a');
                    tempAnchor.href = inputUrl;

                    var queryString = tempAnchor.search.slice(1);
                    var pairs = queryString.split('&');

                    for ( var i = 0; i < pairs.length; i++ ) {
                        var pair    = pairs[i].split('=');
                        var key     = decodeURIComponent(pair[0]);
                        var value   = decodeURIComponent(pair[1] || '');

                        params[key] = value;
                    }
                }

                return params;
            }
        },
    };

    /* ready */
    $(document).ready(function () {
        Brw_Frontend.init();
    });

})(jQuery);
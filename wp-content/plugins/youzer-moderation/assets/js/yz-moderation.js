( function( $ ) {

	'use strict';

	$( document ).ready( function() {

		var yz_report_button;

		/**
		 * Add Report.
		 */
		$( document ).on( 'click',  '#yz-add-report' , function( e ) {

    		e.preventDefault();

			var data = $( '#yz-report-form' ).serialize() +
			"&action=yz_handle_user_reports" +
			"&operation=" + $( this ).attr( 'data-action' ) +
			"&security=" + Youzer.security_nonce;

    		var submit_button = $( this );

    		var button_title = submit_button.text();

    		// Disable Submit Button.
    		submit_button.attr( 'disabled', 'disabled' );
		    
		    // Show Loader.
		    submit_button.addClass( 'loading' );

			// Process.
			$.post( ajaxurl, data, function( response ) {

				// Remove loading spinner.
		    	submit_button.removeClass( 'loading' );
            	
            	// Get Response Data.
            	var res = $.parseJSON( response );

				if ( res.error ) {

	            	// Show Error Message
	            	$.yz_DialogMsg( 'error', res.error );

		    		// Disable Submit Button.
		    		submit_button.attr( 'disabled', false );

					return false;

				} else {

		    		submit_button.closest( '.yz-modal' ).fadeOut( 300, function() {
		    			$( this ).remove();
		    		});

		    		// Change Button Title.
					// if ( yz_report_button.parent().attr( 'class' ) != 'yz-item-tools' ) {
	    				// yz_report_button.find( '.yz-tool-name' ).text( Yz_Reviews.edit_review );
					// }

					// Update Button Action
					if ( res.action == 'edit' ) {

						yz_report_button.attr( 'data-item-id', res.item_id );
						yz_report_button.attr( 'data-action', 'edit' );

						yz_report_button.find( '.yz-tool-name' ).text( res.button_title );
						yz_report_button.find( '.yz-tool-icon i' ).removeClass().addClass( 'fas fa-edit' );
						if ( yz_report_button.attr( 'data-yztooltip' ) !== undefined ) {
							yz_report_button.attr( 'data-yztooltip', res.button_title );
						}

					} else if ( res.action == 'delete_button' ) {
		    			yz_report_button.remove();
					}					

	            	// Show Error Message
	            	$.yz_DialogMsg( 'success', res.msg );

	            	$( '.yz-modal-overlay').fadeOut();

					return false;
				}

			}).fail( function( xhr, textStatus, errorThrown ) {

	    		// Enable Submit Button.
	    		submit_button.attr( 'disabled', 'disabled' );			    


            	// Show Error Message
            	$.yz_DialogMsg( 'error', Youzer.unknown_error );

				return false;

    		});

    	});

    	/**
    	 * Display User Review Form
    	 */
		$( document ).on( 'click',  '.yz-report-btn, .yz-report-tool, .yz-report-comment,.yz-report-activity, .yz-report-message' , function( e ) {
			
    		e.preventDefault();

    		// Set Global
    		yz_current_button = $( this );

    		// Init Vars
    		var yz_current_button = $( this ), type, item_id = null, button_icon = null, old_icon = null;

    		// Get User ID.
    		if ( yz_current_button.hasClass( 'yz-report-comment' ) ) {
    			old_icon = $( this ).find( 'i' ).attr( 'class' );
    			yz_current_button.find( 'i' ).attr( 'class', 'fas fa-spinner fa-spin' );
    			var li = $( this ).closest( 'li' );
    			item_id = li.attr( 'id' ).substr( 9, li.attr( 'id' ).length );
    			type = 'comment';
    		} else if ( yz_current_button.hasClass( 'yz-report-activity' ) ) {
    			old_icon = $( this ).find( 'i' ).attr( 'class' );
    			yz_current_button.find( 'i' ).attr( 'class', 'fas fa-spinner fa-spin' );
    			var li = $( this ).closest( 'li' );
    			item_id = li.attr( 'id' ).substr( 9, li.attr( 'id' ).length );
    			type = 'activity';
    		} else if ( yz_current_button.hasClass( 'yz-report-message' ) ) {
    			old_icon = $( this ).find( 'i' ).attr( 'class' );
    			yz_current_button.find( 'i' ).attr( 'class', 'fas fa-spinner fa-spin' );
    			item_id = $( this ).attr( 'data-message-id' );
    			type = 'message';
    		} else if ( yz_current_button.parent().hasClass( 'yz-user-tools' ) ) {
    			item_id = $( this ).parent().attr( 'data-user-id' );
    			type = 'user';
    		}  else if ( yz_current_button.parent().hasClass( 'yz-group-tools' ) ) {
    			item_id = $( this ).parent().attr( 'data-group-id' );
    			type = 'group';
    		} else {
    			item_id = $( this ).parent( '.yz-item-tools' ).data( 'activity-id' );
    			type = 'activity';
    		}

    		// Disable Click On Displaying Share Box. 
    		if ( $( this ).hasClass( 'loading' ) ) {
    			return false;
    		}

    		// Add Loading Class.
    		yz_current_button.addClass( 'loading' );

    		// Get Button Data.
			var data = {
				component: type,
				item_id: item_id,
				security: Youzer.security_nonce,
				action : 'yz_get_user_report_form',
			};
			
			// Process Verification.
			$.post( Youzer.ajax_url, data, function( response ) {

	    		// Remove Loading Class.
	    		yz_current_button.removeClass( 'loading' );

	    		if ( yz_current_button.hasClass( 'yz-report-activity' ) || yz_current_button.hasClass( 'yz-report-comment' ) || yz_current_button.hasClass( 'yz-report-message') ) {
					yz_current_button.find( 'i' ).attr( 'class', old_icon );		    			
	    		}

            	// Get Response Data.
				if ( $.yz_isJSON( response ) ) {

            		var res = $.parseJSON( response );

	            	// Show Error Message
	            	$.yz_DialogMsg( 'error', res.error );

					return false;

				}

				// Mark Button As laoded.
				yz_current_button.attr( 'data-loaded', 'true' );

	    		var $form = $( response );
	    		
				if ( jQuery().niceSelect ) {
					$form.find( 'select' ).not( '[multiple="multiple"]' ).niceSelect();
				}

				// Append Content.
				$( 'body' ).append( $form );

	    		$form.find( '.yz-modal' ).css( { 'position': 'absolute', 'top': $( document ).scrollTop() + 100 } );

	    		if ( ! $( '.yz-modal-overlay')[0] ) {	
	    			$( 'body' ).append( '<div class="yz-modal-overlay"></div>' );
	    		} else {
	    			$( '.yz-modal-overlay' ).fadeIn();
	    		}

			}).fail( function( xhr, textStatus, errorThrown ) {

				// Remove Loading Class.
	    		yz_current_button.removeClass( 'loading' );

            	// Show Error Message
            	$.yz_DialogMsg( 'error', Youzer.unknown_error );

				return false;

    		});

		});

	});

})( jQuery );
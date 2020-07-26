
var nt_autosave_running = false;

function ldnt_start_autosave() {

    setTimeout(function() {
        if( nt_autosave_running == true ) {
            jQuery('#nt-note-submit').click();
            ldnt_start_autosave();
        }
    }, 30000 );

}

function nt_save_coordinates( ui ) {

    data = {};

    if( ui.size ) {
        data.width          = ui.size.width;
        data.height         = ui.size.height;
        data.tinymce_height = jQuery('#nt-note-body_ifr').height();
    }

    if( ui.position ) {
        data.position_top  = ui.position.top;
        data.position_left = ui.position.left;
    }

    jQuery.ajax({
        url     : nt_ajax_call.adminAjax + '?action=nt_note_save_coordinates',
        type    : 'post',
        data    : data,
        success: function( data ) {
        }
    });

}

jQuery.expr.filters.offscreen = function(el) {
  var rect = el.getBoundingClientRect();
  return (
           (rect.x + rect.width) < 0 || (rect.y + rect.height) < 0 || (rect.x > window.innerWidth || rect.y > window.innerHeight)
         );
};

function nt_check_if_outside_window() {

    if( jQuery('.nt-note-wrapper').is(':offscreen') ) {

        jQuery( '.nt-note-wrapper' ).css({
            left        : 'auto',
            right       : '15px',
            top         : '30%',
            width       : 'auto',
            height      :   'auto'
        }).removeClass( 'nt-resized' );

        jQuery( '#nt-note-body_ifr' ).css( 'height', 'auto' );

        nt_reset_coordinates();
    }

}

function nt_reset_coordinates() {

    data = {
        width           : 'reset',
        height          : 'reset',
        position_top    : 'reset',
        position_left   : 'reset',
        tinymce_height  : 'reset'
    };

    jQuery.ajax({
        url     : nt_ajax_call.adminAjax + '?action=nt_note_save_coordinates',
        type    : 'post',
        data    : data,
        success: function( data ) {


        }
    });

}

jQuery(function($) {

    if( $( '.nt-note-wrapper' ).length ) {

        if( !$('.nt-note-wrapper').parents('.ldnt-in-content-notes').length ) {
            wrapper = $('.nt-note-wrapper').detach();
            $('body').prepend(wrapper);
        }

        $( ".nt-note-wrapper" ).draggable({
            start: function( e, ui ) {
                $( this ).addClass( 'nt-dragged' );
            },
            snapMode: "inner",
            containment: "window",
            stop: function( e, ui ) {
                nt_save_coordinates( ui );
            }
        }).resizable({

            start: function( e, ui ) {
                $( this ).addClass( 'nt-resized' );
            },
            alsoResize: '#nt-note-body_ifr',
            stop: function( e, ui ) {
                nt_save_coordinates( ui );
            }

        });

        $(document).on('mouseup',function(){
            $(".nt-note-wrapper").trigger('resizestop');
        });

    }

  });

jQuery(document).ready( function($) {

    nt_set_initial_positions();

    function nt_set_initial_positions() {

        if( nt_ajax_call.nt_position_top ) {
            $('.nt-note-wrapper').css( 'top', nt_ajax_call.nt_position_top + 'px' );
        }

        if( nt_ajax_call.nt_position_left ) {
            $('.nt-note-wrapper').css( 'left', nt_ajax_call.nt_position_left + 'px' );
        }

        if( nt_ajax_call.nt_width ) {
            $('.nt-note-wrapper').css( 'width', nt_ajax_call.nt_width + 'px' ).addClass( 'nt-resized' ).addClass( 'nt-resized-at-init' );
        }

        if( nt_ajax_call.nt_tinymce_height && $(window).width() > 768 ) {
            $('#nt-note-body_ifr').height( nt_ajax_call.nt_tinymce_height );
        }

        if( $(window).width() < 768 ) {
            $('#nt-note-body_ifr').height( 50 );
        }

    }

    $('body').on( 'click', '.learndash-notes-print-modal', function(e) {

        e.preventDefault();

        if( typeof tinyMCE !== 'undefined' ) {
            var ed  = tinyMCE.get('nt-note-body');
            content = ed.getContent();
        } else {
            content = $('#nt-note-body').val();
        }

        title   = $('#nt-note-title').val();

        if( !$('#nt-print-wrapper' ).length ) {
            var print_markup    = '<div id="nt-print-wrapper" class="nt-hide"><h1>' + title + '</h1>' + content + '</div>';
            $(this).parent().append( print_markup );
        } else {
            $('#nt-print-wrapper').html( content );
        }

        $('#nt-print-wrapper').ld_print();

    });

    $('body').on( 'click', '.learndash-notes-download-modal', function(e) {

        e.preventDefault();

        if( typeof tinyMCE !== 'undefined' ) {
            var ed  = tinyMCE.get('nt-note-body');
            content = ed.getContent();
        } else {
            content = $('#nt-note-body').val();
        }

        var formData = {
            'title'             : document.getElementById( 'nt-note-title').value,
            'body'              : content,
            'userId'            : document.getElementById( 'nt-note-user-id').value,
            'currentLessonId'   : document.getElementById( 'nt-note-current-lessson-id').value,
            'currentPostType'   : document.getElementById( 'nt-note-current-post-type').value
        };

        nt_adminAjaxRequest( formData, 'nt_process_course_note', true );

    });

    var dt   = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

    var nt_adminAjaxRequest = function( formData, action, download ) {

        var dt   = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

        $( '#nt-note-submit' ).attr( 'disabled', true ).addClass( 'nt-note-saving' );

        jQuery.ajax({
          type: 'POST',
          url: nt_ajax_call.adminAjax,
          data: {
            action: action,
            data: formData,
            submission: document.getElementById('xyz').value,
            security: nt_ajax_call.security
          },
          success: function( response ) {

              $( '#nt-note-submit' ).val( nt_ajax_call.nt_saved_at_txt + ' ' + time ).prop( 'disabled', false );

              if( download == true ) {

                  var sep = '';

                  if( nt_ajax_call.nt_permalinks == 'yes' ) {
                      sep = '?';
                  } else {
                      sep = '&';
                  }

                  window.location.assign( response['data']['data'] + sep + 'nt_download_doc=true' );

              }

              if( $('#nt-note-id').val() == 'new' ) {
                  $('#nt-note-id').val(response['data']['post_id']);
              }

              setTimeout(function() {

                  $( '#nt-note-submit' ).val( 'Save' ).removeClass( 'nt-note-saving' );

              }, 4000);

            }

        });
  };

  $('body').on( 'click', '#nt-note-submit', function(e) {

      e.preventDefault();

      if( typeof tinyMCE !== 'undefined' ) {
          var ed  = tinyMCE.get('nt-note-body');
          content = ed.getContent();
      } else {
          content = $('#nt-note-body').val();
      }

      var formData = {
            'title'             : document.getElementById('nt-note-title').value,
            'body'              : content,
            'userId'            : document.getElementById('nt-note-user-id').value,
            'currentLessonId'   : document.getElementById('nt-note-current-lessson-id').value,
            'currentPostType'   : document.getElementById('nt-note-current-post-type').value,
            'noteId'            : document.getElementById('nt-note-id').value
        };

        nt_adminAjaxRequest( formData, 'nt_process_course_note' );

  });

  $('body').on( 'click', '.nt-note-tab', function(e) {

      e.preventDefault();

      $(this).fadeOut('slow');

      $( '.nt-note-wrapper' ).fadeIn( 'slow' ).addClass( 'active' );

      nt_check_if_outside_window();

      if( (nt_ajax_call.nt_tinymce_height ) && ( $( '.nt-note-wrapper' ).hasClass( 'nt-resized-at-init') ) ) {
          $( '#nt-note-body_ifr' ).css( 'height', nt_ajax_call.nt_tinymce_height + 'px' );
      }

      if( nt_ajax_call.nt_autosave == 'yes' ) {

          console.log('auto save is enabled!');

          nt_autosave_running = true;

          ldnt_start_autosave();

      }

      if( $(window).width() < 768 ) {

          var containerHeight = $('.nt-note-wrapper').height();
          var elementHeights = $('#nt-note-title-field').height() + $('#nt-note-actions').height() + $('#nt-utility-links').height() + $('.note-body .mce-toolbar-grp').height();

          var editorHeight = containerHeight - 53 - elementHeights;

          $('#nt-note-body_ifr').height(editorHeight);

      }

  });

  $('body').on( 'click', '.nt-reset-dimensions', function(e) {

      e.preventDefault();

      $( '.nt-note-wrapper' ).css({
          left        : 'auto',
          right       : '15px',
          top         : '30%',
          width       : 'auto',
          height      :   'auto'
      }).removeClass( 'nt-resized' );

      $( '#wp-nt-note-body-wrap' ).css( 'height', 'auto' );

      nt_reset_coordinates();

  });

  $('body').on( 'click', '.nt-close-icon', function(e) {

      e.preventDefault();

      $( '.nt-note-wrapper' ).removeClass( 'active' ).fadeOut( 'slow', function() {

          $( '.nt-note-tab' ).fadeIn( 'slow' );
          $( '#nt_note_cont' ).removeClass( 'z-index' );
          $( '.ldnt-content-notes' ).removeClass( 'z-index' );

          nt_autosave_running = false;

      });

  });

  $('body').on( 'click', '.learndash-notes-delete-note', function(e) {

        e.preventDefault();

        var r = confirm( nt_ajax_call.nt_delete_txt );

        if ( r == true ) {

            var note_id = $(this).data( 'note' );

            jQuery.ajax({
                url     : nt_ajax_call.adminAjax + '?action=nt_delete_note',
                type    : 'post',
                data    : {
                    note_id : note_id
                },
                success: function( data ) {

                    $(this).parents( 'tr' ).fadeOut( 'slow' );

                }

            });

        }

    });

});

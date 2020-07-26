( function ( $ ) {
    'use strict';

    /**
     * All of the code for your public-facing JavaScript source
     * should reside in this file.
     *
     * Note: It has been assumed you will write jQuery code here, so the
     * $ function reference has been prepared for usage within the scope
     * of this function.
     *
     * This enables you to define handlers, for when the DOM is ready:
     *
     * $(function() {
     *
     * });
     *
     * When the window is loaded:
     *
     * $( window ).load(function() {
     *
     * });
     *
     * ...and/or other possibilities.
     *
     * Ideally, it is not considered best practise to attach more than a
     * single DOM-ready or window-load handler for a particular page.
     * Although scripts in the WordPress core, Plugins and Themes may be
     * practising this, we should strive to set a better example in our own work.
     */

    $( document ).ready( function () {

        $( '#ldid-show-course-todo' ).live( 'change', function () {
            var course_id = $( this ).val();
            $( '.render-course-group-to-do-list' ).html( '<i class="fa fa-refresh fa-spin" style="font-size:24px"></i>' );
            var data = {
                'action': 'ld_generate_group_course_todo_list',
                'course_id': course_id
            }
            $.ajax( {
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: data,
                success: function ( response ) {

                    $( '.render-course-group-to-do-list' ).html( response );

                    if ( $( "#bptodo-tabs" ).length ) {
                        jQuery( "#bptodo-tabs" ).tabs( { heightStyle: "content" } );
                    }
                    if ( $( "#bptodo-task-tabs" ).length ) {
                        jQuery( "#bptodo-task-tabs" ).tabs( { heightStyle: "content" } );
                    }
                }
            } );
        } );

        /* Progress bar */
        $( '.ld-dashboard-progressbar' ).each( function () {
            $( this ).animate( {
                width: $( this ).attr( 'data-percentage-value' ) + '%'
            }, 1000 );
        } );

        /* Acitvity Pagination */
        $( '.ld-dashboard-report-pager-info .ld-dashboard-button' ).live( 'click', function () {

            var data = {
                'action': 'ld_dashboard_activity_rows_ajax',
                'nonce': ld_dashboard_js_object.nonce,
                'paged': $( this ).data( 'page' )
            }
            $.ajax( {
                url: ld_dashboard_js_object.ajaxurl,
                type: 'GET',
                data: data,
                success: function ( response ) {
                    $( '#ld-dashboard-feed' ).html( response );
                }

            } );
        } );

        /* Course Chart report */
        ld_dashboard_load_course_details( $( "#ld-dashboard-courses-id option:first" ).val() );
        $( '#ld-dashboard-courses-id' ).on( 'change', function () {
            ld_dashboard_load_course_details( $( this ).val() );
        } );

        function ld_dashboard_load_course_details( course_id ) {
			
			if ( typeof course_id === 'undefined' ) {
				return;
			}
            $( '.ld-dashboard-course-report' ).addClass( 'disable-this' );
            $( '.ld-dashboard-loader' ).show();
            var data = {
                'action': 'ld_dashboard_course_details',
                'nonce': ld_dashboard_js_object.nonce,
                'course_id': course_id
            }
            $.ajax( {
                dataType: "JSON",
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: data,
                success: function ( response ) {
                    $( '.ld-dashboard-course-report' ).removeClass( 'disable-this' );
                    $( '.ld-dashboard-loader' ).hide();
                    $( '.ld-dashboard-course-details' ).html( response['data']['html'] );

                    var notStarted = parseInt( jQuery( '#ld-dashboard-chart-data #ld-dashboard-not-started' ).val() );
                    var progress = parseInt( jQuery( '#ld-dashboard-chart-data #ld-dashboard-progress' ).val() );
                    var complete = parseInt( jQuery( '#ld-dashboard-chart-data #ld-dashboard-complete' ).val() );

                    ld_dashboard_highchart_prepare( notStarted, progress, complete );
                    if ( response['data']['instructor_chart_display'] ) {
                        $( '#ld-instructor-paid-unpaid-earning' ).addClass( 'ins-earning-available' );
                        var ins_total_earning = response['data']['instructor_total_earning'];
                        var ins_paid_earning = response['data']['instructor_paid_earning'];
                        var ins_unpaid_earning = response['data']['instructor_unpaid_earning'];
                        //ld_prepare_instructor_earning_highchart(ins_total_earning,ins_paid_earning,ins_unpaid_earning);
                    } else {
                        $( '#ld-instructor-paid-unpaid-earning' ).removeClass( 'ins-earning-available' );
                    }
                }

            } );
        }

        /**
         * Prepare highchart data
         */
        function ld_dashboard_highchart_prepare( notStarted, progress, complete ) {
            Highcharts.chart(
                'ld-dashboard-instructor-highchart-student-progress', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Course Progress'
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    credits: {
                        enabled: false
                    },
                    series: [ {
                            colorByPoint: true,
                            data: [ {
                                    name: 'Not Started',
                                    y: notStarted,
                                    color: "#47A7CA"
                                }, {
                                    name: 'In Progress',
                                    y: progress,
                                    color: "#EB5C5C",
                                    sliced: true,
                                    selected: true
                                }, {
                                    name: 'Completed',
                                    y: complete,
                                    color: "#4FABA8"
                                } ]
                        } ]
                }
            );
        }

        function ld_prepare_instructor_earning_highchart( ins_total_earning, ins_paid_earning, ins_unpaid_earning ) {
            Highcharts.chart(
                'ld-instructor-paid-unpaid-earning', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Instructor Earning'
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    credits: {
                        enabled: false
                    },
                    series: [ {
                            colorByPoint: true,
                            data: [ {
                                    name: 'Paid',
                                    y: ins_paid_earning,
                                    color: "#2196F3"
                                }, {
                                    name: 'Unpaid',
                                    y: ins_unpaid_earning,
                                    sliced: true,
                                    selected: true
                                } ]
                        } ]
                }
            );
        }

        /* studet Wise chart report */
        ld_dashboard_load_student_details( $( ".ld-dashboard-student option:first" ).val() );
        $( '.ld-dashboard-student' ).on( 'change', function () {
            ld_dashboard_load_student_details( $( this ).val() );
        } );

        function ld_dashboard_load_student_details( student_id ) {

            $( '.ld-dashboard-student-status-block' ).addClass( 'disable-this' );
            $( '.ld-dashboard-student-loader' ).show();
            var data = {
                'action': 'ld_dashboard_student_details',
                'nonce': ld_dashboard_js_object.nonce,
                'student_id': student_id
            }
            $.ajax( {
                dataType: "JSON",
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: data,
                success: function ( response ) {
                    $( '.ld-dashboard-student-status-block' ).removeClass( 'disable-this' );
                    $( '.ld-dashboard-student-loader' ).hide();
                    $( '.ld-dashboard-student-details' ).html( response['data']['html'] );

                    var notStarted = parseInt( jQuery( '#ld-dashboard-student-course-not-started' ).val() );
                    var progress = parseInt( jQuery( '#ld-dashboard-student-course-progress' ).val() );
                    var complete = parseInt( jQuery( '#ld-dashboard-student-course-complete' ).val() );

                    /* Student Course progress chart prepare */
                    if ( $( '#ld-dashboard-student-course-progress-highchart' ).length ) {
                        ld_dashboard_student_course_highchart_prepare( notStarted, progress, complete );
                    }

                    var approved_assignment = parseInt( jQuery( '#ld-dashboard-student-approved-assignment' ).val() );
                    var unapproved_assignment = parseInt( jQuery( '#ld-dashboard-student-unapproved-assignment' ).val() );
                    var pending_assignment = parseInt( jQuery( '#ld-dashboard-student-pending-assignment' ).val() );

                    /* Student Assignment progress chart prepare */
                    if ( $( '#ld-dashboard-student-course-assignment-progress-highchart' ).length ) {
                        ld_dashboard_student_course_assignment_highchart_prepare( approved_assignment, unapproved_assignment, pending_assignment );
                    }

                    var completed_quizze = parseInt( jQuery( '#ld-dashboard-student-completed-quizze' ).val() );
                    var uncompleted_quizze = parseInt( jQuery( '#ld-dashboard-student-uncompleted-quizze' ).val() );
                    /* Student Quiz progress chart prepare */
                    if ( $( '#ld-dashboard-student-course-quizze-progress-highchart' ).length ) {
                        ld_dashboard_student_course_quizze_highchart_prepare( completed_quizze, uncompleted_quizze );
                    }

                    $( '.ld-dashboard-progressbar' ).each( function () {
                        $( this ).animate( {
                            width: $( this ).attr( 'data-percentage-value' ) + '%'
                        }, 1000 );
                    } )
                }

            } );
        }

        function ld_dashboard_student_course_highchart_prepare( notStarted, progress, complete ) {
            Highcharts.chart(
                'ld-dashboard-student-course-progress-highchart', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Course Progress'
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    credits: {
                        enabled: false
                    },
                    series: [ {
                            colorByPoint: true,
                            data: [ {
                                    name: 'Not Started',
                                    y: notStarted,
                                    color: "#47A7CA"
                                }, {
                                    name: 'In Progress',
                                    y: progress,
                                    color: "#EB5C5C",
                                    sliced: true,
                                    selected: true
                                }, {
                                    name: 'Completed',
                                    y: complete,
                                    color: "#4FABA8"
                                } ]
                        } ]
                }
            );
        } /* Student Course chart */

        function ld_dashboard_student_course_assignment_highchart_prepare( approved_assignment, unapproved_assignment, pending_assignment ) {
            Highcharts.chart(
                'ld-dashboard-student-course-assignment-progress-highchart', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Assignment Progress'
                    },
                    tooltip: {
                        pointFormat: '<b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    credits: {
                        enabled: false
                    },
                    series: [ {
                            colorByPoint: true,
                            data: [ {
                                    name: 'Unapproved Assignment',
                                    y: unapproved_assignment,
                                    color: "#47A7CA"
                                }, {
                                    name: 'Pending Assignment',
                                    y: pending_assignment,
                                    color: "#EB5C5C",
                                    sliced: true,
                                    selected: true
                                }, {
                                    name: 'Approved Assignment',
                                    y: approved_assignment,
                                    color: "#4FABA8"
                                } ]
                        } ]
                }
            );
        } /* Student Assignment chart*/

        function ld_dashboard_student_course_quizze_highchart_prepare( completed_quizze, uncompleted_quizze ) {

            var course_quizze_series = [ {
                    colorByPoint: true,
                    data: [ {
                            name: 'Completed Quizzes',
                            y: completed_quizze,
                            color: "#4FABA8"
                        }, {
                            name: 'UnCompleted Quizzes',
                            y: uncompleted_quizze,
                            color: "#EB5C5C"
                        } ]
                } ];
            var course_quizze_pointFormat = '<b>{point.percentage:.1f}%</b>';
            if ( completed_quizze === 0 && uncompleted_quizze === 0 ) {
                course_quizze_series = [ { colorByPoint: true, data: [ { y: 1, color: '#E95A96', name: 'No Quiz Started' } ] } ]; // replace foo with something meaningful
                course_quizze_pointFormat = '<tr><td> 0 </td></tr>';
            }

            Highcharts.chart(
                'ld-dashboard-student-course-quizze-progress-highchart', {
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Quiz Progress'
                    },
                    tooltip: {
                        pointFormat: course_quizze_pointFormat
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: false
                            },
                            showInLegend: true
                        }
                    },
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        layout: 'horizontal'
                    },
                    credits: {
                        enabled: false
                    },
                    series: course_quizze_series
                }
            );
        }/* Student Quizze chart*/

        if ( $( '#ins-earning-stats' ).length ) {
            var earning = ld_dashboard_js_object.ins_monthly_earning;

            Highcharts.chart( 'ins-earning-stats', {
                chart: {
                    type: 'areaspline'
                },
                title: {
                    text: 'Instructor earning during one year'
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'top',
                    x: 150,
                    y: 100,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor:
                        Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
                },
                xAxis: {
                    categories: [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December'
                    ],
                    plotBands: [ { // visualize the weekend
                            from: 4.5,
                            to: 6.5,
                            color: 'rgba(68, 170, 213, .2)'
                        } ]
                },
                yAxis: {
                    title: {
                        text: 'Instructor Earning'
                    }
                },
                tooltip: {
                    shared: true,
                    valueSuffix: '$'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    areaspline: {
                        fillOpacity: 0.5
                    }
                },
                series: [ {
                        name: 'Earning',
                        // data: [earning['01'], 400, 300, 500, 400, 100, 1200]
                        data: [ earning['01'], earning['02'], earning['03'], earning['04'], earning['05'], earning['06'], earning['07'], earning['08'], earning['09'], earning['10'], earning['11'], earning['12'] ]
                    } ]
            } );
        }

        if ( $( '#ins-cw-earning-chart' ).length ) {
            var earning = ld_dashboard_js_object.ins_course_earning;
            var data_series = [ ];
            var temp_store;
            $.each( earning, function ( key, value ) {
                temp_store = {
                    'name': value['title'],
                    'y': value['earning']
                };
                data_series.push( temp_store );
            } );
            Highcharts.chart( 'ins-cw-earning-chart', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Course Earnings'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: [ {
                        name: 'Earning',
                        colorByPoint: true,
                        data: data_series
                    } ]
            } );
        }


        /* Select 2 Dropdown */
        $( '.ld-dashboard-select' ).select2( {
            allowClear: true
        } );

        /*
         * Display Selected Course wise student list on dropdown
         */
        $( '#ld-email-cource' ).on( 'change', function () {
            var course_id = $( this ).val();

            var data = {
                'action': 'ld_dashboard_couse_students',
                'course_id': course_id,
                'nonce': ld_dashboard_js_object.nonce,
            }
            $.ajax( {
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: data,
                dataType: "json",
                success: function ( response ) {
                    $( '#ld-email-students' ).find( 'option' ).remove();
                    $.each( response['data'], function ( key, val ) {
                        $( '#ld-email-students' ).append( $( "<option></option>" ).attr( "value", val['user_id'] ).text( val['user_name'] ) );
                    } );
                }
            } );
        } );

        /*
         * email trigger send
         */
        $( '#ld-email-send' ).on( 'click', function ( event ) {
            event.preventDefault();

            tinyMCE.triggerSave( true, true );
            var submit_from = $( 'form#ld-dashboard-email-frm' ).serialize();
            $( '.ls-email-success-error' ).remove();
            $( '.ls-email-success-msg' ).remove();
            $( '#ld-email-loader' ).show();
            $.ajax( {
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: submit_from + '&action=ld_dashboard_email_send&nonce=' + ld_dashboard_js_object.nonce,
                dataType: "json",
                success: function ( response ) {
                    $( '#ld-email-loader' ).hide();
                    $( "form#ld-dashboard-email-frm" )[0].reset();
                    $( ".ld-dashboard-select" ).val( null ).trigger( "change" );
                    if ( response['data']['error'] == 1 ) {
                        $( '#ld-email-send' ).after( '<p class="ls-email-success-error">' + response['data']['message'] + '</p>' )
                    } else {
                        $( '#ld-email-send' ).after( '<p class="ls-email-success-msg">' + response['data']['email_sent'] + '</p>' )
                    }

                    setTimeout( function () {
                        $( '.ls-email-success-error' ).remove();
                        $( '.ls-email-success-msg' ).remove();
                    }, 5000 );
                }
            } );
            return false;

        } );

        /*
         * message trigger send
         */
        $( '#ld-buddypress-message-send' ).on( 'click', function ( event ) {
            event.preventDefault();
            tinyMCE.triggerSave( true, true );
            var submit_from = $( 'form#ld-dashboard-buddypress-message-frm' ).serialize();
            $( '.ls-message-success-error' ).remove();
            $( '.ls-message-success-msg' ).remove();
            $( '#ld-buddypress-message-loader' ).show();
            $.ajax( {
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: submit_from + '&action=ld_dashboard_buddypress_message_send&nonce=' + ld_dashboard_js_object.nonce,
                dataType: "json",
                success: function ( response ) {
                    $( '#ld-buddypress-message-loader' ).hide();
                    $( "form#ld-dashboard-buddypress-message-frm" )[0].reset();
                    $( ".ld-dashboard-select" ).val( null ).trigger( "change" );
                    if ( response['data']['success'] == false ) {
                        $( '#ld-buddypress-message-send' ).after( '<p class="ls-message-success-error">' + response['data']['message_sent'] + '</p>' )
                    } else {
                        $( '#ld-buddypress-message-send' ).after( '<p class="ls-message-success-msg">' + response['data']['message_sent'] + '</p>' )
                    }

                    setTimeout( function () {
                        $( '.ls-message-success-error' ).remove();
                        $( '.ls-message-success-msg' ).remove();
                    }, 5000 );
                }
            } );
            return false;
        } );


        /* Studet Course Progress chart report */
        if ( $( '#ld-dashboard-student-courses-id' ).length != 0 ) {
            ld_dashboard_load_student_course_progress( $( "#ld-dashboard-student-courses-id option:first" ).val() );
            $( '#ld-dashboard-student-courses-id' ).on( 'change', function () {
                ld_dashboard_load_student_course_progress( $( this ).val() );
            } );
        }

        function ld_dashboard_load_student_course_progress( course_id ) {
            $( '.ld-dashboard-student-status-block' ).addClass( 'disable-this' );
            $( '.ld-dashboard-loader' ).show();
            var data = {
                'action': 'ld_dashboard_student_course_progress',
                'nonce': ld_dashboard_js_object.nonce,
                'course_id': course_id
            }
            $.ajax( {
                dataType: "JSON",
                url: ld_dashboard_js_object.ajaxurl,
                type: 'POST',
                data: data,
                success: function ( response ) {
                    $( '.ld-dashboard-student-status-block' ).removeClass( 'disable-this' );
                    $( '.ld-dashboard-loader' ).hide();
                    $( '#course_container' ).html( response['data']['html'] );

                    var course_name = jQuery( '#ld-dashboard-student-course' ).val();
                    var course_progress = parseFloat( jQuery( '#ld-dashboard-student-course-progress' ).val() );
                    var quizee_progress = parseFloat( jQuery( '#ld-dashboard-student-quizee-progress' ).val() );
                    var assignment_progress = parseFloat( jQuery( '#ld-dashboard-student-assignment-progress' ).val() );

                    Highcharts.chart( 'course_container', {
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: 'Course Progress'
                        },
                        xAxis: {
                            categories: [ course_name ],
                        },
                        plotOptions: {
                            series: {
                                borderWidth: 0,
                                dataLabels: {
                                    enabled: true,
                                    format: '{point.y:.1f}%'
                                }
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        series: [ {
                                name: 'Course Progress',
                                data: [ course_progress ]
                            }, {
                                name: 'Quiz Progress',
                                data: [ quizee_progress ]
                            }, {
                                name: 'Assignment Progress',
                                data: [ assignment_progress ]
                            } ]
                    } );
                }

            } );
        }

        $( '.ld-dashboard-error' ).hide();
        $( "#ld-instructor-reg-form" ).submit( function ( event ) {
            var flg = false;
            if ( $( '#ld_dashboard_first_name' ).val() == '' ) {
                $( '.ld_dashboard_first_name' ).show();
                flg = true;
            } else {
                $( '.ld_dashboard_first_name' ).hide();
            }

            if ( $( '#ld_dashboard_last_name' ).val() == '' ) {
                $( '.ld_dashboard_last_name' ).show();
                flg = true;
            } else {
                $( '.ld_dashboard_last_name' ).hide();
            }

            if ( $( '#ld_dashboard_username' ).val() == '' ) {
                $( '.ld_dashboard_username' ).show();
                flg = true;
            } else {
                $( '.ld_dashboard_username' ).hide();
            }


            if ( $( '#ld_dashboard_email' ).val() == '' ) {
                $( '.ld_dashboard_email' ).show();
                flg = true;
            } else if ( !ld_dashboard_validateEmail( $( '#ld_dashboard_email' ).val() ) ) {
                $( '.ld_dashboard_email' ).hide();
                $( '.ld_dashboard_email_wrong' ).show();
                flg = true;
            } else {
                $( '.ld_dashboard_email' ).hide();
                $( '.ld_dashboard_email_wrong' ).hide();
            }

            if ( $( '#ld_dashboard_password' ).val() == '' ) {
                $( '.ld_dashboard_password' ).show();
                flg = true;
            } else {
                $( '.ld_dashboard_password' ).hide();
            }

            if ( $( '#ld_dashboard_password_confirmation' ).val() == '' ) {
                $( '.ld_dashboard_password_confirmation' ).show();
                flg = true;
            } else if ( $( '#ld_dashboard_password' ).val() != $( '#ld_dashboard_password_confirmation' ).val() ) {
                $( '.ld_dashboard_password_confirmation' ).hide();
                $( '.ld_dashboard_password_confirmation_wrong' ).show();
                flg = true;
            } else {
                $( '.ld_dashboard_password_confirmation' ).hide();
                $( '.ld_dashboard_password_confirmation_wrong' ).hide();
            }


            if ( flg === true ) {
                return false
            }
            return true;

        } );

        function ld_dashboard_validateEmail( email ) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test( String( email ).toLowerCase() );
        }

    } );

} )( jQuery );
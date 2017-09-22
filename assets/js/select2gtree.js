/*
The MIT License

Copyright (c) 2017 Charl Joseph Mert, Inc. http://angularjs.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function($) {
	$.fn.select2gtree = function(options) {
		var defaults = {
			language: "en",
			theme: "bootstrap"
		};
		var opts = $.extend(defaults, options);

        //TODO: add options for decorator callbacks
        //TODO: enable multi select
        //TODO: option to display breadcrumbs in main input text box
        //TODO: support ajax loaded menu items

		$(this).each(function(){
			if ($('body').data('select2gtree_instance_count') == undefined) {
				$('body').data('select2gtree_instance_count', 0);
			} else {
				$('body').data('select2gtree_instance_count', $('body').data('select2gtree_instance_count') + 1);
			}

			instance_count = $('body').data('select2gtree_instance_count');
			open_counter[instance_count] = 0;

			$(this).data('select2gtree_id', instance_count);
		});

		$(this).select2(opts).on("select2:open", open);
	};

    var instance_count = 0;
    var display_ids = [];
    var parent_ids = [];
    // older // var screen_objs = [];
    var select_ptr = null;
    var open_counter = [];
    var breadcrumb = [];

    //TODO: decorate and bind elements once
	function open() {
		////console.log('open');
		instance_id = $(this).data('select2gtree_id');
        $('.select2-search').css('display', 'block');
        $('.select2-results').css('display', 'block');

        select_ptr = this;
        $(this).children().each(function(i, o){
            //////console.log('select_ptr: ' + i);
            parent_ids.push({
                id : $(o).attr('value'),
                parent_id: ($(o).attr('parent'))? $(o).attr('parent') : null
            });

            //////console.log('parent_ids');
            //////console.log(parent_ids);
            /*
            if (parent_id == '' && (!$(o).attr('parent') || $(o).attr('parent') == '' || $(o).attr('parent') == '0')) {
                // catch root elements
                ////console.log($(o).text());
                ////console.log($(o).val());
                display_ids.push($(o).val());
            } else if (parent_id != '' && (!$(o).attr('parent') == parent_id)) {
                // catch child elements
                display_ids.push($(o).val());
            }
            */
        });

		//////console.log('parent_ids');
		//////console.log(parent_ids);

		////console.log('instance_id: ' + instance_id);
		////console.log('open_counter @('+instance_id+'): ' + open_counter[instance_id]);
		////console.log('open_counter: ' + open_counter);
		if (open_counter[instance_id] == 0) {
            search_txt_input = $('.select2-search');
 
            $('.select2-search').html('<div class="input-group"><span id="select2tree_back" class="btn btn-default input-group-addon"> <i class="fa fa-angle-left"> </i> </span> ' + search_txt_input.html() + '</div>');
            $('.select2-search').find('input').addClass('form-control');
            $('.select2-search').find('input').css('border-radius-left', '0px');

			$('#select2tree_back').unbind('mousedown');
			$('#select2tree_back').on('mousedown', function(){
				parent_id = breadcrumb.pop();
				//console.log(breadcrumb);
				open_children(parent_id);
			});
        }

        $(this).children().each(function(i, o) {
            if (!$(o).attr('parent') || $(o).attr('parent') == '' || $(o).attr('parent') == '0') {
                ////console.log($(o).text());
                ////console.log($(o).val());
                display_ids.push($(o).val());
            }
        });

        // TODO: store previous mouseup and trigger on final or "Use This" click
		// clone events and hide div
		////console.log('instance_id: ' + $(this).data('select2gtree_id'));

/*
		if (open_counter[instance_id] == 0) {
			$('body').append('<div id="select2-hidden_' + instance_id + '"></>');
			$('#select2-hidden_' + instance_id).css('visibility', 'hidden');
			$('#select2-hidden_' + instance_id).css('display', 'none');
			$(".select2-results__options").clone(true).appendTo('#select2-hidden_' + instance_id);
		}

        $(".select2-results__options").bind('mouseup', function(e) {
			//console.log('e: before');
			//console.log($(this).attr('id'));
            //console.log(e);
        });
*/

        $(".select2-results__options").unbind('mouseup');

/*
        $(".select2-results__options").bind('mouseup', function(e) {
			//console.log('e: after');
            //console.log(e);
        });
*/

		setTimeout(function() {

            $(".select2-results__options li").each(function() {
                ////console.log($(this).attr('id'));
                ////console.log(display_ids);
                id = $(this).attr('id');

                if (id && display_ids.indexOf(id.match(/-\d*$/)[0].replace('-','')) > -1) {
					if (has_children(id.match(/-\d*$/)[0].replace('-',''))) {
                        //TODO: callback to decorate bold items
						//$(this).decorateBold($this); 
						////console.log($(this).text());
						$(this).css('font-weight', 'bold');

                        // use button
                        $(this).data('mouseover_counter', 0);
                        var item = $(this);
                        $('#' + id).on('mouseover', function() {
                            $(this).data('mouseover_counter', $(this).data('mouseover_counter') + 1);
                            if ($(this).data('mouseover_counter') == 1) {
                                $(this).append('<span id="' + id + '_use" class="btn btn-default pull-right" style="width:30%; margin:0px; padding: 0px">Use</span>');

                                $('#' + id + '_use').on('mousedown', function(e){
                                    //console.log('mousedown: click: button use');

                                    $('#' + id + '_use').remove();
                                    select(item);

                                    e.preventDefault();
                                    e.stopPropagation();
                                });
                            }
                        });
                        $('#' + id).on('mouseleave', function() {
                            $(this).data('mouseover_counter', 0);
                            $('#' + id + '_use').remove();
                        });

                        //$(this).unbind('mousedown');
                        $(this).bind('mouseup', function(e) {
                            var id = $(this).attr('id').match(/-\d*$/)[0].replace('-','');
                            //////console.log('clicked['+parent_id+']' + $(this).text());

                            $(this).css('display', 'none');
                            $(this).css('visibility', 'hidden');

                            parent_id = get_parent_id(id);
                            breadcrumb.push(parent_id);
                            //console.log(breadcrumb);

                            open_children(id);
                        });
					} else {

                        $(this).bind('mouseup', function(e) {
                            var id = $(this).attr('id').match(/-\d*$/)[0].replace('-','');
                            //////console.log('clicked['+parent_id+']' + $(this).text());

                            $(this).css('display', 'none');
                            $(this).css('visibility', 'hidden');

                            select(this);
                        });
                    }


                } else {
                    //older //screen_objs.push($(this));
                    //$(this).remove();
                    $(this).css('display', 'none');
                    $(this).css('visibility', 'hidden');
                    //////console.log(screen_objs);
                }
            });

        }, 0);

        open_counter[instance_id]++;
	}

	function open_children(parent_id) {
		////console.log('open_children');
		if (parent_id == undefined) {
			parent_id = 0;
		}
		////console.log('parent_id: ' + parent_id);

        $(".select2-results__options li").each(function() {
            //$(this).remove();
            $(this).css('display', 'none');
            $(this).css('visibility', 'hidden');
            //////console.log('hiding: ' + $(this));
        });

        ////console.log(parent_ids);

        $(".select2-results__options li").each(function() {
            ////console.log($(this).attr('id'));
            ////console.log(display_ids);
            id = $(this).attr('id');

            for (x = 0; (x < parent_ids.length); x++) {
                ////console.log(parent_ids[x].parent_id);
                if (id && parent_ids[x].id == id.match(/-\d*$/)[0].replace('-','') && parent_ids[x].parent_id == parent_id) {
					if (has_children(id.match(/-\d*$/)[0].replace('-',''))) {
						//$(this).decorateBold($this); //TODO: callback to decorate bold items
						//console.log($(this).text());
						$(this).css('font-weight', 'bold');

                        //TODO: callback to decorate bold items
						//$(this).decorateBold($this); 
						////console.log($(this).text());
						$(this).css('font-weight', 'bold');

                        // use button
                        $(this).data('mouseover_counter', 0);
                        var item = $(this);
                        $('#' + id).on('mouseover', function() {
                            $(this).data('mouseover_counter', $(this).data('mouseover_counter') + 1);
                            if ($(this).data('mouseover_counter') == 1) {
                                $(this).append('<span id="' + id + '_use" class="btn btn-default pull-right" style="width:30%; margin:0px; padding: 0px">Use</span>');

                                $('#' + id + '_use').on('mousedown', function(e){
                                    //console.log('mousedown: click: button use');

                                    $('#' + id + '_use').remove();
                                    select(item);

                                    e.preventDefault();
                                    e.stopPropagation();
                                });
                            }
                        });
                        $('#' + id).on('mouseleave', function() {
                            $(this).data('mouseover_counter', 0);
                            $('#' + id + '_use').remove();
                        });

                        //$(this).unbind('mousedown');
                        $(this).bind('mouseup', function(e) {
                            var id = $(this).attr('id').match(/-\d*$/)[0].replace('-','');
                            //////console.log('clicked['+parent_id+']' + $(this).text());

                            $(this).css('display', 'none');
                            $(this).css('visibility', 'hidden');

                            parent_id = get_parent_id(id);
                            breadcrumb.push(parent_id);
                            //console.log(breadcrumb);

                            open_children(id);
                        });

					}

                    //////console.log($(this).text());
                    $(this).css('display', 'block');
                    $(this).css('visibility', 'visible');

                    $(this).unbind('mousedown');
                    $(this).bind('mousedown', function() {
                        var cid = $(this).attr('id').match(/-\d*$/)[0].replace('-','');
                        //////console.log('bind2:clicked['+parent_id+']' + $(this).text());
                        var cparent_id = get_parent_id(cid);
                        breadcrumb.push(cparent_id);
                        //////console.log(breadcrumb);
                        if (has_children(cid)) {
                            open_children(cid);
                        } else {
                            select(this);
                        }
                    });

                    break;
                }
            }
        });

        /* //older
        for (i = 0; (i < screen_objs.length); i++) {
            o = screen_objs[i];
            ////console.log(o);
            id = $(o).attr('id');
            //console.log(id);
            for (x = 0; (x < parent_ids.length); x++) {
                if (id && parent_ids[x].parent_id == id.match(/-\d*$/)[0].replace('-','')) {
                    //console.log($(o).text());
                    $('.select2-results__options').append(o);
                }
            }
        }
        */

/*
		setTimeout(function() {
			//moveOption();

			$(".select2-results__options li").each(function() {
				var $this = $(this);
                //console.log($(this));
				//loop li add some classes and properties
				if($this.attr("parent")) {
					$(this).siblings("li[val=" + $this.attr("parent") + "]").find("span:eq(0)").addClass("glyphicon glyphicon-chevron-down switch").css({
						"padding": "0 10px",
						"cursor": "default"
					});
					$(this).siblings("li[val=" + $this.attr("parent") + "]").find("span:eq(1)").css("font-weight", "bold");
				}
				//add gap for children
				if(!$this.attr("style")) {
					var paddingLeft = getLevel($this.attr("val")) * 2;
					$("li[parent='" + $this.attr("parent") + "']").css("padding-left", paddingLeft + "em");
				}
			});

			//override mousedown for collapse/expand 
			$(".switch").mousedown(function() {
				switchAction($(this).parent().attr("val"), $(this).hasClass("glyphicon-chevron-right"));
				event.stopPropagation();
			});

			//override mouseup to nothing
			$(".switch").mouseup(function() {
				return false;
			});
		}, 0);
*/


	}

    function get_parent_id(id) {
        for (x = 0; (x < parent_ids.length); x++) {

            //if (id && parent_ids[x].id == id.match(/-\d*$/)[0].replace('-','') && parent_ids[x].parent_id == parent_id) {
            if (id && parent_ids[x].id == id) {
                return parent_ids[x].parent_id;
            }
        }

        return null;
    }

    function has_children(parent_id) {
		var counter = 0;
		////console.log('id: ' + parent_id);
		////console.log('parent_id: ' + parent_id);

        for (x = 0; (x < parent_ids.length); x++) {

            //if (id && parent_ids[x].id == id.match(/-\d*$/)[0].replace('-','') && parent_ids[x].parent_id == parent_id) {
            if (parent_ids[x].parent_id == parent_id) {
				return true;
            }
        }

        return false;
    }

    function count_children(id) {
		var counter = 0;
		parent_id = get_parent_id(id);

        for (x = 0; (x < parent_ids.length); x++) {

            //if (id && parent_ids[x].id == id.match(/-\d*$/)[0].replace('-','') && parent_ids[x].parent_id == parent_id) {
            if (id && parent_ids[x].parent_id == parent_id) {
				counter++;
            }
        }

        return counter;
    }

    function select(obj) {
        ////console.log($(obj).attr('id'));
        ////console.log($(obj).text());

        orig_id = $(obj).attr('id');
        target_id = orig_id.replace(/select2-(.*)-result-.*$/, 'select2-$1-container');

        select_id = orig_id.replace(/select2-(.*)-result-.*$/, '$1');
        value = orig_id.match(/-\d*$/)[0].replace('-','');

        //console.log(value);
        $('#' + select_id).val(value);

        //console.log(target_id);

        // that prints 'select2-timezone-result-h70q-253_use'
        // if for 'select2-test' becomes 'select2-test-select2-container'
        $('#' + target_id).attr('title', $(obj).text());
        $('#' + target_id).text($(obj).text());

        // from new select2 impl
        $('.select2-selection').attr('aria-expanded', 'false');
        $('.select2-selection').attr('aria-hidden', 'true');
        $('.select2-selection').removeAttr('aria-activedescendant');

		// bug with more than one select tree in view, need to clean up the previous search div
		// search and back button for 1st select list displays when 2nd select list opened
		$('.select2-container.select2-container--bootstrap.select2-container--open')[1].remove()

        $('.select2-search').css('display', 'none');
        $('.select2-results').css('display', 'none');

        $('.select2').removeClass('select2-container--open');
        $('.select2').addClass('select2-container--focus');

    }

})(jQuery);

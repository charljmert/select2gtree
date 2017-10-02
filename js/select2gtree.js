/*
 *   Select2GTree Version 1.0.1
 *
 *   The MIT License
 *
 *   Copyright (c) 2017 Charl Joseph Mert, Inc. http://charl.faceclues.co.za/select2gtree/
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *   THE SOFTWARE.
 */

// Uses CommonJS, AMD or browser globals to create a jQuery plugin.

/*
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
} (function (jQuery) {
*/


// Select2GT - an object representing a concept that you want
// to model (e.g. a car)
var Select2GT = {
    instance_count : 0,
    display_ids : [],
    parent_ids : [],
    parent_idsx : [],
    select_ptr : null,
    open_counter : [],
    breadcrumb : [],
    breadcrumb_texts : [],
    selectOriginalEvent : null,
    select2_obj : null,
    prev_selected_text : null,
    selected_text : null,
    target_id : null,

    init: function( options, elem ) {
        var self = this;
        // Mix in the passed-in options with the default options
        self.options = $.extend( {}, self.options, options );

        // Save the element reference, both as a jQuery
        // reference and a normal reference
        self.elem  = elem;
        self.$elem = $(elem);

        if (self.$elem.data('select2gtree')) {
            return false;
        }

        //DONE: fix back button not going back to root when selecting a 2nd level child and clicking back twice
        //DONE: fix speed issue, back button child select
        //DONE: add showBreadcrumbs option
        //DONE: $('timezone').val(1).change(); select2 changes the value already
        //TODO: selected item grey
        //TODO: fix back button, breadcrumbs on nested default selected
        //TODO: demo templateResult styling
        //TODO: scroll to selected item
        //TODO: enable tooltip and partial breadcrumb view for searches where the child items are the same in different trees
        //TODO: enable multi select
        //TODO: test/support ajax loaded menu items
        //TODO: implement prototype pattern, store object in data('select2gtree') - https://github.com/jquery-boilerplate/jquery-patterns/blob/master/patterns/jquery.prototypal-inheritance.plugin-boilerplate.js
        //TODO: support/test install from npm, bower etc.

        //this.$elem.select2(this.options).on("select2:open", self.open);
        self.$elem.select2(self.options).on("select2:open", function(e){ self.open(); });
        /*
        self.$elem.select2(self.options).on("select2:open", function(e){
            setTimeout(function(){
                $(".select2-results__options li").each(function() {
                    console.log(this);
                })
            }, 0);
        });
        */

        self.select2_obj = self.$elem.data('select2');
        self.select2_core();

        // return this so that we can chain and use the bridge with less code.
        return this;
    },
    options: {
        language: "en",
        theme: "bootstrap",
        showUseButton: true,
        showBreadcrumbs: true
    },
    select2_core: function() {
        self = this;

        //console.log(this.select2_obj);
        self.select2_obj.on('select', function (e) {
            if (self.options.showBreadcrumbs) {
                self.clear_breadcrumbs();
                $('#' + self.target_id).text(self.selected_text);
            }
        });

        self.select2_obj.on('close', function (params) {
            if (self.options.showBreadcrumbs) {
                self.clear_breadcrumbs();
                $('#' + self.target_id).text(self.prev_selected_text);
            }
        });

        /*
        this.select2_obj.on('open', function (params) {
            console.log('open:message [' + params + ']');
        });

        this.select2_obj.$container.trigger('results:message', {
          message: 'noResults' 
        });

        console.log(this.select2_obj.results);
        //*/
    },

    //TODO: decorate and bind elements once
	open: function() {
        self = this;

		instance_id = self.$elem.data('select2gtree_id');
        $('.select2-search').css('display', 'block');
        $('.select2-results').css('display', 'block');

        select_id = self.$elem.attr('id');
        self.target_id = 'select2-' + select_id + '-container';

        self.prev_selected_text = $('#' + self.target_id).attr('title');

        self.select_ptr = self;
        self.$elem.children().each(function(i, o){
            self.parent_ids.push({
                id : $(o).attr('value'),
                parent_id: ($(o).attr('parent'))? $(o).attr('parent') : null,
                selected: ($(o).attr('selected'))? true : false
            });
        });

		if (self.open_counter[instance_id] == 0) {
            // Breadcrumb
            /*
            if (self.options.showBreadcrumbs) {
                if ($('.select2gtree-self.breadcrumb')) {
                    $('.select2gtree-self.breadcrumb').remove();
                }
                $('.select2').prepend('<div class="select2gtree-self.breadcrumb"></div>');
                $('.select2gtree-self.breadcrumb').hide('fast');
                $('.select2gtree-self.breadcrumb').text('');
            }
            */

            // Back button
			$('.select2-search').append('<div id="select2tree_back_container" class="input-group"><span id="select2tree_back" class="btn btn-default input-group-addon"> <i class="fa fa-angle-left"> </i> </span> </div>');
			$('.select2-search__field').appendTo('#select2tree_back_container');
            $('.select2-search').find('input').addClass('form-control');
            $('.select2-search').find('input').removeClass('select2-search__field');
            $('.select2-search').find('input').css('border-radius-left', '0px');

			$('#select2tree_back').unbind('mousedown');
			$('#select2tree_back').on('mousedown', function(){
				parent_id = self.breadcrumb.pop();

                if (self.options.showBreadcrumbs) {
                    self.breadcrumb_texts.pop();
                    self.update_breadcrumb(self.breadcrumb_texts);
                }

				//console.log(self.breadcrumb);

				self.open_children(parent_id);
			});

        }

        self.$elem.children().each(function(i, o) {
            if (!$(o).attr('parent') || $(o).attr('parent') == '' || $(o).attr('parent') == '0') {
                ////console.log($(o).text());
                ////console.log($(o).val());
                self.display_ids.push($(o).val());
            }
        });

        /*
         TODO: implement prototype pattern, create init and one open(parent_id) before self can be completed
        // correct self.breadcrumb for default values being child elements
        var selected_parent_id = $('#' + select_id).find('option[value="'+$('#' + select_id).val()+'"]').attr('parent');

        if (typeof selected_parent_id !== undefined && selected_parent_id != null && selected_parent_id != 0 && selected_parent_id != '') {
            console.log('corercting default child' + selected_parent_id );
            self.breadcrumb.push(selected_parent_id);
            console.log(set_self.breadcrumb_offset(selected_parent_id));
            open_children(selected_parent_id);
            return;
        }
        */

		setTimeout(function() {
            $(".select2-results__options li").each(function() {
                id = $(this).attr('id');

                // Skipping "No Results" and other messages
                if ($(this).hasClass('select2-results__message')) {
                    return true;
                }

                var parent_id;
                var text;
                if (typeof $(this).data('data') !== undefined && typeof $(this).data('data').element !== undefined) {
                    parent_id = $($(this).data('data').element).attr('parent')
                    text = $($(this).data('data').element).text();
                } else {
                    return;
                }

                if (self.options.showBreadcrumbs) {
                    $(this).on('mouseover', function() {
                        self.breadcrumb_texts.push(text);
                        self.update_breadcrumb(self.breadcrumb_texts);
                        self.selected_text = text;
                    });

                    $(this).on('mouseout', function() {
                        self.breadcrumb_texts.pop();
                        self.update_breadcrumb(self.breadcrumb_texts);
                        self.selected_text = '';
                    });
                }

                if (id && id.match(/-\d*$/) && self.display_ids.indexOf(id.match(/-\d*$/)[0].replace('-','')) > -1) {

					if (self.has_children(id.match(/-\d*$/)[0].replace('-',''))) {
                        if (self.options.showBreadcrumbs) {
                            if ($('.select2gtree-self.breadcrumb')) {
                                $('.select2gtree-self.breadcrumb').show('fast');
                            }
                        }

                        //TODO: callback to decorate bold items
						//self.$elem.decorateBold($self);
						////console.log(self.$elem.text());
						$(this).css('font-weight', 'bold');

                        // use button
                        if (self.options.showUseButton) {
                            $(this).data('mouseover_counter', 0);
                            var item = $(this);
                            $('#' + id).off('mouseover.s2gt_use');
                            $('#' + id).on('mouseover.s2gt_use', function() {
                                $(this).data('mouseover_counter', $(this).data('mouseover_counter') + 1);
                                if ($(this).data('mouseover_counter') == 1) {
                                    $(this).append('<span id="' + id + '_use" class="btn btn-default pull-right" style="width:30%; margin:0px; padding: 0px">Use</span>');

                                    $('#' + id + '_use').off('mousedown.s2gt_use');
                                    $('#' + id + '_use').on('mousedown.s2gt_use', function(e) {
                                        //console.log('mousedown: click: button use');

                                        $('#' + id + '_use').remove();
                                        self.select(item);

                                        e.preventDefault();
                                        e.stopPropagation();
                                    });
                                }
                            });
                            $('#' + id).off('mouseleave.s2gt_use');
                            $('#' + id).on('mouseleave.s2gt_use', function() {
                                $(this).data('mouseover_counter', 0);
                                $('#' + id + '_use').remove();
                            });
                        }

                        $(this).off('mouseup.s2gt_treeitem');
                        $(this).on('mouseup.s2gt_treeitem', function(e) {
                            var id = $(this).attr('id').match(/-\d*$/)[0].replace('-','');

                            $(this).css('display', 'none');
                            $(this).css('visibility', 'hidden');

                            self.breadcrumb.push(parent_id);

                            if (self.options.showBreadcrumbs) {
                                self.breadcrumb_texts.push(self.$elem.text());
                                self.update_breadcrumb(self.breadcrumb_texts);
                            }

                            self.open_children(id);
							e.preventDefault();
							e.stopPropagation();
                        });
					} else {

                        $(this).off('mouseup.s2gt_treeitem');
                        $(this).on('mouseup.s2gt_treeitem', function(e) {
                            var id = $(this).attr('id').match(/-\d*$/)[0].replace('-','');

                            $(this).css('display', 'none');
                            $(this).css('visibility', 'hidden');

                            self.select(this);
                        });
                    }

                } else {
                    $(this).css('display', 'none');
                    $(this).css('visibility', 'hidden');
                }

                // Scroll to selected
                /*
                for (x = 0; (x < self.parent_ids.length); x++) {
                    if (id && self.parent_ids[x].id == id.match(/-\d*$/)[0].replace('-','')) {
                        if (self.parent_ids[x].selected) {
                            console.log("$('#" + id + "').offset().top");
                            console.log(self.$elem.offset());
                            console.log($('.select2-results__options').outerHeight(false));
                            $('.select2-results__options').animate({
                                scrollTop: self.$elem.offset().top - $('.select2-results__options').outerHeight(false) - 55
                            }, 1);
                        }
                    }
                }
                */

            });

        }, 0);

        self.open_counter[instance_id]++;
	},

	open_children: function (parent_id) {
        var self = this;
        orig_id = self.$elem.attr('id');
        select_id = orig_id.replace(/select2-(.*)-result-.*$/, '$1');

		if (parent_id == undefined) {
			parent_id = 0;
		}

        $(".select2-results__options li").each(function() {
            $(this).css('display', 'none');
            $(this).css('visibility', 'hidden');
        });

        $(".select2-results__options li").each(function() {
            id = $(this).attr('id');

            var c_parent_id;
            var c_id;
            if (typeof $(this).data('data') !== undefined && typeof $(this).data('data').element !== undefined) {
                c_parent_id = $($(this).data('data').element).attr('parent')
                c_id = $($(this).data('data').element).attr('value')
            } else {
                return;
            }

            if (id && id.match(/-\d*$/) && c_parent_id == parent_id) {
                if (self.has_children(id.match(/-\d*$/)[0].replace('-',''))) {
                    $(this).css('font-weight', 'bold');

                    //TODO: callback to decorate bold items
                    //self.$elem.decorateBold($self); 
                    ////console.log(self.$elem.text());
                    $(this).css('font-weight', 'bold');

                    // use button
                    if (self.options.showUseButton) {
                        $(this).data('mouseover_counter', 0);
                        var item = $(this);
                        $('#' + id).off('mouseover.s2gt_use');
                        $('#' + id).on('mouseover.s2gt_use', function() {
                            $(this).data('mouseover_counter', $(this).data('mouseover_counter') + 1);
                            if ($(this).data('mouseover_counter') == 1) {
                                $(this).append('<span id="' + id + '_use" class="btn btn-default pull-right" style="width:30%; margin:0px; padding: 0px">Use</span>');

                                $('#' + id + '_use').off('mousedown.s2gt_use');
                                $('#' + id + '_use').on('mousedown.s2gt_use', function(e){
                                    //console.log('mousedown: click: button use');

                                    $('#' + id + '_use').remove();
                                    self.select(item);

                                    e.preventDefault();
                                    e.stopPropagation();
                                });
                            }
                        });
                        $('#' + id).off('mouseleave.s2gt_use');
                        $('#' + id).on('mouseleave.s2gt_use', function() {
                            $(this).data('mouseover_counter', 0);
                            $('#' + id + '_use').remove();
                        });
                    }
                }

                $(this).css('display', 'block');
                $(this).css('visibility', 'visible');

                $(this).off('mouseup.s2gt_treeitem');
                $(this).on('mouseup.s2gt_treeitem', function(e) {
                    var cid = $(this).attr('id').match(/-\d*$/)[0].replace('-','');
                    var cparent_id = self.get_parent_id(cid);
                    self.breadcrumb.push(cparent_id);

                    if (self.options.showBreadcrumbs) {
                        self.breadcrumb_texts.push(self.$elem.text());
                        self.update_breadcrumb(self.breadcrumb_texts);
                    }

                    if (self.has_children(cid)) {
                        self.open_children(cid);
                        e.preventDefault();
                        e.stopPropagation();
                    } else {
                        // Default select handler will handle self
                        //select(self);
                    }
                });
            }
        });

	},

    get_parent_id: function (id) {
        for (x = 0; (x < this.parent_ids.length); x++) {

            if (id && this.parent_ids[x].id == id) {
                return this.parent_ids[x].parent_id;
            }
        }

        return null;
    },

    has_children: function(parent_id) {
		var counter = 0;

        for (x = 0; (x < this.parent_ids.length); x++) {
            if (this.parent_ids[x].parent_id == parent_id) {
				return true;
            }
        }

        return false;
    },

    set_breadcrumb_offset: function (parent_id) {
 		var counter = 0;

        //TODO: check for cyclic ref, cyclic ref eternal loop on parent and child ids
        //      i.e. the parent_id of a child item cannot be any of it's children

        for (x = 0; (x < this.parent_ids.length); x++) {
            if (this.parent_ids[x].id == parent_id && (this.parent_ids[x].parent_id != 0 && this.parent_ids[x].parent_id != null && this.parent_ids[x].parent_id != '')) {
				this.breadcrumb.push(this.parent_ids[x].parent_id);
                return set_this.breadcrumb_offset(this.parent_ids[x].parent_id);
            }
        }

        return this.breadcrumb.reverse();
    },

    count_children: function(id) {
		var counter = 0;
		parent_id = get_parent_id(id);

        for (x = 0; (x < this.parent_ids.length); x++) {
            if (id && this.parent_ids[x].parent_id == parent_id) {
				counter++;
            }
        }

        return counter;
    },

    select: function(obj) {
        orig_id = $(obj).attr('id');
        this.target_id = orig_id.replace(/select2-(.*)-result-.*$/, 'select2-$1-container');

        select_id = orig_id.replace(/select2-(.*)-result-.*$/, '$1');
        value = orig_id.match(/-\d*$/)[0].replace('-','');

        $('#' + select_id).val(value);

        // that prints 'select2-timezone-result-h70q-253_use'
        // if for 'select2-test' becomes 'select2-test-select2-container'
        $('#' + this.target_id).attr('title', $(obj).text());
        $('#' + this.target_id).text($(obj).text());

        // from new select2 impl
        $('.select2-selection').attr('aria-expanded', 'false');
        $('.select2-selection').attr('aria-hidden', 'true');
        $('.select2-selection').removeAttr('aria-activedescendant');

		// bug with more than one select tree in view, need to clean up the previous search div
		// search and back button for 1st select list displays when 2nd select list opened
		if ($('.select2-container.select2-container--bootstrap.select2-container--open')[1]) {
			$('.select2-container.select2-container--bootstrap.select2-container--open')[1].remove()
		}

        $('.select2-search').css('display', 'none');
        $('.select2-results').css('display', 'none');

        $('.select2').removeClass('select2-container--open');
        $('.select2').addClass('select2-container--below');

        this.clear_breadcrumbs();
    },

    update_breadcrumb: function(breadcrumb_texts) {
        if (this.breadcrumb_texts.length > 0) {
            $('#' + this.target_id).text(this.breadcrumb_texts.join(' / '));
        } else {
            $('#' + this.target_id).text(this.prev_selected_text);
        }
    },

    clear_breadcrumbs: function() {
        this.breadcrumb = [];
        this.breadcrumb_texts = [];
    }
};

// Object.create support test, and fallback for browsers without it
if ( typeof Object.create !== "function" ) {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

// Create a plugin based on a defined object
/*
$.fn.select2gtree = function( name, object ) {
  $.fn[name] = function( options ) {
    return this.each(function() {
      if (! $.data( this, name ) ) {
        $.data(this, name, Object.create(object).init(options, this));
      }
    });
  };
};
//*/

// Usage:
// With Select2GT, we could now essentially do this:
// $.plugin('myobj', Select2GT);

// and at this point we could do the following
// $('#elem').myobj({name: "John"});
// var inst = $('#elem').data('myobj');
// inst.myMethod('I am a method');

//$.fn.jqueryPlugin = function () { return true; };

    $.fn.select2gtree = function(options) {
        if (! $.data( this, 'select2gtree' ) ) {
            $.data(this, 'select2gtree', Object.create(Select2GT).init(options, this));
        }

    };

/*
}));
*/

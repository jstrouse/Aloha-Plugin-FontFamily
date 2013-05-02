/**
 * Aloha.FontFamily
 * The Font Family allows the change of font face of text
 * Author: Jeremy Strouse (jstrouse@strouseconsulting.com)
 * This is in parts based on the Aloha characterpicker plugin and other plugins
 * such as the colorselector plugin and previous version plugins by RecessMobile
 */

define(
[ 'aloha',
  'aloha/jquery',
  'aloha/plugin',
  'ui/ui',
  'ui/button',
  'i18n!fontfamily/nls/i18n',
  'i18n!aloha/nls/i18n',
  'css!fontfamily/css/fontfamily.css'],
function (Aloha, jQuery, Plugin, Ui, Button, i18n, i18nCore){
  "use strict";

  return Plugin.create( 'fontfamily', {
    languages: ['en'],
    init: function() {
      if (!Aloha.settings.plugins.fontfamily) {
        Aloha.settings.plugins.fontfamily = {}
      }

      self.settings = Aloha.settings.plugins.fontfamily || {};

      if(!self.settings.fontfamilies) {
        self.settings.fontfamilies = 'Georgia, serif|Palatino Linotype, Book Antiqua, Palatino, serif|Times New Roman, Times, serif|Arial, Helvetica, sans-serif|Arial Black, Gadget, sans-serif|Comic Sans MS, cursive, sans-serif|Impact, Charcoal, sans-serif|Lucida Sans Unicode, Lucida Grande, sans-serif|Tahoma, Geneva, sans-serif|Trebuchet MS, Helvetica, sans-serif|Verdana, Geneva, sans-serif|Courier New, Courier, monospace|Lucida Console, Monaco, monospace'
      }

      var that = this,
          buttons = [],
          names = ['fontfamily' ],
          tooltips = [i18n.t('button.fontfamily.tooltip')];

      function Fontfamily(fontfamilies, onSelectCallback) {
          var self = this;
          self.$node = jQuery('<table class="aloha-fontfamily-overlay" role="dialog"><tbody></tbody></table>');
          // don't let the mousedown bubble up. otherwise there won't be an activeEditable
          self.$node.mousedown(function(e) {
                  return false;
          });
          self.$tbody = self.$node.find('tbody');
          self.$node.appendTo(jQuery('body'));
          self._createFontFamilyButtons(self.$node, fontfamilies, onSelectCallback);
          self._initHideOnDocumentClick();
          self._initHideOnEsc();
          self._initCursorFocus(onSelectCallback);
          self._initEvents();
      }

      Fontfamily.prototype = {
            show: function( insertButton ) {
                var self = this;
                // position the overlay relative to the insert-button
                self.$node.css(jQuery(insertButton).offset());
                self.$node.show();
                // focus the first font family
                self.$node.find('.focused').removeClass('focused');
                jQuery(self.$node.find('td')[0]).addClass('focused');
            },
            _initHideOnDocumentClick: function() {
                var self = this;
                // if the user clicks somewhere outside of the layer, 
                // the layer should be closed
                // stop bubbling the click on the create-dialog up to the 
                // body event
                self.$node.click(function(e) {
                    e.stopPropagation();
                });
                // hide the layer if user clicks anywhere in the body
                jQuery('body').click(function(e) {
                    var overlayVisibleAndNotTarget
                        =  (self.$node.css('display') === 'table')
                        && (e.target != self.$node[0])
                        // don't consider clicks to the 'show' button.
                        && !(jQuery(e.target).hasClass('aloha-button-fontfamily') || jQuery(e.target).children().hasClass('aloha-button-fontfamily'))
                    if(overlayVisibleAndNotTarget) {
                        self.$node.hide();
                    }
                });
            },
            _initHideOnEsc: function() {
                var self = this;
                // escape closes the overlay
                jQuery(document).keyup(function(e) {
                    var overlayVisibleAndEscapeKeyPressed = (self.$node.css('display') === 'table') && (e.keyCode === 27);
                    if(overlayVisibleAndEscapeKeyPressed) {
                        self.$node.hide();
                    }
                });
            },
            _initCursorFocus: function( onSelectCallback ) {
                var self = this;
                // you can navigate through the table with the arrow keys
                // and select one with the enter key
                var $current, $next, $prev, $nextRow, $prevRow;
                var movements = {
                    13: function select() {
                        $current = self.$node.find('.focused');
                        self.$node.hide();
                        onSelectCallback($current.text());
                    },
                    37: function left() {
                        $current = self.$node.find('.focused');
                        $prev = $current.prev().addClass('focused');
                        if($prev.length > 0) {
                            $current.removeClass('focused');
                        }
                    },
                    38: function up() {
                        $current = self.$node.find('.focused');
                        $prevRow = $current.parent().prev();
                        if($prevRow.length > 0) {
                            $prev = jQuery($prevRow.children()[$current.index()]).addClass('focused');
                            if($prev.length > 0) {
                                $current.removeClass('focused');
                            }
                        }
                    },
                    39: function right() {
                        $current = self.$node.find('.focused');
                        $next = $current.next().addClass('focused');
                        if($next.length > 0) {
                            $current.removeClass('focused');
                        }
                    },
                    40: function down() {
                        $current = self.$node.find('.focused');
                        $nextRow = $current.parent().next();
                        if($nextRow.length > 0) {
                            $next = jQuery($nextRow.children()[$current.index()]).addClass('focused');
                            if($next.length > 0) {
                                $current.removeClass('focused');
                            }
                        }
                    }
                };
                jQuery(document).keydown(function(e) {
                    e.stopPropagation( );
                    var isOverlayVisible = self.$node.css('display') === 'table';
                    if(isOverlayVisible) {
                        // check if there is a move-command for the pressed key
                        var moveCommand = movements[e.keyCode];
                        if(moveCommand) {
                            moveCommand();
                            return false;
                        }
                    }
                });
            },
            _initEvents: function() {
                var self = this;
                // when the editable is deactivated, hide the layer
                Aloha.bind('aloha-editable-deactivated', function(event, rangeObject) {
                    self.$node.hide();
                });
            },
            _createFontFamilyButtons: function($node, fontfamilies, onSelectCallback) {
                var self = this;
                function mkButton(fontfamilyCode) {
                    return jQuery("<td style='FONT-FAMILY: "+fontfamilyCode+"; cursor: pointer'>" + fontfamilyCode.split(",")[0] + "</td>")
                        .mouseover(function() {
                            jQuery(this).addClass('mouseover');
                        })
                        .mouseout(function() {
                            jQuery(this).removeClass('mouseover');
                        })
                        .click(function(e) {
                            self.$node.hide();
                            onSelectCallback(fontfamilyCode)
                            return false;
                        });
                }
                function addRow() {
                    return jQuery('<tr></tr>').appendTo(self.$tbody);
                }
                var fontfamilyList = jQuery.grep(
                    fontfamilies.split('|'),
                    function filterOutEmptyOnces(e) {
                        return e != '';
                    }
                );
                var i=0, fontfamilyCode;
                var $row;
                while(fontfamilyCode = fontfamilyList[i]) {
                    $row = addRow();
                    mkButton(fontfamilyCode).appendTo($row);
                    i++;
                }
            }
      };

      function onFontfamilySelect(fontfamilyCode) {
        var self = this;
        var tagToUse = "span";
        var classToUse = "class=aloha";
        var cssTag = "FONT-FAMILY";
        var styleToUse = "style='" + cssTag + ": " + fontfamilyCode + "'";

        var markup = jQuery('<' + tagToUse + ' ' + classToUse + ' ' + styleToUse + '></' + tagToUse + '>'), rangeObject = Aloha.Selection.rangeObject, selectedCells = jQuery('.aloha-cell-selected');

        // formating workaround for table plugin
        if (selectedCells.length > 0) {
            var cellMarkupCounter = 0;
            selectedCells.each(function () {
                var cellContent = jQuery(this).find('div'), cellMarkup = cellContent.find(tagToUse);

                if (cellMarkup.length > 0) {
                    // unwrap all found markup text
                    // <td><b>text</b> foo <b>bar</b></td>
                    // and wrap the whole contents of the <td> into <b> tags
                    // <td><b>text foo bar</b></td>
                    cellMarkup.contents().unwrap();
                    cellMarkupCounter++;
                }
                cellContent.contents().wrap('<' + tagToUse + ' ' + classToUse + ' ' + styleToUse + '></' + tagToUse + '>');
            });

            // remove all markup if all cells have markup
            if (cellMarkupCounter == selectedCells.length) {
                selectedCells.find(tagToUse).contents().unwrap();
            }
            return false;
        }

        var parents = rangeObject.getSelectionTree();
        var count = 0;
        var partialreplace = false;
        // Loop through all matching markup sections and apply the new CSS
        for (var i = 0; i < parents.length; i++) {
          if (parents[i].selection.toLowerCase() == "full") {
            count = 0;
            jQuery(parents[i].domobj).find('span').each(function () {
              count += 1;
              jQuery(this).css(cssTag.toLowerCase(),fontfamilyCode);
            });
            if (count == 0 && parents.length == 1) {
              // Maybe we just selected the actual element, so check it's parent
              jQuery(parents[i].domobj).parent().each(function() { 
                if (this.nodeName.toLowerCase() == 'span') {
                  count += 1;
                  jQuery(this).css(cssTag.toLowerCase(),fontfamilyCode);
                };
              });
            }
            if (count == 0 || (parents[i].domobj.tagName && parents[i].domobj.tagName.toLowerCase() != 'span')) {
              if (parents[i].domobj.nodeType == 3)
                jQuery(parents[i].domobj).wrap(markup);
              else
                jQuery(parents[i].domobj).wrapInner(markup);
            }
          }
          else if (parents[i].selection.toLowerCase() == "partial") {
            partialreplace = true;
            replacechild(parents[i],tagToUse,classToUse,styleToUse,cssTag,fontfamilyCode);
          }
        };

        // Trigger undo point!
        Aloha.activeEditable.smartContentChange( { type : 'blur' }, null );

        // Throws errors if we've added a tag in the middle, so skip it
        // instead of having it error
        if (! partialreplace)
          rangeObject.select();
        return false;
      }

      function replacechild(item,tagToUse,classToUse,styleToUse,cssTag,fontfamilyCode) {
        if (item.domobj.nodeType == 3) {
          var text = item.domobj.data.substr(item.startOffset, item.endOffset - item.startOffset);
          text = '<' + tagToUse + ' ' + classToUse + ' ' + styleToUse + '>' + text + '</' + tagToUse + '>';
          text = item.domobj.data.substr(0,item.startOffset) + text;
          text = text + item.domobj.data.substr(item.endOffset, item.domobj.data.length - item.endOffset);
          jQuery(item.domobj).replaceWith(text);
        }
        else if (item.domobj.tagName.toLowerCase() == tagToUse.toLowerCase() && item.selection == "full") {
          jQuery(item.domobj).css(cssTag.toLowerCase(),fontfamilyCode);
          jQuery(item.domobj).find('span').each(function () {
            jQuery(this).css(cssTag.toLowerCase(),fontfamilyCode);
          });
        }
        else {
          for (var j = 0; j < item.children.length; j++) {
            if (item.children[j].selection == "partial" || item.children[j].selection == "full")
              replacechild(item.children[j],tagToUse,classToUse,styleToUse,cssTag,fontfamilyCode);
          };
        }
      }

      var fontfamily = new Fontfamily(self.settings.fontfamilies, onFontfamilySelect);
      for (var i=0; i < names.length; i++) {
        var value = names[i];
        var index = i;

        Ui.adopt(value, Button, {
          tooltip: tooltips[index],
          icon: "aloha-button-" + value,
          name: value,
          scope: 'Aloha.continuoustext',
          click: function () {
              var btnName = this.name;

              if (Aloha.activeEditable) {
                Aloha.activeEditable.obj[0].focus()
              } 
 
              fontfamily.show(this.buttonElement[0]);
          }
        });
      }
    }
  });
});

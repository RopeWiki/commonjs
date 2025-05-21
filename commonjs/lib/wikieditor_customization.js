/* WikiEditor Customization */

// Basic Editor
function initBasicEditor() {
    var tb = document.getElementById('toolbar');

    if (!tb) {
        tb = document.createElement("DIV");
        tb.id = "toolbar";
    }

    var first = null;
    var prefix = '_section';
    var list = document.getElementsByTagName('TEXTAREA');
    for (var i = 0; i < list.length; ++i)
        if (!!list[i].name && list[i].name.substr(0, prefix.length) == prefix) {
            if (!first) first = list[i];
            list[i].onfocus = function () {
                //tb.style.display = 'block';
                this.parentNode.insertBefore(tb, this);
            };
        }

    if (first)
        first.parentNode.insertBefore(tb, first);

    if (window.mw && !!mw.toolbar) {
        mw.loader.using("mediawiki.action.edit", function () {

            var tb = document.getElementById('toolbar');
            if (tb) tb.innerHTML = "";

            mw.toolbar.addButton(false, "Bold text", "'''", "'''", "Bold text", "mw-editbutton-bold");
            mw.toolbar.addButton(false, "Italic text", "''", "''", "Italic text", "mw-editbutton-italic");

            // add custom buttons
            mw.toolbar.addButton({
                imageFile: BULLET_LIST_ICON,
                speedTip: 'Bulleted list',
                tagOpen: '* ',
                tagClose: '',
                sampleText: 'Bulleted list item',
                imageId: 'button-bullet'
            });
            mw.toolbar.addButton({
                imageFile: PHOTO_GALLERY_ICON,
                speedTip: 'Insert a picture (.jpg .gif .png .pdf)',
                tagOpen: '{{pic|',
                tagClose: '}}',
                sampleText: 'name.jpg ~ caption',
                imageId: 'button-pic1'
            });
            mw.toolbar.addButton({
                imageFile: MULTIPHOTO_GALLERY_ICON,
                speedTip: 'Insert a picture gallery (.jpg .gif .png .pdf)',
                tagOpen: '{{pic|',
                tagClose: '}}',
                sampleText: 'pic1.jpg ~ caption1 ; pic2.jpg ~ caption2 ; pic3.jpg ~ caption3',
                imageId: 'button-picn'
            });
            mw.toolbar.addButton({
                imageFile: PHOTO_GALLERY_ICON2,
                speedTip: 'Insert a large sketch or document (.pdf .gif .png .jpg)',
                tagOpen: '{{pic|size=X|',
                tagClose: '}}',
                sampleText: 'sketch.pdf ~ caption',
                imageId: 'button-picx'
            });

            mw.toolbar.addButton(false, "Internal link", "[[", "]]", "Link title", "mw-editbutton-link");
            mw.toolbar.addButton(false, "External link (remember http:// prefix)", "[", "]", PROTOCOL + "www.example.com link title", "mw-editbutton-extlink");
            mw.toolbar.addButton(false, "Level 2 headline", "\n=== ", " ===\n", "Headline text", "mw-editbutton-headline");
            mw.toolbar.addButton(false, "Ignore wiki formatting", "\u003Cnowiki\u003E", "\u003C/nowiki\u003E", "Insert non-formatted text here", "mw-editbutton-nowiki");
            mw.toolbar.addButton(false, "Your signature with timestamp", "--[[User:BetaRobot2|BetaRobot2]] ([[User talk:BetaRobot2|talk]]) 17:01, 11 June 2016 (EDT)", "", "", "mw-editbutton-signature");
            mw.toolbar.addButton(false, "Horizontal line (use sparingly)", "\n----\n", "", "", "mw-editbutton-hr");
            // Create button bar
            $(function () {
                mw.toolbar.init();
            });
        });
    }
}

/*
jQuery( document ).ready( function ( $ ) {
	  console.log("customizeToolbar1");

	$( '#wpTextbox1' ).wikiEditor( 'addToToolbar', {
		section: 'advanced',
		group: 'format',
		tools: {
			buttonId: {
				label: 'Comment visible only for editors',
				type: 'button',
				icon: '//upload.wikimedia.org/wikipedia/commons/f/f9/Toolbaricon_regular_S_stroke.png',
				action: {
					type: 'encapsulate',
					options: {
						pre: '<!-- ',
						peri: 'Insert comment here',
						post: ' -->'
					}
				}
			}
		}
	} );
} );
*/

function customizeToolbar() {
    console.log("customizeToolbar");

    // Add the youtube icon
    $('#wpTextbox1').wikiEditor('addToToolbar', {
        section: 'main',
        group: 'insert',
        tools: {
          embedvideo: {
            label: 'Embed YouTube',
            type: 'button',
            icon: 'https://ropewiki.com/images/video.png',
            action: {
              type: 'callback',
              execute: function () {
                var url = prompt('Enter a YouTube URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)');
                if (!url) return;
    
                // Try to extract video ID
                var match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
                if (!match || !match[1]) {
                  alert('Could not extract YouTube video ID.');
                  return;
                }
    
                var videoId = match[1];
                var wikitext = '{{#ev:youtube|' + videoId + '}}';
    
                // Insert the wikitext at cursor position
                var textbox = document.getElementById('wpTextbox1');
                if (textbox) {
                  var start = textbox.selectionStart;
                  var end = textbox.selectionEnd;
                  var currentText = textbox.value;
                  textbox.value = currentText.substring(0, start) + wikitext + currentText.substring(end);
                  // Move the cursor to after the inserted text
                  textbox.selectionStart = textbox.selectionEnd = start + wikitext.length;
                  textbox.focus();
                }
              }
            }
          }
        }
      });
      
    // Add the "{{pic}}" icon
    $('#wpTextbox1').wikiEditor('addToToolbar', {
        section: 'main',
        group: 'format',
        tools: {
            pic1: {
                label: 'Insert a picture (.jpg .gif .png .pdf)',
                type: 'button',
                icon: PHOTO_GALLERY_ICON,
                action: {
                    type: 'encapsulate',
                    options: {
                        pre: '{{pic|',
                        peri: 'name.jpg ~ caption',
                        post: '}}'
                    }
                }
            }
        }
    });

    // Add the "{{pic}}" gallery icon
    $('#wpTextbox1').wikiEditor('addToToolbar', {
        section: 'main',
        group: 'format',
        tools: {
            picn: {
                label: 'Insert a picture gallery (.jpg .gif .png .pdf)',
                type: 'button',
                icon: MULTIPHOTO_GALLERY_ICON,
                action: {
                    type: 'encapsulate',
                    options: {
                        pre: '{{pic|',
                        peri: 'pic1.jpg ~ caption1 ; pic2.jpg ~ caption2 ; pic3.jpg ~ caption3',
                        post: '}}'
                    }
                }
            }
        }
    });

    // Add the large "{{pic}}" icon
    $('#wpTextbox1').wikiEditor('addToToolbar', {
        section: 'main',
        group: 'format',
        tools: {
            picx: {
                label: 'Insert a large sketch or document (.pdf .gif .png .jpg)',
                type: 'button',
                icon: PHOTO_GALLERY_ICON2,
                action: {
                    type: 'encapsulate',
                    options: {
                        pre: '{{pic|size=X|',
                        peri: 'sketch.pdf ~ caption',
                        post: '}}'
                    }
                }
            }
        }
    });

    // Remove the default "gallery" icon
    $('#wpTextbox1, .wikieditor').wikiEditor('removeFromToolbar', {
            'section': 'advanced',
            'group': 'insert',
            'tool': 'gallery'
        }
    );
    
    // Remove the default "file" icon
    $('#wpTextbox1, .wikieditor').wikiEditor('removeFromToolbar', {
        'section': 'main',
        'group': 'insert',
        'tool': 'file'
    }
);
};

function initToolbarCustomization() {
    /* Check if view is in edit mode and that the required modules are available. Then, customize the toolbar � */
    if (typeof mw != "undefined") {
        if (!!mw && $.inArray(mw.config.get('wgAction'), ['edit', 'submit']) !== -1) {
            mw.loader.using('user.options', function () {
                // This can be the string "0" if the user disabled the preference ([[phab:T54542#555387]])
                if (mw.user.options.get('usebetatoolbar') == 1) {
                    $.when(
                        mw.loader.using('ext.wikiEditor.toolbar'), $.ready
                    ).then(customizeToolbar);
                }
            });

            // Add the customizations to LiquidThreads' edit toolbar, if available
            mw.hook('ext.lqt.textareaCreated').add(customizeToolbar);
        }

        //rwuser = mw.config.get( 'wgUserName' );
    }
}

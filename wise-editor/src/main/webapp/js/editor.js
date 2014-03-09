/*
 *    Copyright [2012] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

var designer = null;

function buildDesigner(options) {

    var container = $("#"+options.container);
    $assert(container, 'container could not be null');

    // Register load events ...
    designer = new mindplot.Designer(options, container);
    designer.addEvent('loadSuccess', function () {
        window.waitDialog.close();
        window.waitDialog = null;
        window.mindmapLoadReady = true;
    });

    var onerrorFn = function (message, url, lineNo) {

        // Ignore errors ...
        if (message === "Script error." && lineNo == 0) {
            // http://stackoverflow.com/questions/5913978/cryptic-script-error-reported-in-javascript-in-chrome-and-firefox
            return;
        }

        // Transform error ...
        var errorMsg = message;
        if (typeof(message) === 'object' && message.srcElement && message.target) {
            if (message.srcElement == '[object HTMLScriptElement]' && message.target == '[object HTMLScriptElement]') {
                errorMsg = 'Error loading script';
            } else {
                errorMsg = 'Event Error - target:' + message.target + ' srcElement:' + message.srcElement;
            }
        }
        errorMsg = errorMsg.toString();

        new Request({
            method:'post',
            url:"/c/restful/logger/editor",
            headers:{"Content-Type":"application/json", "Accept":"application/json"},
            emulation:false,
            urlEncoded:false
        }).post(JSON.encode({
            jsErrorMsg:"Message: '" + errorMsg + "', line:'" + lineNo + "', url: :" + url,
            jsStack:window.errorStack,
            userAgent:navigator.userAgent,
            mapId:options.mapId}));


        // Close loading dialog ...
        if (window.waitDialog) {
            window.waitDialog.close();
            window.waitDialog = null;
        }

        // Open error dialog only in case of mindmap loading errors. The rest of the error are reported but not display the dialog.
        // Remove this in the near future.
        if (!window.mindmapLoadReady) {
            $notifyModal($msg('UNEXPECTED_ERROR_LOADING'));
        }
    };

    // @Todo: Remove this after all is fixed.
//    window.onerror = onerrorFn;

    // Configure default persistence manager ...
    var persistence;
    if (options.persistenceManager) {
        if (options.persistenceManager instanceof String) {
            persistence = eval("new " + options.persistenceManager + "()");
        }
        else {
            persistence = options.persistenceManager;
        }

    } else {
        persistence = new mindplot.LocalStorageManager("samples/{id}.xml");
    }
    mindplot.PersistenceManager.init(persistence);

    // Register toolbar event ...
    if ($('#toolbar')) {
        var menu = new mindplot.widget.Menu(designer, 'toolbar', options.mapId, "");

        //  If a node has focus, focus can be move to another node using the keys.
        designer._cleanScreen = function () {
            menu.clear()
        };
    }

    return designer;
}


function loadDesignerOptions(jsonConf) {
    // Load map options ...
    var result;
    if (jsonConf) {
        var request = new Request.JSON({
                url:jsonConf,
                async:false,
                onSuccess:function (options) {
                    this.options = options;

                }.bind(this)
            }
        );
        request.get();
        result = this.options;
    }
    else {
        // Set workspace screen size as default. In this way, resize issues are solved.
        var containerSize = {
            height:parseInt(screen.height),
            width:parseInt(screen.width)
        };

        var viewPort = {
            height:parseInt(window.innerHeight - 70), // Footer and Header
            width:parseInt(window.innerWidth)
        };
        result = {readOnly:false, zoom:0.85, saveOnLoad:true, size:containerSize, viewPort:viewPort, container:'mindplot', locale:'en'};
    }
    return result;
}

// @Todo: This must be reimplemented using JQuery ...
editor = {};
editor.WaitDialog = new Class({
    initialize:function () {
        this.panel = this._buildPanel();
        this.mask = $('#mask');
//        this.parent({
//                closeButton:false,
//                destroyOnClose:true,
//                autoOpen:false,
//                useEscKey:false,
//                title:'',
//                onInitialize:function (wrapper) {
//                    wrapper.setStyle('opacity', 0);
//                    this.wrapper.setStyle('display', 'none');
//                    this.fx = new Fx.Morph(wrapper, {
//                        duration:100,
//                        transition:Fx.Transitions.Bounce.easeOut
//                    });
//                },
//
//                onBeforeOpen:function () {
//                    this.overlay = new Overlay(this.options.inject, {
//                        duration:this.options.duration
//                    });
//                    this.overlay.open();
//                    this.fx.start({
//                        'margin-top':[-200, -100],
//                        opacity:[0, 1]
//                    }).chain(function () {
//                        this.fireEvent('show');
//                        this.wrapper.setStyle('display', 'block');
//
//                    }.bind(this));
//                },
//
//                onBeforeClose:function () {
//                    this.fx.start({
//                        'margin-top':[-100, 0],
//                        opacity:0,
//                        duration:200
//                    }).chain(function () {
//                        this.fireEvent('hide');
//                        this.wrapper.setStyle('display', 'none');
//
//                    }.bind(this));
//                }}
//        );
//        this.setContent(panel);
    },

    _buildPanel:function () {
        var image = $('<img src="images/ajax-loader.gif">');
        image.css('margin-top', '25px');
        var result = $('<div></div>')
            .css({
                'text-align': 'center',
                'width': '400px',
                'height': '120px',
                'z-index': '9999',
                'position': 'absolute',
                'background-color': 'white',
                'border-radius': '4px',
                'border': '1px solid rgb(255, 163, 0)'
            });

        result.append(image);

        var winH = $(document).height();
        var winW = $(document).width();

        //Set the popup window to center
        result.css('top',  winH/2 - result.height()/2);
        result.css('left', winW/2 - result.width()/2);
        return result;
    },

    show:function () {
        //Set height and width to mask to fill up the whole screen
        this.mask.css({'width': $(window).width(), 'height': $(window).height()});
        this.mask.fadeIn('slow');
        this.mask.fadeTo("slow",0.8);
        $(document.body).append(this.panel);
        this.panel.fadeIn('slow');
    },

    close: function() {
        this.panel.fadeOut('slow');
        this.mask.hide();
    }
});

// Show loading dialog ...
waitDialog = new editor.WaitDialog();
waitDialog.show();

// Loading libraries ...
jQuery.getScript("js/mindplot-min.js");

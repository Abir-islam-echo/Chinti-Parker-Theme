var juno = {};

var cutsTheMustard = false;
if (
  "querySelector" in document &&
  "localStorage" in window &&
  "addEventListener" in window
) {
  cutsTheMustard = true;
  document.documentElement.className = "js";
}

function addClass(whichElement, className) {
  if (whichElement.classList) {
    whichElement.classList.add(className);
  } else {
    whichElement.className += " " + className;
  }
}

// klevu code part 3
const pollerLite = (conditions, callback, userOptions) => {
  /**
   * Default options
   */
  let options = {
    wait: 50,
    multiplier: 1.1,
    timeout: 0,
  };

  // Overwrite any default options with user supplied options
  if (userOptions) {
    options = mergeObjects(options, userOptions);
  }

  const { multiplier, wait } = options;

  /**
   * A date object created from the timeout option for easier comparison
   * @type {Date}
   */
  const timeout = options.timeout ? new Date(getNow() + options.timeout) : null;

  /**
   * Check if the poller has timed out
   * @returns {boolean}
   */
  const isTimedOut = () => timeout && getNow() > timeout;

  /**
   * Any successful polling conditions are pushed here to keep track of progress
   * @type {array}
   */
  const successfulConditions = [];

  /**
   * Check if a condition has passed
   * Conditions are evaluated differently depending on the type
   * Functions must return true and strings should be CSS selectors present in the DOM
   * @param {*} condition
   * @returns {boolean}
   */
  const evaluateCondition = (condition) => {
    if (!condition) {
      return false;
    }

    const types = {
      function: () => condition(),
      string: () => document.querySelector(condition),
    };

    const evaluate = types[typeof condition];
    return evaluate ? evaluate() : true;
  };

  /**
   * Check if all the conditions have passed
   * @returns {boolean}
   */
  const allConditionsPassed = () =>
    successfulConditions.length === conditions.length;

  /**
   * Recursive poll for a condition until it returns true
   * @param {*} condition
   * @param {number} waitTime Time before next polling attempt
   * @param {boolean} skipWait Bypasses the wait period if true
   */
  const pollForCondition = (condition, waitTime, skipWait) => {
    // End recursion if timeout has passed
    if (timeout && isTimedOut()) {
      return false;
    }

    const result = evaluateCondition(condition);

    if (result) {
      successfulConditions.push(result);
      if (allConditionsPassed()) {
        // Run the callback and pass the results as the first argument
        callback(successfulConditions);
      }
    } else {
      setTimeout(
        () => {
          pollForCondition(condition, waitTime * multiplier);
        },
        skipWait ? 0 : waitTime
      );
    }
  };

  // Start polling for all conditions
  for (let i = 0; i < conditions.length; i += 1) {
    if (
      typeof conditions[i] != "string" &&
      typeof conditions[i] != "function"
    ) {
      throw "Every item in the poller array should be a function or a string";
    }
    pollForCondition(conditions[i], wait, true);
  }
};
// klevu code part 3

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(
      new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"),
      " "
    );
  }
}

function hasParent(element, id) {
  if (element) {
    do {
      if (element.id === id) {
        return true;
      }
      if (element.nodeType === 9) {
        // root node
        break;
      }
    } while ((element = element.parentNode));
  }
  return false;
}

var defaultNavToShow = "";
jQuery(document).ready(function () {
  function setMenuPadding() {
    var navUl = $("#nav-ul");
    var height = $(".isOpen:last ul").height();

    navUl.css({
      "padding-bottom": Math.ceil(height / 2) + "px",
    });
  }

  if (!jQuery("#menuToggle").is(":visible")) {
    if (jQuery("body").hasClass("template-collection")) {
      // check if it's an empty sale collection:
      var isEmptySale = false;
      if (jQuery("body").attr("id") == "sale") {
        if (jQuery(".product-grid .item").length < 1) {
          isEmptySale = true;
        }
      }

      //console.log(isEmptySale);
      if (!isEmptySale) {
        defaultNavToShow = "shop";

        // try and find inner active element:
        if (jQuery(".innerCurrentActive").length > 0) {
          defaultNavToShow = jQuery(".innerCurrentActive")
            .parents("li.level0")
            .attr("id")
            .substring(6);
        } else {
          if (jQuery(".innerCurrent").length > 0) {
            defaultNavToShow = jQuery(".innerCurrent")
              .parents("li.level0")
              .attr("id")
              .substring(6);
          }
        }

        jQuery("#nav-ul li.level0." + defaultNavToShow)
          .addClass("activeHover")
          .hover(
            function () {
              if (jQuery(this).hasClass("activeHover")) {
                jQuery("body").addClass("mainNavOver");
              }
            },
            function () {
              if (jQuery(this).hasClass("activeHover")) {
                jQuery("body").removeClass("mainNavOver");
              }
            }
          );
        jQuery("body").addClass("mainNavOver");
      } else {
        jQuery("body").removeClass("mainNavOver");
      }
    }
  }
});

if (cutsTheMustard) {
  juno.navigationIsRevealed = false;
  juno.basketIsRevealed = false;
  // toggle with the menu button:
  //Custom Close Button

  document.getElementById("basketToggle").addEventListener(
    "click",
    function (e) {
      juno.checkToggleBasketNavigation();
      if (e) {
        e.preventDefault();
      }
    },
    false
  );

  juno.checkToggleBasketNavigation = function () {
    if (juno.basketIsRevealed) {
      // hide navigation:
      removeClass(document.documentElement, "offCanvasBasket");
      juno.basketIsRevealed = false;
    } else {
      // reveal navigation:
      addClass(document.documentElement, "offCanvasBasket");
      juno.basketIsRevealed = true;
      //$('html, body').animate({scrollTop: '0px'}, 300);
    }
  };
  juno.checkCloseNavigation = function (e) {
    if (juno.navigationIsRevealed) {
      // check it's not the menu icon (or its children) itself as this will trigger independently (and would cause the event to be fired twice)
      if (e.target.id != "menuToggle" && !hasParent(e.target, "menuToggle")) {
        // check the click isn't within the nav panel:
        if (!hasParent(e.target, "navigation")) {
          // hide navigation:

          removeClass(document.documentElement, "offCanvas");
          juno.navigationIsRevealed = false;
          e.preventDefault();
          $("#navigationBar").removeClass("navigation-revealed");
        }
      }
    }
  };
  juno.checkCloseBasketNavigation = function (e) {
    if (juno.basketIsRevealed) {
      // check it's not the menu icon itself as this will trigger independently (and would cause the event to be fired twice)
      if (e.target.id != "basketToggle") {
        // check the click isn't within the nav panel:
        if (!hasParent(e.target, "cart-container")) {
          // hide navigation:
          removeClass(document.documentElement, "offCanvasBasket");
          juno.basketIsRevealed = false;
        }
      }
    }
  };

  // close by touching the visible part of the content:
  document.addEventListener(
    "click",
    function (e) {
      juno.checkCloseNavigation(e);
      juno.checkCloseBasketNavigation(e);
    },
    true
  );

  // double up for mobile event:
  document.addEventListener("touchend", function (e) {
    juno.checkCloseNavigation(e);
    juno.checkCloseBasketNavigation(e);
  });

  juno.swipeLeft = function () {
    if (juno.navigationIsRevealed) {
      removeClass(document.documentElement, "offCanvas");
      juno.navigationIsRevealed = false;
    }
  };

  juno.swipeRight = function () {
    if (juno.basketIsRevealed) {
      removeClass(document.documentElement, "offCanvasBasket");
      juno.basketIsRevealed = false;
    }
  };

  // init touch:
  if ("ontouchstart" in document.documentElement) {
    document.body.addEventListener(
      "touchstart",
      function (a) {
        startPointX = a.touches[0].pageX;
        startPointY = a.touches[0].pageY;
        isScrolling = "";
        deltaX = 0;
      },
      false
    );
    document.body.addEventListener(
      "touchmove",
      function (a) {
        if (a.touches.length > 1 || (a.scale && a.scale !== 1)) {
          return;
        }
        deltaX = a.touches[0].pageX - startPointX;
        if (isScrolling === "") {
          isScrolling =
            isScrolling ||
            Math.abs(deltaX) < Math.abs(a.touches[0].pageY - startPointY);
        }
        if (!isScrolling) {
          a.preventDefault();
        }
      },
      false
    );
    document.body.addEventListener(
      "touchend",
      function (a) {
        if (!isScrolling) {
          if (Math.abs(deltaX) > 100) {
            if (deltaX < 0) {
              juno.swipeLeft();
            } else {
              juno.swipeRight();
            }
          }
        }
      },
      false
    );
  }
}

// Generated by CoffeeScript 1.9.2
/**
@license Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
 */
(function () {
  var $, win;
  $ = this.jQuery || window.jQuery;
  win = $(window);
  $.fn.stick_in_parent = function (opts) {
    var doc,
      elm,
      enable_bottoming,
      fn,
      i,
      inner_scrolling,
      len,
      manual_spacer,
      offset_top,
      outer_width,
      parent_selector,
      recalc_every,
      sticky_class,
      sticky_start_end;
    if (opts == null) {
      opts = {};
    }
    (sticky_class = opts.sticky_class),
      (inner_scrolling = opts.inner_scrolling),
      (recalc_every = opts.recalc_every),
      (parent_selector = opts.parent),
      (offset_top = opts.offset_top),
      (manual_spacer = opts.spacer),
      (enable_bottoming = opts.bottoming),
      (sticky_start_end = opts.sticky_start_end);
    if (offset_top == null) {
      offset_top = 0;
    }
    if (parent_selector == null) {
      parent_selector = void 0;
    }
    if (inner_scrolling == null) {
      inner_scrolling = true;
    }
    if (sticky_class == null) {
      sticky_class = "is_stuck";
    }
    if (sticky_start_end == null) {
      sticky_start_end = false;
    }
    doc = $(document);
    if (enable_bottoming == null) {
      enable_bottoming = true;
    }
    outer_width = function (el) {
      var _el, computed, w;
      if (window.getComputedStyle) {
        _el = el[0];
        computed = window.getComputedStyle(el[0]);
        w =
          parseFloat(computed.getPropertyValue("width")) +
          parseFloat(computed.getPropertyValue("margin-left")) +
          parseFloat(computed.getPropertyValue("margin-right"));
        if (computed.getPropertyValue("box-sizing") !== "border-box") {
          w +=
            parseFloat(computed.getPropertyValue("border-left-width")) +
            parseFloat(computed.getPropertyValue("border-right-width")) +
            parseFloat(computed.getPropertyValue("padding-left")) +
            parseFloat(computed.getPropertyValue("padding-right"));
        }
        return w;
      } else {
        return el.outerWidth(true);
      }
    };
    fn = function (
      elm,
      padding_bottom,
      parent_top,
      parent_height,
      top,
      height,
      el_float,
      detached
    ) {
      var bottomed,
        detach,
        fixed,
        last_pos,
        last_scroll_height,
        offset,
        parent,
        recalc,
        recalc_and_tick,
        recalc_counter,
        spacer,
        tick;
      if (elm.data("sticky_kit")) {
        return;
      }
      elm.data("sticky_kit", true);
      last_scroll_height = doc.height();
      parent = elm.parent();
      if (parent_selector != null) {
        parent = parent.closest(parent_selector);
      }
      if (!parent.length) {
        throw "failed to find stick parent";
      }
      fixed = false;
      bottomed = false;
      spacer =
        manual_spacer != null
          ? manual_spacer && elm.closest(manual_spacer)
          : $("<div />");
      if (spacer) {
        spacer.css("position", elm.css("position"));
      }
      recalc = function () {
        var border_top, padding_top, restore;
        if (detached) {
          return;
        }
        last_scroll_height = doc.height();
        border_top = parseInt(parent.css("border-top-width"), 10);
        padding_top = parseInt(parent.css("padding-top"), 10);
        padding_bottom = parseInt(parent.css("padding-bottom"), 10);
        parent_top = parent.offset().top + border_top + padding_top;
        parent_height = parent.height();
        if (fixed) {
          fixed = false;
          bottomed = false;
          if (manual_spacer == null) {
            elm.insertAfter(spacer);
            spacer.detach();
          }
          elm
            .css({
              position: "",
              top: "",
              width: "",
              bottom: "",
            })
            .removeClass(sticky_class);
          restore = true;
        }
        top =
          elm.offset().top -
          (parseInt(elm.css("margin-top"), 10) || 0) -
          offset_top;
        height = elm.outerHeight(true);
        el_float = elm.css("float");
        if (spacer) {
          spacer.css({
            width: outer_width(elm),
            height: height,
            display: elm.css("display"),
            "vertical-align": elm.css("vertical-align"),
            float: el_float,
          });
        }
        if (restore) {
          return tick();
        }
      };
      recalc();
      if (height === parent_height) {
        return;
      }
      last_pos = void 0;
      offset = offset_top;
      recalc_counter = recalc_every;
      tick = function () {
        var css, delta, recalced, scroll, will_bottom, win_height;
        if (detached) {
          return;
        }
        recalced = false;
        if (recalc_counter != null) {
          recalc_counter -= 1;
          if (recalc_counter <= 0) {
            recalc_counter = recalc_every;
            recalc();
            recalced = true;
          }
        }
        if (!recalced && doc.height() !== last_scroll_height) {
          recalc();
          recalced = true;
        }
        scroll = win.scrollTop();
        if (last_pos != null) {
          delta = scroll - last_pos;
        }
        last_pos = scroll;
        if (fixed) {
          if (enable_bottoming) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
            if (bottomed && !will_bottom) {
              bottomed = false;
              elm
                .css({
                  position: "fixed",
                  bottom: "",
                  top: offset,
                })
                .trigger("sticky_kit:unbottom");
            }
          }
          var bottom_elm = top;
          if (sticky_start_end == true) {
            bottom_elm = top + height;
          }
          if (scroll < bottom_elm) {
            fixed = false;
            offset = offset_top;
            if (manual_spacer == null) {
              if (el_float === "left" || el_float === "right") {
                elm.insertAfter(spacer);
              }
              spacer.detach();
            }
            // css = {
            //   position: "",
            //   width: "",
            //   top: "",
            //   // JHR addition ######################
            //   padding: ""
            //   // end JHR addition ##################
            // };
            elm
              .removeClass(sticky_class)
              .trigger("sticky_kit:unstick")
              .delay(250)
              .queue(function (next) {
                elm.removeClass("delay").parent("height", "");
                next();
              });
          }
          if (inner_scrolling) {
            win_height = win.height();
            if (height + offset_top > win_height) {
              if (!bottomed) {
                offset -= delta;
                offset = Math.max(win_height - height, offset);
                offset = Math.min(offset_top, offset);
                if (fixed) {
                  elm.css({
                    top: offset + "px",
                  });
                }
              }
            }
          }
        } else {
          bottom_elm = top;
          if (sticky_start_end == true) {
            bottom_elm = top + height;
          }
          if (scroll > bottom_elm) {
            fixed = true;
            // css = {
            //   position: "fixed",
            //   top: offset
            // };
            //css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
            // JHR addition ######################
            // in case padding is a percentage that will be altered by the addition of the parent element, convert padding to px while in this state
            //elm.css("padding-left",(parseInt(elm.css("padding-left"), 10)));
            //elm.css("padding-right",(parseInt(elm.css("padding-right"), 10)));
            // end JHR addition ##################
            elm
              .addClass(sticky_class)
              .delay(500)
              .queue(function (next) {
                elm.addClass("delay");
                next();
              });
            if (manual_spacer == null) {
              elm.after(spacer);
              if (el_float === "left" || el_float === "right") {
                spacer.append(elm);
              }
            }
            elm.trigger("sticky_kit:stick");
          }
        }
        if (fixed && enable_bottoming) {
          if (will_bottom == null) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
          }
          if (!bottomed && will_bottom) {
            bottomed = true;
            if (parent.css("position") === "static") {
              parent.css({
                position: "relative",
              });
            }
            return elm
              .css({
                position: "absolute",
                bottom: padding_bottom,
                top: "auto",
              })
              .trigger("sticky_kit:bottom");
          }
        }
      };
      recalc_and_tick = function () {
        recalc();
        return tick();
      };
      detach = function () {
        detached = true;
        win.off("touchmove", tick);
        win.off("scroll", tick);
        win.off("resize", recalc_and_tick);
        $(document.body).off("sticky_kit:recalc", recalc_and_tick);
        elm.off("sticky_kit:detach", detach);
        elm.removeData("sticky_kit");
        elm.css({
          position: "",
          bottom: "",
          top: "",
          width: "",
        });
        parent.position("position", "");
        if (fixed) {
          if (manual_spacer == null) {
            if (el_float === "left" || el_float === "right") {
              elm.insertAfter(spacer);
            }
            spacer.remove();
          }
          return elm.removeClass(sticky_class);
        }
      };
      win.on("touchmove", tick);
      win.on("scroll", tick);
      win.on("resize", recalc_and_tick);
      $(document.body).on("sticky_kit:recalc", recalc_and_tick);
      elm.on("sticky_kit:detach", detach);
      return setTimeout(tick, 0);
    };
    for (i = 0, len = this.length; i < len; i++) {
      elm = this[i];
      fn($(elm));
    }
    return this;
  };
}).call(this);

/**
 * Featherlight - ultra slim jQuery lightbox
 * Version 1.7.1 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2017, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
 **/
(function ($) {
  "use strict";

  if ("undefined" === typeof $) {
    if ("console" in window) {
      window.console.info("Too much lightness, Featherlight needs jQuery.");
    }
    return;
  }

  /* Featherlight is exported as $.featherlight.
	   It is a function used to open a featherlight lightbox.

	   [tech]
	   Featherlight uses prototype inheritance.
	   Each opened lightbox will have a corresponding object.
	   That object may have some attributes that override the
	   prototype's.
	   Extensions created with Featherlight.extend will have their
	   own prototype that inherits from Featherlight's prototype,
	   thus attributes can be overriden either at the object level,
	   or at the extension level.
	   To create callbacks that chain themselves instead of overriding,
	   use chainCallbacks.
	   For those familiar with CoffeeScript, this correspond to
	   Featherlight being a class and the Gallery being a class
	   extending Featherlight.
	   The chainCallbacks is used since we don't have access to
	   CoffeeScript's `super`.
	*/

  function Featherlight($content, config) {
    if (this instanceof Featherlight) {
      /* called with new */
      this.id = Featherlight.id++;
      this.setup($content, config);
      this.chainCallbacks(Featherlight._callbackChain);
    } else {
      var fl = new Featherlight($content, config);
      fl.open();
      return fl;
    }
  }

  var opened = [],
    pruneOpened = function (remove) {
      opened = $.grep(opened, function (fl) {
        return fl !== remove && fl.$instance.closest("body").length > 0;
      });
      return opened;
    };

  // Removes keys of `set` from `obj` and returns the removed key/values.
  function slice(obj, set) {
    var r = {};
    for (var key in obj) {
      if (key in set) {
        r[key] = obj[key];
        delete obj[key];
      }
    }
    return r;
  }

  // NOTE: List of available [iframe attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).
  var iFrameAttributeSet = {
    allowfullscreen: 1,
    frameborder: 1,
    height: 1,
    longdesc: 1,
    marginheight: 1,
    marginwidth: 1,
    name: 1,
    referrerpolicy: 1,
    scrolling: 1,
    sandbox: 1,
    src: 1,
    srcdoc: 1,
    width: 1,
  };

  // Converts camelCased attributes to dasherized versions for given prefix:
  //   parseAttrs({hello: 1, hellFrozeOver: 2}, 'hell') => {froze-over: 2}
  function parseAttrs(obj, prefix) {
    var attrs = {},
      regex = new RegExp("^" + prefix + "([A-Z])(.*)");
    for (var key in obj) {
      var match = key.match(regex);
      if (match) {
        var dasherized = (
          match[1] + match[2].replace(/([A-Z])/g, "-$1")
        ).toLowerCase();
        attrs[dasherized] = obj[key];
      }
    }
    return attrs;
  }

  /* document wide key handler */
  var eventMap = { keyup: "onKeyUp", resize: "onResize" };

  var globalEventHandler = function (event) {
    $.each(Featherlight.opened().reverse(), function () {
      if (!event.isDefaultPrevented()) {
        if (false === this[eventMap[event.type]](event)) {
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
      }
    });
  };

  var toggleGlobalEvents = function (set) {
    if (set !== Featherlight._globalHandlerInstalled) {
      Featherlight._globalHandlerInstalled = set;
      var events = $.map(eventMap, function (_, name) {
        return name + "." + Featherlight.prototype.namespace;
      }).join(" ");
      $(window)[set ? "on" : "off"](events, globalEventHandler);
    }
  };

  Featherlight.prototype = {
    constructor: Featherlight,
    /*** defaults ***/
    /* extend featherlight with defaults and methods */
    namespace: "featherlight" /* Name of the events and css class prefix */,
    targetAttr:
      "data-featherlight" /* Attribute of the triggered element that contains the selector to the lightbox content */,
    variant: null /* Class that will be added to change look of the lightbox */,
    resetCss: false /* Reset all css */,
    background:
      null /* Custom DOM for the background, wrapper and the closebutton */,
    openTrigger: "click" /* Event that triggers the lightbox */,
    closeTrigger: "click" /* Event that triggers the closing of the lightbox */,
    filter:
      null /* Selector to filter events. Think $(...).on('click', filter, eventHandler) */,
    root: "body" /* Where to append featherlights */,
    openSpeed: 250 /* Duration of opening animation */,
    closeSpeed: 250 /* Duration of closing animation */,
    closeOnClick:
      "background" /* Close lightbox on click ('background', 'anywhere' or false) */,
    closeOnEsc: true /* Close lightbox when pressing esc */,
    closeIcon: "" /* Close icon */,
    loading: "" /* Content to show while initial content is loading */,
    persist: false /* If set, the content will persist and will be shown again when opened again. 'shared' is a special value when binding multiple elements for them to share the same content */,
    otherClose:
      null /* Selector for alternate close buttons (e.g. "a.close") */,
    beforeOpen:
      $.noop /* Called before open. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */,
    beforeContent:
      $.noop /* Called when content is loaded. Gets event as parameter, this contains all data */,
    beforeClose:
      $.noop /* Called before close. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */,
    afterOpen:
      $.noop /* Called after open. Gets event as parameter, this contains all data */,
    afterContent:
      $.noop /* Called after content is ready and has been set. Gets event as parameter, this contains all data */,
    afterClose:
      $.noop /* Called after close. Gets event as parameter, this contains all data */,
    onKeyUp: $.noop /* Called on key up for the frontmost featherlight */,
    onResize:
      $.noop /* Called after new content and when a window is resized */,
    type: null /* Specify type of lightbox. If unset, it will check for the targetAttrs value. */,
    contentFilters: [
      "jquery",
      "image",
      "html",
      "ajax",
      "iframe",
      "text",
    ] /* List of content filters to use to determine the content */,

    /*** methods ***/
    /* setup iterates over a single instance of featherlight and prepares the background and binds the events */
    setup: function (target, config) {
      /* all arguments are optional */
      if (
        typeof target === "object" &&
        target instanceof $ === false &&
        !config
      ) {
        config = target;
        target = undefined;
      }

      var self = $.extend(this, config, { target: target }),
        css = !self.resetCss
          ? self.namespace
          : self.namespace +
            "-reset" /* by adding -reset to the classname, we reset all the default css */,
        $background = $(
          self.background ||
            [
              '<div class="' + css + "-loading " + css + '">',
              '<div class="' + css + '-content">',
              '<button class="' +
                css +
                "-close-icon " +
                self.namespace +
                '-close" aria-label="Close">',
              self.closeIcon,
              "</button>",
              '<div class="' +
                self.namespace +
                '-inner">' +
                self.loading +
                "</div>",
              "</div>",
              "</div>",
            ].join("")
        ),
        closeButtonSelector =
          "." +
          self.namespace +
          "-close" +
          (self.otherClose ? "," + self.otherClose : "");

      self.$instance = $background
        .clone()
        .addClass(
          self.variant
        ); /* clone DOM for the background, wrapper and the close button */

      /* close when click on background/anywhere/null or closebox */
      self.$instance.on(
        self.closeTrigger + "." + self.namespace,
        function (event) {
          var $target = $(event.target);
          if (
            ("background" === self.closeOnClick &&
              $target.is("." + self.namespace)) ||
            "anywhere" === self.closeOnClick ||
            $target.closest(closeButtonSelector).length
          ) {
            self.close(event);
            event.preventDefault();
          }
        }
      );

      return this;
    },

    /* this method prepares the content and converts it into a jQuery object or a promise */
    getContent: function () {
      if (this.persist !== false && this.$content) {
        return this.$content;
      }
      var self = this,
        filters = this.constructor.contentFilters,
        readTargetAttr = function (name) {
          return self.$currentTarget && self.$currentTarget.attr(name);
        },
        targetValue = readTargetAttr(self.targetAttr),
        data = self.target || targetValue || "";

      /* Find which filter applies */
      var filter =
        filters[self.type]; /* check explicit type like {type: 'image'} */

      /* check explicit type like data-featherlight="image" */
      if (!filter && data in filters) {
        filter = filters[data];
        data = self.target && targetValue;
      }
      data = data || readTargetAttr("href") || "";

      /* check explicity type & content like {image: 'photo.jpg'} */
      if (!filter) {
        for (var filterName in filters) {
          if (self[filterName]) {
            filter = filters[filterName];
            data = self[filterName];
          }
        }
      }

      /* otherwise it's implicit, run checks */
      if (!filter) {
        var target = data;
        data = null;
        $.each(self.contentFilters, function () {
          filter = filters[this];
          if (filter.test) {
            data = filter.test(target);
          }
          if (
            !data &&
            filter.regex &&
            target.match &&
            target.match(filter.regex)
          ) {
            data = target;
          }
          return !data;
        });
        if (!data) {
          if ("console" in window) {
            window.console.error(
              "Featherlight: no content filter found " +
                (target ? ' for "' + target + '"' : " (no target specified)")
            );
          }
          return false;
        }
      }
      /* Process it */
      return filter.process.call(self, data);
    },

    /* sets the content of $instance to $content */
    setContent: function ($content) {
      var self = this;
      /* we need a special class for the iframe */
      if ($content.is("iframe")) {
        self.$instance.addClass(self.namespace + "-iframe");
      }

      self.$instance.removeClass(self.namespace + "-loading");

      /* replace content by appending to existing one before it is removed
			   this insures that featherlight-inner remain at the same relative
				 position to any other items added to featherlight-content */
      self.$instance
        .find("." + self.namespace + "-inner")
        .not($content) /* excluded new content, important if persisted */
        .slice(1)
        .remove()
        .end() /* In the unexpected event where there are many inner elements, remove all but the first one */
        .replaceWith(
          $.contains(self.$instance[0], $content[0]) ? "" : $content
        );

      self.$content = $content.addClass(self.namespace + "-inner");

      return self;
    },

    /* opens the lightbox. "this" contains $instance with the lightbox, and with the config.
			Returns a promise that is resolved after is successfully opened. */
    open: function (event) {
      var self = this;
      self.$instance.hide().appendTo(self.root);
      if (
        (!event || !event.isDefaultPrevented()) &&
        self.beforeOpen(event) !== false
      ) {
        if (event) {
          event.preventDefault();
        }
        var $content = self.getContent();

        if ($content) {
          opened.push(self);

          toggleGlobalEvents(true);

          self.$instance.fadeIn(self.openSpeed);
          self.beforeContent(event);

          /* Set content and show */
          return (
            $.when($content)
              .always(function ($content) {
                self.setContent($content);
                self.afterContent(event);
              })
              .then(self.$instance.promise())
              /* Call afterOpen after fadeIn is done */
              .done(function () {
                self.afterOpen(event);
              })
          );
        }
      }
      self.$instance.detach();
      return $.Deferred().reject().promise();
    },

    /* closes the lightbox. "this" contains $instance with the lightbox, and with the config
			returns a promise, resolved after the lightbox is successfully closed. */
    close: function (event) {
      var self = this,
        deferred = $.Deferred();

      if (self.beforeClose(event) === false) {
        deferred.reject();
      } else {
        if (0 === pruneOpened(self).length) {
          toggleGlobalEvents(false);
        }

        self.$instance.fadeOut(self.closeSpeed, function () {
          self.$instance.detach();
          self.afterClose(event);
          deferred.resolve();
        });
      }
      return deferred.promise();
    },

    /* resizes the content so it fits in visible area and keeps the same aspect ratio.
				Does nothing if either the width or the height is not specified.
				Called automatically on window resize.
				Override if you want different behavior. */
    resize: function (w, h) {
      if (w && h) {
        /* Reset apparent image size first so container grows */
        this.$content.css("width", "").css("height", "");
        /* Calculate the worst ratio so that dimensions fit */
        /* Note: -1 to avoid rounding errors */
        var ratio = Math.max(
          w / (parseInt(this.$content.parent().css("width"), 10) - 1),
          h / (parseInt(this.$content.parent().css("height"), 10) - 1)
        );
        /* Resize content */
        if (ratio > 1) {
          ratio =
            h /
            Math.floor(h / ratio); /* Round ratio down so height calc works */
          this.$content
            .css("width", "" + w / ratio + "px")
            .css("height", "" + h / ratio + "px");
        }
      }
    },

    /* Utility function to chain callbacks
		   [Warning: guru-level]
		   Used be extensions that want to let users specify callbacks but
		   also need themselves to use the callbacks.
		   The argument 'chain' has callback names as keys and function(super, event)
		   as values. That function is meant to call `super` at some point.
		*/
    chainCallbacks: function (chain) {
      for (var name in chain) {
        this[name] = $.proxy(chain[name], this, $.proxy(this[name], this));
      }
    },
  };

  $.extend(Featherlight, {
    id: 0 /* Used to id single featherlight instances */,
    autoBind:
      "[data-featherlight]" /* Will automatically bind elements matching this selector. Clear or set before onReady */,
    defaults:
      Featherlight.prototype /* You can access and override all defaults using $.featherlight.defaults, which is just a synonym for $.featherlight.prototype */,
    /* Contains the logic to determine content */
    contentFilters: {
      jquery: {
        regex:
          /^[#.]\w/ /* Anything that starts with a class name or identifiers */,
        test: function (elem) {
          return elem instanceof $ && elem;
        },
        process: function (elem) {
          return this.persist !== false ? $(elem) : $(elem).clone(true);
        },
      },
      image: {
        regex: /\.(png|jpg|jpeg|gif|tiff|bmp|svg)(\?\S*)?$/i,
        process: function (url) {
          var self = this,
            deferred = $.Deferred(),
            img = new Image(),
            $img = $(
              '<img src="' +
                url +
                '" alt="" class="' +
                self.namespace +
                '-image" />'
            );
          img.onload = function () {
            /* Store naturalWidth & height for IE8 */
            $img.naturalWidth = img.width;
            $img.naturalHeight = img.height;
            deferred.resolve($img);
          };
          img.onerror = function () {
            deferred.reject($img);
          };
          img.src = url;
          return deferred.promise();
        },
      },
      html: {
        regex:
          /^\s*<[\w!][^<]*>/ /* Anything that starts with some kind of valid tag */,
        process: function (html) {
          return $(html);
        },
      },
      ajax: {
        regex: /./ /* At this point, any content is assumed to be an URL */,
        process: function (url) {
          var self = this,
            deferred = $.Deferred();
          /* we are using load so one can specify a target with: url.html #targetelement */
          var $container = $("<div></div>").load(
            url,
            function (response, status) {
              if (status !== "error") {
                deferred.resolve($container.contents());
              }
              deferred.fail();
            }
          );
          return deferred.promise();
        },
      },
      iframe: {
        process: function (url) {
          var deferred = new $.Deferred();
          var $content = $("<iframe/>");
          var css = parseAttrs(this, "iframe");
          var attrs = slice(css, iFrameAttributeSet);
          $content
            .hide()
            .attr("src", url)
            .attr(attrs)
            .css(css)
            .on("load", function () {
              deferred.resolve($content.show());
            })
            // We can't move an <iframe> and avoid reloading it,
            // so let's put it in place ourselves right now:
            .appendTo(this.$instance.find("." + this.namespace + "-content"));
          return deferred.promise();
        },
      },
      text: {
        process: function (text) {
          return $("<div>", { text: text });
        },
      },
    },

    functionAttributes: [
      "beforeOpen",
      "afterOpen",
      "beforeContent",
      "afterContent",
      "beforeClose",
      "afterClose",
    ],

    /*** class methods ***/
    /* read element's attributes starting with data-featherlight- */
    readElementConfig: function (element, namespace) {
      var Klass = this,
        regexp = new RegExp("^data-" + namespace + "-(.*)"),
        config = {};
      if (element && element.attributes) {
        $.each(element.attributes, function () {
          var match = this.name.match(regexp);
          if (match) {
            var val = this.value,
              name = $.camelCase(match[1]);
            if ($.inArray(name, Klass.functionAttributes) >= 0) {
              /* jshint -W054 */
              val = new Function(val); /* jshint +W054 */
            } else {
              try {
                val = JSON.parse(val);
              } catch (e) {}
            }
            config[name] = val;
          }
        });
      }
      return config;
    },

    /* Used to create a Featherlight extension
		   [Warning: guru-level]
		   Creates the extension's prototype that in turn
		   inherits Featherlight's prototype.
		   Could be used to extend an extension too...
		   This is pretty high level wizardy, it comes pretty much straight
		   from CoffeeScript and won't teach you anything about Featherlight
		   as it's not really specific to this library.
		   My suggestion: move along and keep your sanity.
		*/
    extend: function (child, defaults) {
      /* Setup class hierarchy, adapted from CoffeeScript */
      var Ctor = function () {
        this.constructor = child;
      };
      Ctor.prototype = this.prototype;
      child.prototype = new Ctor();
      child.__super__ = this.prototype;
      /* Copy class methods & attributes */
      $.extend(child, this, defaults);
      child.defaults = child.prototype;
      return child;
    },

    attach: function ($source, $content, config) {
      var Klass = this;
      if (
        typeof $content === "object" &&
        $content instanceof $ === false &&
        !config
      ) {
        config = $content;
        $content = undefined;
      }
      /* make a copy */
      config = $.extend({}, config);

      /* Only for openTrigger and namespace... */
      var namespace = config.namespace || Klass.defaults.namespace,
        tempConfig = $.extend(
          {},
          Klass.defaults,
          Klass.readElementConfig($source[0], namespace),
          config
        ),
        sharedPersist;
      var handler = function (event) {
        /* ... since we might as well compute the config on the actual target */
        var elemConfig = $.extend(
          { $source: $source, $currentTarget: $(this) },
          Klass.readElementConfig($source[0], tempConfig.namespace),
          Klass.readElementConfig(this, tempConfig.namespace),
          config
        );
        var fl =
          sharedPersist ||
          $(this).data("featherlight-persisted") ||
          new Klass($content, elemConfig);
        if (fl.persist === "shared") {
          sharedPersist = fl;
        } else if (fl.persist !== false) {
          $(this).data("featherlight-persisted", fl);
        }
        elemConfig.$currentTarget.blur(); // Otherwise 'enter' key might trigger the dialog again
        fl.open(event);
      };

      $source.on(
        tempConfig.openTrigger + "." + tempConfig.namespace,
        tempConfig.filter,
        handler
      );

      return handler;
    },

    current: function () {
      var all = this.opened();
      return all[all.length - 1] || null;
    },

    opened: function () {
      var klass = this;
      pruneOpened();
      return $.grep(opened, function (fl) {
        return fl instanceof klass;
      });
    },

    close: function (event) {
      var cur = this.current();
      if (cur) {
        return cur.close(event);
      }
    },

    /* Does the auto binding on startup.
		   Meant only to be used by Featherlight and its extensions
		*/
    _onReady: function () {
      var Klass = this;
      if (Klass.autoBind) {
        /* Bind existing elements */
        $(Klass.autoBind).each(function () {
          Klass.attach($(this));
        });
        /* If a click propagates to the document level, then we have an item that was added later on */
        $(document).on("click", Klass.autoBind, function (evt) {
          if (evt.isDefaultPrevented()) {
            return;
          }
          /* Bind featherlight */
          var handler = Klass.attach($(evt.currentTarget));
          /* Dispatch event directly */
          handler(evt);
        });
      }
    },

    /* Featherlight uses the onKeyUp callback to intercept the escape key.
		   Private to Featherlight.
		*/
    _callbackChain: {
      onKeyUp: function (_super, event) {
        if (27 === event.keyCode) {
          if (this.closeOnEsc) {
            $.featherlight.close(event);
          }
          return false;
        } else {
          return _super(event);
        }
      },

      beforeOpen: function (_super, event) {
        // Remember focus:
        this._previouslyActive = document.activeElement;

        // Disable tabbing:
        // See http://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
        this._$previouslyTabbable = $(
          "a, input, select, textarea, iframe, button, iframe, [contentEditable=true]"
        )
          .not("[tabindex]")
          .not(this.$instance.find("button"));

        this._$previouslyWithTabIndex = $("[tabindex]").not('[tabindex="-1"]');
        this._previousWithTabIndices = this._$previouslyWithTabIndex.map(
          function (_i, elem) {
            return $(elem).attr("tabindex");
          }
        );

        this._$previouslyWithTabIndex
          .add(this._$previouslyTabbable)
          .attr("tabindex", -1);

        document.activeElement.blur();
        return _super(event);
      },

      afterClose: function (_super, event) {
        var r = _super(event);
        var self = this;
        this._$previouslyTabbable.removeAttr("tabindex");
        this._$previouslyWithTabIndex.each(function (i, elem) {
          $(elem).attr("tabindex", self._previousWithTabIndices[i]);
        });
        this._previouslyActive.focus();
        return r;
      },

      onResize: function (_super, event) {
        this.resize(this.$content.naturalWidth, this.$content.naturalHeight);
        return _super(event);
      },

      afterContent: function (_super, event) {
        var r = _super(event);
        this.$instance.find("[autofocus]:not([disabled])").focus();
        this.onResize(event);
        return r;
      },
    },
  });

  $.featherlight = Featherlight;

  /* bind jQuery elements to trigger featherlight */
  $.fn.featherlight = function ($content, config) {
    Featherlight.attach(this, $content, config);
    return this;
  };

  /* bind featherlight on ready if config autoBind is set */
  $(document).ready(function () {
    Featherlight._onReady();
  });
})(jQuery);

/**
 * Featherlight Gallery – an extension for the ultra slim jQuery lightbox
 * Version 1.7.13 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2018, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
 **/
(function ($) {
  "use strict";

  var warn = function (m) {
    if (window.console && window.console.warn) {
      window.console.warn("FeatherlightGallery: " + m);
    }
  };

  if ("undefined" === typeof $) {
    return warn("Too much lightness, Featherlight needs jQuery.");
  } else if (!$.featherlight) {
    return warn("Load the featherlight plugin before the gallery plugin");
  }

  var isTouchAware =
      "ontouchstart" in window ||
      (window.DocumentTouch && document instanceof DocumentTouch),
    jQueryConstructor = $.event && $.event.special.swipeleft && $,
    hammerConstructor =
      window.Hammer &&
      function ($el) {
        var mc = new window.Hammer.Manager($el[0]);
        mc.add(new window.Hammer.Swipe());
        return mc;
      },
    swipeAwareConstructor =
      isTouchAware && (jQueryConstructor || hammerConstructor);
  if (isTouchAware && !swipeAwareConstructor) {
    warn(
      "No compatible swipe library detected; one must be included before featherlightGallery for swipe motions to navigate the galleries."
    );
  }

  var callbackChain = {
    afterClose: function (_super, event) {
      var self = this;
      self.$instance.off(
        "next." + self.namespace + " previous." + self.namespace
      );
      if (self._swiper) {
        self._swiper
          .off(
            "swipeleft",
            self._swipeleft
          ) /* See http://stackoverflow.com/questions/17367198/hammer-js-cant-remove-event-listener */
          .off("swiperight", self._swiperight);
        self._swiper = null;
      }
      return _super(event);
    },
    beforeOpen: function (_super, event) {
      var self = this;

      self.$instance.on(
        "next." + self.namespace + " previous." + self.namespace,
        function (event) {
          var offset = event.type === "next" ? +1 : -1;
          self.navigateTo(self.currentNavigation() + offset);
        }
      );

      if (swipeAwareConstructor) {
        self._swiper = swipeAwareConstructor(self.$instance)
          .on(
            "swipeleft",
            (self._swipeleft = function () {
              self.$instance.trigger("next");
            })
          )
          .on(
            "swiperight",
            (self._swiperight = function () {
              self.$instance.trigger("previous");
            })
          );

        self.$instance.addClass(
          this.namespace + "-swipe-aware",
          swipeAwareConstructor
        );
      }

      self.$instance
        .find("." + self.namespace + "-content")
        .append(self.createNavigation("previous"))
        .append(self.createNavigation("next"));

      return _super(event);
    },
    beforeContent: function (_super, event) {
      var index = this.currentNavigation();
      var len = this.slides().length;
      this.$instance
        .toggleClass(this.namespace + "-first-slide", index === 0)
        .toggleClass(this.namespace + "-last-slide", index === len - 1);
      return _super(event);
    },
    onKeyUp: function (_super, event) {
      var dir = {
        37: "previous" /* Left arrow */,
        39: "next" /* Rigth arrow */,
      }[event.keyCode];
      if (dir) {
        this.$instance.trigger(dir);
        return false;
      } else {
        return _super(event);
      }
    },
  };

  function FeatherlightGallery($source, config) {
    if (this instanceof FeatherlightGallery) {
      /* called with new */
      $.featherlight.apply(this, arguments);
      this.chainCallbacks(callbackChain);
    } else {
      var flg = new FeatherlightGallery(
        $.extend({ $source: $source, $currentTarget: $source.first() }, config)
      );
      flg.open();
      return flg;
    }
  }

  $.featherlight.extend(FeatherlightGallery, {
    autoBind: "[data-featherlight-gallery]",
  });

  $.extend(FeatherlightGallery.prototype, {
    /** Additional settings for Gallery **/
    previousIcon: "&#9664;" /* Code that is used as previous icon */,
    nextIcon: "&#9654;" /* Code that is used as next icon */,
    galleryFadeIn: 100 /* fadeIn speed when image is loaded */,
    galleryFadeOut: 300 /* fadeOut speed before image is loaded */,

    slides: function () {
      if (this.filter) {
        return this.$source.find(this.filter);
      }
      return this.$source;
    },

    images: function () {
      warn("images is deprecated, please use slides instead");
      return this.slides();
    },

    currentNavigation: function () {
      return this.slides().index(this.$currentTarget);
    },

    navigateTo: function (index) {
      var self = this,
        source = self.slides(),
        len = source.length,
        $inner = self.$instance.find("." + self.namespace + "-inner");
      index = ((index % len) + len) % len; /* pin index to [0, len[ */

      self.$currentTarget = source.eq(index);
      self.beforeContent();
      return $.when(
        self.getContent(),
        $inner.fadeTo(self.galleryFadeOut, 0.2)
      ).always(function ($newContent) {
        self.setContent($newContent);
        self.afterContent();
        $newContent.fadeTo(self.galleryFadeIn, 1);
      });
    },

    createNavigation: function (target) {
      var self = this;
      return $(
        '<span title="' +
          target +
          '" class="' +
          this.namespace +
          "-" +
          target +
          '"><span>' +
          this[target + "Icon"] +
          "</span></span>"
      ).click(function (evt) {
        $(this).trigger(target + "." + self.namespace);
        evt.preventDefault();
      });
    },
  });

  $.featherlightGallery = FeatherlightGallery;

  /* extend jQuery with selector featherlight method $(elm).featherlight(config, elm); */
  $.fn.featherlightGallery = function (config) {
    FeatherlightGallery.attach(this, config);
    return this;
  };

  /* bind featherlight on ready if config autoBind is set */
  $(document).ready(function () {
    FeatherlightGallery._onReady();
  });
})(jQuery);

/*! modernizr 3.4.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-csstransforms-flexbox-svg-setclasses !*/
!(function (e, n, t) {
  function r(e, n) {
    return typeof e === n;
  }
  function s() {
    var e, n, t, s, o, i, a;
    for (var l in w)
      if (w.hasOwnProperty(l)) {
        if (
          ((e = []),
          (n = w[l]),
          n.name &&
            (e.push(n.name.toLowerCase()),
            n.options && n.options.aliases && n.options.aliases.length))
        )
          for (t = 0; t < n.options.aliases.length; t++)
            e.push(n.options.aliases[t].toLowerCase());
        for (s = r(n.fn, "function") ? n.fn() : n.fn, o = 0; o < e.length; o++)
          (i = e[o]),
            (a = i.split(".")),
            1 === a.length
              ? (Modernizr[a[0]] = s)
              : (!Modernizr[a[0]] ||
                  Modernizr[a[0]] instanceof Boolean ||
                  (Modernizr[a[0]] = new Boolean(Modernizr[a[0]])),
                (Modernizr[a[0]][a[1]] = s)),
            C.push((s ? "" : "no-") + a.join("-"));
      }
  }
  function o(e) {
    var n = x.className,
      t = Modernizr._config.classPrefix || "";
    if ((_ && (n = n.baseVal), Modernizr._config.enableJSClass)) {
      var r = new RegExp("(^|\\s)" + t + "no-js(\\s|$)");
      n = n.replace(r, "$1" + t + "js$2");
    }
    Modernizr._config.enableClasses &&
      ((n += " " + t + e.join(" " + t)),
      _ ? (x.className.baseVal = n) : (x.className = n));
  }
  function i(e, n) {
    return !!~("" + e).indexOf(n);
  }
  function a() {
    return "function" != typeof n.createElement
      ? n.createElement(arguments[0])
      : _
      ? n.createElementNS.call(n, "http://www.w3.org/2000/svg", arguments[0])
      : n.createElement.apply(n, arguments);
  }
  function l(e) {
    return e
      .replace(/([a-z])-([a-z])/g, function (e, n, t) {
        return n + t.toUpperCase();
      })
      .replace(/^-/, "");
  }
  function f(e, n) {
    return function () {
      return e.apply(n, arguments);
    };
  }
  function u(e, n, t) {
    var s;
    for (var o in e)
      if (e[o] in n)
        return t === !1
          ? e[o]
          : ((s = n[e[o]]), r(s, "function") ? f(s, t || n) : s);
    return !1;
  }
  function c(e) {
    return e
      .replace(/([A-Z])/g, function (e, n) {
        return "-" + n.toLowerCase();
      })
      .replace(/^ms-/, "-ms-");
  }
  function d(n, t, r) {
    var s;
    if ("getComputedStyle" in e) {
      s = getComputedStyle.call(e, n, t);
      var o = e.console;
      if (null !== s) r && (s = s.getPropertyValue(r));
      else if (o) {
        var i = o.error ? "error" : "log";
        o[i].call(
          o,
          "getComputedStyle returning null, its possible modernizr test results are inaccurate"
        );
      }
    } else s = !t && n.currentStyle && n.currentStyle[r];
    return s;
  }
  function p() {
    var e = n.body;
    return e || ((e = a(_ ? "svg" : "body")), (e.fake = !0)), e;
  }
  function m(e, t, r, s) {
    var o,
      i,
      l,
      f,
      u = "modernizr",
      c = a("div"),
      d = p();
    if (parseInt(r, 10))
      for (; r--; )
        (l = a("div")), (l.id = s ? s[r] : u + (r + 1)), c.appendChild(l);
    return (
      (o = a("style")),
      (o.type = "text/css"),
      (o.id = "s" + u),
      (d.fake ? d : c).appendChild(o),
      d.appendChild(c),
      o.styleSheet
        ? (o.styleSheet.cssText = e)
        : o.appendChild(n.createTextNode(e)),
      (c.id = u),
      d.fake &&
        ((d.style.background = ""),
        (d.style.overflow = "hidden"),
        (f = x.style.overflow),
        (x.style.overflow = "hidden"),
        x.appendChild(d)),
      (i = t(c, e)),
      d.fake
        ? (d.parentNode.removeChild(d), (x.style.overflow = f), x.offsetHeight)
        : c.parentNode.removeChild(c),
      !!i
    );
  }
  function g(n, r) {
    var s = n.length;
    if ("CSS" in e && "supports" in e.CSS) {
      for (; s--; ) if (e.CSS.supports(c(n[s]), r)) return !0;
      return !1;
    }
    if ("CSSSupportsRule" in e) {
      for (var o = []; s--; ) o.push("(" + c(n[s]) + ":" + r + ")");
      return (
        (o = o.join(" or ")),
        m(
          "@supports (" + o + ") { #modernizr { position: absolute; } }",
          function (e) {
            return "absolute" == d(e, null, "position");
          }
        )
      );
    }
    return t;
  }
  function v(e, n, s, o) {
    function f() {
      c && (delete z.style, delete z.modElem);
    }
    if (((o = r(o, "undefined") ? !1 : o), !r(s, "undefined"))) {
      var u = g(e, s);
      if (!r(u, "undefined")) return u;
    }
    for (
      var c, d, p, m, v, y = ["modernizr", "tspan", "samp"];
      !z.style && y.length;

    )
      (c = !0), (z.modElem = a(y.shift())), (z.style = z.modElem.style);
    for (p = e.length, d = 0; p > d; d++)
      if (
        ((m = e[d]),
        (v = z.style[m]),
        i(m, "-") && (m = l(m)),
        z.style[m] !== t)
      ) {
        if (o || r(s, "undefined")) return f(), "pfx" == n ? m : !0;
        try {
          z.style[m] = s;
        } catch (h) {}
        if (z.style[m] != v) return f(), "pfx" == n ? m : !0;
      }
    return f(), !1;
  }
  function y(e, n, t, s, o) {
    var i = e.charAt(0).toUpperCase() + e.slice(1),
      a = (e + " " + E.join(i + " ") + i).split(" ");
    return r(n, "string") || r(n, "undefined")
      ? v(a, n, s, o)
      : ((a = (e + " " + N.join(i + " ") + i).split(" ")), u(a, n, t));
  }
  function h(e, n, r) {
    return y(e, t, t, n, r);
  }
  var C = [],
    w = [],
    S = {
      _version: "3.4.0",
      _config: {
        classPrefix: "",
        enableClasses: !0,
        enableJSClass: !0,
        usePrefixes: !0,
      },
      _q: [],
      on: function (e, n) {
        var t = this;
        setTimeout(function () {
          n(t[e]);
        }, 0);
      },
      addTest: function (e, n, t) {
        w.push({ name: e, fn: n, options: t });
      },
      addAsyncTest: function (e) {
        w.push({ name: null, fn: e });
      },
    },
    Modernizr = function () {};
  (Modernizr.prototype = S), (Modernizr = new Modernizr());
  var x = n.documentElement,
    _ = "svg" === x.nodeName.toLowerCase();
  Modernizr.addTest(
    "svg",
    !!n.createElementNS &&
      !!n.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect
  );
  var b = "Moz O ms Webkit",
    E = S._config.usePrefixes ? b.split(" ") : [];
  S._cssomPrefixes = E;
  var N = S._config.usePrefixes ? b.toLowerCase().split(" ") : [];
  S._domPrefixes = N;
  var P = { elem: a("modernizr") };
  Modernizr._q.push(function () {
    delete P.elem;
  });
  var z = { style: P.elem.style };
  Modernizr._q.unshift(function () {
    delete z.style;
  }),
    (S.testAllProps = y),
    (S.testAllProps = h),
    Modernizr.addTest("flexbox", h("flexBasis", "1px", !0)),
    Modernizr.addTest("csstransforms", function () {
      return (
        -1 === navigator.userAgent.indexOf("Android 2.") &&
        h("transform", "scale(1)", !0)
      );
    }),
    s(),
    o(C),
    delete S.addTest,
    delete S.addAsyncTest;
  for (var T = 0; T < Modernizr._q.length; T++) Modernizr._q[T]();
  e.Modernizr = Modernizr;
})(window, document);

/**
 * Owl Carousel v2.2.1
 * Copyright 2013-2017 David Deutsch
 * Licensed under  ()
 */
/**
 * Owl carousel
 * @version 2.1.6
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 * @todo Lazy Load Icon
 * @todo prevent animationend bubling
 * @todo itemsScaleUp
 * @todo Test Zepto
 * @todo stagePadding calculate wrong active classes
 */
(function ($, window, document, undefined) {
  /**
   * Creates a carousel.
   * @class The Owl Carousel.
   * @public
   * @param {HTMLElement|jQuery} element - The element to create the carousel for.
   * @param {Object} [options] - The options
   */
  function Owl(element, options) {
    /**
     * Current settings for the carousel.
     * @public
     */
    this.settings = null;

    /**
     * Current options set by the caller including defaults.
     * @public
     */
    this.options = $.extend({}, Owl.Defaults, options);

    /**
     * Plugin element.
     * @public
     */
    this.$element = $(element);

    /**
     * Proxied event handlers.
     * @protected
     */
    this._handlers = {};

    /**
     * References to the running plugins of this carousel.
     * @protected
     */
    this._plugins = {};

    /**
     * Currently suppressed events to prevent them from beeing retriggered.
     * @protected
     */
    this._supress = {};

    /**
     * Absolute current position.
     * @protected
     */
    this._current = null;

    /**
     * Animation speed in milliseconds.
     * @protected
     */
    this._speed = null;

    /**
     * Coordinates of all items in pixel.
     * @todo The name of this member is missleading.
     * @protected
     */
    this._coordinates = [];

    /**
     * Current breakpoint.
     * @todo Real media queries would be nice.
     * @protected
     */
    this._breakpoint = null;

    /**
     * Current width of the plugin element.
     */
    this._width = null;

    /**
     * All real items.
     * @protected
     */
    this._items = [];

    /**
     * All cloned items.
     * @protected
     */
    this._clones = [];

    /**
     * Merge values of all items.
     * @todo Maybe this could be part of a plugin.
     * @protected
     */
    this._mergers = [];

    /**
     * Widths of all items.
     */
    this._widths = [];

    /**
     * Invalidated parts within the update process.
     * @protected
     */
    this._invalidated = {};

    /**
     * Ordered list of workers for the update process.
     * @protected
     */
    this._pipe = [];

    /**
     * Current state information for the drag operation.
     * @todo #261
     * @protected
     */
    this._drag = {
      time: null,
      target: null,
      pointer: null,
      stage: {
        start: null,
        current: null,
      },
      direction: null,
    };

    /**
     * Current state information and their tags.
     * @type {Object}
     * @protected
     */
    this._states = {
      current: {},
      tags: {
        initializing: ["busy"],
        animating: ["busy"],
        dragging: ["interacting"],
      },
    };

    $.each(
      ["onResize", "onThrottledResize"],
      $.proxy(function (i, handler) {
        this._handlers[handler] = $.proxy(this[handler], this);
      }, this)
    );

    $.each(
      Owl.Plugins,
      $.proxy(function (key, plugin) {
        this._plugins[key.charAt(0).toLowerCase() + key.slice(1)] = new plugin(
          this
        );
      }, this)
    );

    $.each(
      Owl.Workers,
      $.proxy(function (priority, worker) {
        this._pipe.push({
          filter: worker.filter,
          run: $.proxy(worker.run, this),
        });
      }, this)
    );

    this.setup();
    this.initialize();
  }

  /**
   * Default options for the carousel.
   * @public
   */
  Owl.Defaults = {
    items: 3,
    loop: false,
    center: false,
    rewind: false,

    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    freeDrag: false,

    margin: 0,
    stagePadding: 0,

    merge: false,
    mergeFit: true,
    autoWidth: false,

    startPosition: 0,
    rtl: false,

    smartSpeed: 250,
    fluidSpeed: false,
    dragEndSpeed: false,

    responsive: {},
    responsiveRefreshRate: 200,
    responsiveBaseElement: window,

    fallbackEasing: "swing",

    info: false,

    nestedItemSelector: false,
    itemElement: "div",
    stageElement: "div",

    refreshClass: "owl-refresh",
    loadedClass: "owl-loaded",
    loadingClass: "owl-loading",
    rtlClass: "owl-rtl",
    responsiveClass: "owl-responsive",
    dragClass: "owl-drag",
    itemClass: "owl-item",
    stageClass: "owl-stage",
    stageOuterClass: "owl-stage-outer",
    grabClass: "owl-grab",
  };

  /**
   * Enumeration for width.
   * @public
   * @readonly
   * @enum {String}
   */
  Owl.Width = {
    Default: "default",
    Inner: "inner",
    Outer: "outer",
  };

  /**
   * Enumeration for types.
   * @public
   * @readonly
   * @enum {String}
   */
  Owl.Type = {
    Event: "event",
    State: "state",
  };

  /**
   * Contains all registered plugins.
   * @public
   */
  Owl.Plugins = {};

  /**
   * List of workers involved in the update process.
   */
  Owl.Workers = [
    {
      filter: ["width", "settings"],
      run: function () {
        this._width = this.$element.width();
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function (cache) {
        cache.current =
          this._items && this._items[this.relative(this._current)];
      },
    },
    {
      filter: ["items", "settings"],
      run: function () {
        this.$stage.children(".cloned").remove();
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function (cache) {
        var margin = this.settings.margin || "",
          grid = !this.settings.autoWidth,
          rtl = this.settings.rtl,
          css = {
            width: "auto",
            "margin-left": rtl ? margin : "",
            "margin-right": rtl ? "" : margin,
          };

        !grid && this.$stage.children().css(css);

        cache.css = css;
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function (cache) {
        var width =
            (this.width() / this.settings.items).toFixed(3) -
            this.settings.margin,
          merge = null,
          iterator = this._items.length,
          grid = !this.settings.autoWidth,
          widths = [];

        cache.items = {
          merge: false,
          width: width,
        };

        while (iterator--) {
          merge = this._mergers[iterator];
          merge =
            (this.settings.mergeFit && Math.min(merge, this.settings.items)) ||
            merge;

          cache.items.merge = merge > 1 || cache.items.merge;

          widths[iterator] = !grid
            ? this._items[iterator].width()
            : width * merge;
        }

        this._widths = widths;
      },
    },
    {
      filter: ["items", "settings"],
      run: function () {
        var clones = [],
          items = this._items,
          settings = this.settings,
          // TODO: Should be computed from number of min width items in stage
          view = Math.max(settings.items * 2, 4),
          size = Math.ceil(items.length / 2) * 2,
          repeat =
            settings.loop && items.length
              ? settings.rewind
                ? view
                : Math.max(view, size)
              : 0,
          append = "",
          prepend = "";

        repeat /= 2;

        while (repeat--) {
          // Switch to only using appended clones
          clones.push(this.normalize(clones.length / 2, true));
          append = append + items[clones[clones.length - 1]][0].outerHTML;
          clones.push(
            this.normalize(items.length - 1 - (clones.length - 1) / 2, true)
          );
          prepend = items[clones[clones.length - 1]][0].outerHTML + prepend;
        }

        this._clones = clones;

        $(append).addClass("cloned").appendTo(this.$stage);
        $(prepend).addClass("cloned").prependTo(this.$stage);
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function () {
        var rtl = this.settings.rtl ? 1 : -1,
          size = this._clones.length + this._items.length,
          iterator = -1,
          previous = 0,
          current = 0,
          coordinates = [];

        while (++iterator < size) {
          previous = coordinates[iterator - 1] || 0;
          current =
            this._widths[this.relative(iterator)] + this.settings.margin;
          coordinates.push(previous + current * rtl);
        }

        this._coordinates = coordinates;
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function () {
        var padding = this.settings.stagePadding,
          coordinates = this._coordinates,
          css = {
            width:
              Math.ceil(Math.abs(coordinates[coordinates.length - 1])) +
              padding * 2,
            "padding-left": padding || "",
            "padding-right": padding || "",
          };

        this.$stage.css(css);
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function (cache) {
        var iterator = this._coordinates.length,
          grid = !this.settings.autoWidth,
          items = this.$stage.children();

        if (grid && cache.items.merge) {
          while (iterator--) {
            cache.css.width = this._widths[this.relative(iterator)];
            items.eq(iterator).css(cache.css);
          }
        } else if (grid) {
          cache.css.width = cache.items.width;
          items.css(cache.css);
        }
      },
    },
    {
      filter: ["items"],
      run: function () {
        this._coordinates.length < 1 && this.$stage.removeAttr("style");
      },
    },
    {
      filter: ["width", "items", "settings"],
      run: function (cache) {
        cache.current = cache.current
          ? this.$stage.children().index(cache.current)
          : 0;
        cache.current = Math.max(
          this.minimum(),
          Math.min(this.maximum(), cache.current)
        );
        this.reset(cache.current);
      },
    },
    {
      filter: ["position"],
      run: function () {
        this.animate(this.coordinates(this._current));
      },
    },
    {
      filter: ["width", "position", "items", "settings"],
      run: function () {
        var rtl = this.settings.rtl ? 1 : -1,
          padding = this.settings.stagePadding * 2,
          begin = this.coordinates(this.current()) + padding,
          end = begin + this.width() * rtl,
          inner,
          outer,
          matches = [],
          i,
          n;

        for (i = 0, n = this._coordinates.length; i < n; i++) {
          inner = this._coordinates[i - 1] || 0;
          outer = Math.abs(this._coordinates[i]) + padding * rtl;

          if (
            (this.op(inner, "<=", begin) && this.op(inner, ">", end)) ||
            (this.op(outer, "<", begin) && this.op(outer, ">", end))
          ) {
            matches.push(i);
          }
        }

        this.$stage.children(".active").removeClass("active");
        this.$stage
          .children(":eq(" + matches.join("), :eq(") + ")")
          .addClass("active");

        if (this.settings.center) {
          this.$stage.children(".center").removeClass("center");
          this.$stage.children().eq(this.current()).addClass("center");
        }
      },
    },
  ];

  /**
   * Initializes the carousel.
   * @protected
   */
  Owl.prototype.initialize = function () {
    this.enter("initializing");
    this.trigger("initialize");

    this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl);

    if (this.settings.autoWidth && !this.is("pre-loading")) {
      var imgs, nestedSelector, width;
      imgs = this.$element.find("img");
      nestedSelector = this.settings.nestedItemSelector
        ? "." + this.settings.nestedItemSelector
        : undefined;
      width = this.$element.children(nestedSelector).width();

      if (imgs.length && width <= 0) {
        this.preloadAutoWidthImages(imgs);
      }
    }

    this.$element.addClass(this.options.loadingClass);

    // create stage
    this.$stage = $(
      "<" +
        this.settings.stageElement +
        ' class="' +
        this.settings.stageClass +
        '"/>'
    ).wrap('<div class="' + this.settings.stageOuterClass + '"/>');

    // append stage
    this.$element.append(this.$stage.parent());

    // append content
    this.replace(this.$element.children().not(this.$stage.parent()));

    // check visibility
    if (this.$element.is(":visible")) {
      // update view
      this.refresh();
    } else {
      // invalidate width
      this.invalidate("width");
    }

    this.$element
      .removeClass(this.options.loadingClass)
      .addClass(this.options.loadedClass);

    // register event handlers
    this.registerEventHandlers();

    this.leave("initializing");
    this.trigger("initialized");
  };

  /**
   * Setups the current settings.
   * @todo Remove responsive classes. Why should adaptive designs be brought into IE8?
   * @todo Support for media queries by using `matchMedia` would be nice.
   * @public
   */
  Owl.prototype.setup = function () {
    var viewport = this.viewport(),
      overwrites = this.options.responsive,
      match = -1,
      settings = null;

    if (!overwrites) {
      settings = $.extend({}, this.options);
    } else {
      $.each(overwrites, function (breakpoint) {
        if (breakpoint <= viewport && breakpoint > match) {
          match = Number(breakpoint);
        }
      });

      settings = $.extend({}, this.options, overwrites[match]);
      if (typeof settings.stagePadding === "function") {
        settings.stagePadding = settings.stagePadding();
      }
      delete settings.responsive;

      // responsive class
      if (settings.responsiveClass) {
        this.$element.attr(
          "class",
          this.$element
            .attr("class")
            .replace(
              new RegExp("(" + this.options.responsiveClass + "-)\\S+\\s", "g"),
              "$1" + match
            )
        );
      }
    }

    this.trigger("change", { property: { name: "settings", value: settings } });
    this._breakpoint = match;
    this.settings = settings;
    this.invalidate("settings");
    this.trigger("changed", {
      property: { name: "settings", value: this.settings },
    });
  };

  /**
   * Updates option logic if necessery.
   * @protected
   */
  Owl.prototype.optionsLogic = function () {
    if (this.settings.autoWidth) {
      this.settings.stagePadding = false;
      this.settings.merge = false;
    }
  };

  /**
   * Prepares an item before add.
   * @todo Rename event parameter `content` to `item`.
   * @protected
   * @returns {jQuery|HTMLElement} - The item container.
   */
  Owl.prototype.prepare = function (item) {
    var event = this.trigger("prepare", { content: item });

    if (!event.data) {
      event.data = $("<" + this.settings.itemElement + "/>")
        .addClass(this.options.itemClass)
        .append(item);
    }

    this.trigger("prepared", { content: event.data });

    return event.data;
  };

  /**
   * Updates the view.
   * @public
   */
  Owl.prototype.update = function () {
    var i = 0,
      n = this._pipe.length,
      filter = $.proxy(function (p) {
        return this[p];
      }, this._invalidated),
      cache = {};

    while (i < n) {
      if (
        this._invalidated.all ||
        $.grep(this._pipe[i].filter, filter).length > 0
      ) {
        this._pipe[i].run(cache);
      }
      i++;
    }

    this._invalidated = {};

    !this.is("valid") && this.enter("valid");
  };

  /**
   * Gets the width of the view.
   * @public
   * @param {Owl.Width} [dimension=Owl.Width.Default] - The dimension to return.
   * @returns {Number} - The width of the view in pixel.
   */
  Owl.prototype.width = function (dimension) {
    dimension = dimension || Owl.Width.Default;
    switch (dimension) {
      case Owl.Width.Inner:
      case Owl.Width.Outer:
        return this._width;
      default:
        return (
          this._width - this.settings.stagePadding * 2 + this.settings.margin
        );
    }
  };

  /**
   * Refreshes the carousel primarily for adaptive purposes.
   * @public
   */
  Owl.prototype.refresh = function () {
    this.enter("refreshing");
    this.trigger("refresh");

    this.setup();

    this.optionsLogic();

    this.$element.addClass(this.options.refreshClass);

    this.update();

    this.$element.removeClass(this.options.refreshClass);

    this.leave("refreshing");
    this.trigger("refreshed");
  };

  /**
   * Checks window `resize` event.
   * @protected
   */
  Owl.prototype.onThrottledResize = function () {
    window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(
      this._handlers.onResize,
      this.settings.responsiveRefreshRate
    );
  };

  /**
   * Checks window `resize` event.
   * @protected
   */
  Owl.prototype.onResize = function () {
    if (!this._items.length) {
      return false;
    }

    if (this._width === this.$element.width()) {
      return false;
    }

    if (!this.$element.is(":visible")) {
      return false;
    }

    this.enter("resizing");

    if (this.trigger("resize").isDefaultPrevented()) {
      this.leave("resizing");
      return false;
    }

    this.invalidate("width");

    this.refresh();

    this.leave("resizing");
    this.trigger("resized");
  };

  /**
   * Registers event handlers.
   * @todo Check `msPointerEnabled`
   * @todo #261
   * @protected
   */
  Owl.prototype.registerEventHandlers = function () {
    if ($.support.transition) {
      this.$stage.on(
        $.support.transition.end + ".owl.core",
        $.proxy(this.onTransitionEnd, this)
      );
    }

    if (this.settings.responsive !== false) {
      this.on(window, "resize", this._handlers.onThrottledResize);
    }

    if (this.settings.mouseDrag) {
      this.$element.addClass(this.options.dragClass);
      this.$stage.on("mousedown.owl.core", $.proxy(this.onDragStart, this));
      this.$stage.on("dragstart.owl.core selectstart.owl.core", function () {
        return false;
      });
    }

    if (this.settings.touchDrag) {
      this.$stage.on("touchstart.owl.core", $.proxy(this.onDragStart, this));
      this.$stage.on("touchcancel.owl.core", $.proxy(this.onDragEnd, this));
    }
  };

  /**
   * Handles `touchstart` and `mousedown` events.
   * @todo Horizontal swipe threshold as option
   * @todo #261
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragStart = function (event) {
    var stage = null;

    if (event.which === 3) {
      return;
    }

    if ($.support.transform) {
      stage = this.$stage
        .css("transform")
        .replace(/.*\(|\)| /g, "")
        .split(",");
      stage = {
        x: stage[stage.length === 16 ? 12 : 4],
        y: stage[stage.length === 16 ? 13 : 5],
      };
    } else {
      stage = this.$stage.position();
      stage = {
        x: this.settings.rtl
          ? stage.left +
            this.$stage.width() -
            this.width() +
            this.settings.margin
          : stage.left,
        y: stage.top,
      };
    }

    if (this.is("animating")) {
      $.support.transform ? this.animate(stage.x) : this.$stage.stop();
      this.invalidate("position");
    }

    this.$element.toggleClass(
      this.options.grabClass,
      event.type === "mousedown"
    );

    this.speed(0);

    this._drag.time = new Date().getTime();
    this._drag.target = $(event.target);
    this._drag.stage.start = stage;
    this._drag.stage.current = stage;
    this._drag.pointer = this.pointer(event);

    $(document).on(
      "mouseup.owl.core touchend.owl.core",
      $.proxy(this.onDragEnd, this)
    );

    $(document).one(
      "mousemove.owl.core touchmove.owl.core",
      $.proxy(function (event) {
        var delta = this.difference(this._drag.pointer, this.pointer(event));

        $(document).on(
          "mousemove.owl.core touchmove.owl.core",
          $.proxy(this.onDragMove, this)
        );

        if (Math.abs(delta.x) < Math.abs(delta.y) && this.is("valid")) {
          return;
        }

        event.preventDefault();

        this.enter("dragging");
        this.trigger("drag");
      }, this)
    );
  };

  /**
   * Handles the `touchmove` and `mousemove` events.
   * @todo #261
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragMove = function (event) {
    var minimum = null,
      maximum = null,
      pull = null,
      delta = this.difference(this._drag.pointer, this.pointer(event)),
      stage = this.difference(this._drag.stage.start, delta);

    if (!this.is("dragging")) {
      return;
    }

    event.preventDefault();

    if (this.settings.loop) {
      minimum = this.coordinates(this.minimum());
      maximum = this.coordinates(this.maximum() + 1) - minimum;
      stage.x =
        ((((stage.x - minimum) % maximum) + maximum) % maximum) + minimum;
    } else {
      minimum = this.settings.rtl
        ? this.coordinates(this.maximum())
        : this.coordinates(this.minimum());
      maximum = this.settings.rtl
        ? this.coordinates(this.minimum())
        : this.coordinates(this.maximum());
      pull = this.settings.pullDrag ? (-1 * delta.x) / 5 : 0;
      stage.x = Math.max(Math.min(stage.x, minimum + pull), maximum + pull);
    }

    this._drag.stage.current = stage;

    this.animate(stage.x);
  };

  /**
   * Handles the `touchend` and `mouseup` events.
   * @todo #261
   * @todo Threshold for click event
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onDragEnd = function (event) {
    var delta = this.difference(this._drag.pointer, this.pointer(event)),
      stage = this._drag.stage.current,
      direction = (delta.x > 0) ^ this.settings.rtl ? "left" : "right";

    $(document).off(".owl.core");

    this.$element.removeClass(this.options.grabClass);

    if ((delta.x !== 0 && this.is("dragging")) || !this.is("valid")) {
      this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed);
      this.current(
        this.closest(stage.x, delta.x !== 0 ? direction : this._drag.direction)
      );
      this.invalidate("position");
      this.update();

      this._drag.direction = direction;

      if (
        Math.abs(delta.x) > 3 ||
        new Date().getTime() - this._drag.time > 300
      ) {
        this._drag.target.one("click.owl.core", function () {
          return false;
        });
      }
    }

    if (!this.is("dragging")) {
      return;
    }

    this.leave("dragging");
    this.trigger("dragged");
  };

  /**
   * Gets absolute position of the closest item for a coordinate.
   * @todo Setting `freeDrag` makes `closest` not reusable. See #165.
   * @protected
   * @param {Number} coordinate - The coordinate in pixel.
   * @param {String} direction - The direction to check for the closest item. Ether `left` or `right`.
   * @return {Number} - The absolute position of the closest item.
   */
  Owl.prototype.closest = function (coordinate, direction) {
    var position = -1,
      pull = 30,
      width = this.width(),
      coordinates = this.coordinates();

    if (!this.settings.freeDrag) {
      // check closest item
      $.each(
        coordinates,
        $.proxy(function (index, value) {
          // on a left pull, check on current index
          if (
            direction === "left" &&
            coordinate > value - pull &&
            coordinate < value + pull
          ) {
            position = index;
            // on a right pull, check on previous index
            // to do so, subtract width from value and set position = index + 1
          } else if (
            direction === "right" &&
            coordinate > value - width - pull &&
            coordinate < value - width + pull
          ) {
            position = index + 1;
          } else if (
            this.op(coordinate, "<", value) &&
            this.op(coordinate, ">", coordinates[index + 1] || value - width)
          ) {
            position = direction === "left" ? index + 1 : index;
          }
          return position === -1;
        }, this)
      );
    }

    if (!this.settings.loop) {
      // non loop boundries
      if (this.op(coordinate, ">", coordinates[this.minimum()])) {
        position = coordinate = this.minimum();
      } else if (this.op(coordinate, "<", coordinates[this.maximum()])) {
        position = coordinate = this.maximum();
      }
    }

    return position;
  };

  /**
   * Animates the stage.
   * @todo #270
   * @public
   * @param {Number} coordinate - The coordinate in pixels.
   */
  Owl.prototype.animate = function (coordinate) {
    var animate = this.speed() > 0;

    this.is("animating") && this.onTransitionEnd();

    if (animate) {
      this.enter("animating");
      this.trigger("translate");
    }

    if ($.support.transform3d && $.support.transition) {
      this.$stage.css({
        transform: "translate3d(" + coordinate + "px,0px,0px)",
        transition: this.speed() / 1000 + "s",
      });
    } else if (animate) {
      this.$stage.animate(
        {
          left: coordinate + "px",
        },
        this.speed(),
        this.settings.fallbackEasing,
        $.proxy(this.onTransitionEnd, this)
      );
    } else {
      this.$stage.css({
        left: coordinate + "px",
      });
    }
  };

  /**
   * Checks whether the carousel is in a specific state or not.
   * @param {String} state - The state to check.
   * @returns {Boolean} - The flag which indicates if the carousel is busy.
   */
  Owl.prototype.is = function (state) {
    return this._states.current[state] && this._states.current[state] > 0;
  };

  /**
   * Sets the absolute position of the current item.
   * @public
   * @param {Number} [position] - The new absolute position or nothing to leave it unchanged.
   * @returns {Number} - The absolute position of the current item.
   */
  Owl.prototype.current = function (position) {
    if (position === undefined) {
      return this._current;
    }

    if (this._items.length === 0) {
      return undefined;
    }

    position = this.normalize(position);

    if (this._current !== position) {
      var event = this.trigger("change", {
        property: { name: "position", value: position },
      });

      if (event.data !== undefined) {
        position = this.normalize(event.data);
      }

      this._current = position;

      this.invalidate("position");

      this.trigger("changed", {
        property: { name: "position", value: this._current },
      });
    }

    return this._current;
  };

  /**
   * Invalidates the given part of the update routine.
   * @param {String} [part] - The part to invalidate.
   * @returns {Array.<String>} - The invalidated parts.
   */
  Owl.prototype.invalidate = function (part) {
    if ($.type(part) === "string") {
      this._invalidated[part] = true;
      this.is("valid") && this.leave("valid");
    }
    return $.map(this._invalidated, function (v, i) {
      return i;
    });
  };

  /**
   * Resets the absolute position of the current item.
   * @public
   * @param {Number} position - The absolute position of the new item.
   */
  Owl.prototype.reset = function (position) {
    position = this.normalize(position);

    if (position === undefined) {
      return;
    }

    this._speed = 0;
    this._current = position;

    this.suppress(["translate", "translated"]);

    this.animate(this.coordinates(position));

    this.release(["translate", "translated"]);
  };

  /**
   * Normalizes an absolute or a relative position of an item.
   * @public
   * @param {Number} position - The absolute or relative position to normalize.
   * @param {Boolean} [relative=false] - Whether the given position is relative or not.
   * @returns {Number} - The normalized position.
   */
  Owl.prototype.normalize = function (position, relative) {
    var n = this._items.length,
      m = relative ? 0 : this._clones.length;

    if (!this.isNumeric(position) || n < 1) {
      position = undefined;
    } else if (position < 0 || position >= n + m) {
      position = ((((position - m / 2) % n) + n) % n) + m / 2;
    }

    return position;
  };

  /**
   * Converts an absolute position of an item into a relative one.
   * @public
   * @param {Number} position - The absolute position to convert.
   * @returns {Number} - The converted position.
   */
  Owl.prototype.relative = function (position) {
    position -= this._clones.length / 2;
    return this.normalize(position, true);
  };

  /**
   * Gets the maximum position for the current item.
   * @public
   * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
   * @returns {Number}
   */
  Owl.prototype.maximum = function (relative) {
    var settings = this.settings,
      maximum = this._coordinates.length,
      iterator,
      reciprocalItemsWidth,
      elementWidth;

    if (settings.loop) {
      maximum = this._clones.length / 2 + this._items.length - 1;
    } else if (settings.autoWidth || settings.merge) {
      iterator = this._items.length;
      reciprocalItemsWidth = this._items[--iterator].width();
      elementWidth = this.$element.width();
      while (iterator--) {
        reciprocalItemsWidth +=
          this._items[iterator].width() + this.settings.margin;
        if (reciprocalItemsWidth > elementWidth) {
          break;
        }
      }
      maximum = iterator + 1;
    } else if (settings.center) {
      maximum = this._items.length - 1;
    } else {
      maximum = this._items.length - settings.items;
    }

    if (relative) {
      maximum -= this._clones.length / 2;
    }

    return Math.max(maximum, 0);
  };

  /**
   * Gets the minimum position for the current item.
   * @public
   * @param {Boolean} [relative=false] - Whether to return an absolute position or a relative position.
   * @returns {Number}
   */
  Owl.prototype.minimum = function (relative) {
    return relative ? 0 : this._clones.length / 2;
  };

  /**
   * Gets an item at the specified relative position.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
   */
  Owl.prototype.items = function (position) {
    if (position === undefined) {
      return this._items.slice();
    }

    position = this.normalize(position, true);
    return this._items[position];
  };

  /**
   * Gets an item at the specified relative position.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @return {jQuery|Array.<jQuery>} - The item at the given position or all items if no position was given.
   */
  Owl.prototype.mergers = function (position) {
    if (position === undefined) {
      return this._mergers.slice();
    }

    position = this.normalize(position, true);
    return this._mergers[position];
  };

  /**
   * Gets the absolute positions of clones for an item.
   * @public
   * @param {Number} [position] - The relative position of the item.
   * @returns {Array.<Number>} - The absolute positions of clones for the item or all if no position was given.
   */
  Owl.prototype.clones = function (position) {
    var odd = this._clones.length / 2,
      even = odd + this._items.length,
      map = function (index) {
        return index % 2 === 0 ? even + index / 2 : odd - (index + 1) / 2;
      };

    if (position === undefined) {
      return $.map(this._clones, function (v, i) {
        return map(i);
      });
    }

    return $.map(this._clones, function (v, i) {
      return v === position ? map(i) : null;
    });
  };

  /**
   * Sets the current animation speed.
   * @public
   * @param {Number} [speed] - The animation speed in milliseconds or nothing to leave it unchanged.
   * @returns {Number} - The current animation speed in milliseconds.
   */
  Owl.prototype.speed = function (speed) {
    if (speed !== undefined) {
      this._speed = speed;
    }

    return this._speed;
  };

  /**
   * Gets the coordinate of an item.
   * @todo The name of this method is missleanding.
   * @public
   * @param {Number} position - The absolute position of the item within `minimum()` and `maximum()`.
   * @returns {Number|Array.<Number>} - The coordinate of the item in pixel or all coordinates.
   */
  Owl.prototype.coordinates = function (position) {
    var multiplier = 1,
      newPosition = position - 1,
      coordinate;

    if (position === undefined) {
      return $.map(
        this._coordinates,
        $.proxy(function (coordinate, index) {
          return this.coordinates(index);
        }, this)
      );
    }

    if (this.settings.center) {
      if (this.settings.rtl) {
        multiplier = -1;
        newPosition = position + 1;
      }

      coordinate = this._coordinates[position];
      coordinate +=
        ((this.width() - coordinate + (this._coordinates[newPosition] || 0)) /
          2) *
        multiplier;
    } else {
      coordinate = this._coordinates[newPosition] || 0;
    }

    coordinate = Math.ceil(coordinate);

    return coordinate;
  };

  /**
   * Calculates the speed for a translation.
   * @protected
   * @param {Number} from - The absolute position of the start item.
   * @param {Number} to - The absolute position of the target item.
   * @param {Number} [factor=undefined] - The time factor in milliseconds.
   * @returns {Number} - The time in milliseconds for the translation.
   */
  Owl.prototype.duration = function (from, to, factor) {
    if (factor === 0) {
      return 0;
    }

    return (
      Math.min(Math.max(Math.abs(to - from), 1), 6) *
      Math.abs(factor || this.settings.smartSpeed)
    );
  };

  /**
   * Slides to the specified item.
   * @public
   * @param {Number} position - The position of the item.
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.to = function (position, speed) {
    var current = this.current(),
      revert = null,
      distance = position - this.relative(current),
      direction = (distance > 0) - (distance < 0),
      items = this._items.length,
      minimum = this.minimum(),
      maximum = this.maximum();

    if (this.settings.loop) {
      if (!this.settings.rewind && Math.abs(distance) > items / 2) {
        distance += direction * -1 * items;
      }

      position = current + distance;
      revert = ((((position - minimum) % items) + items) % items) + minimum;

      if (
        revert !== position &&
        revert - distance <= maximum &&
        revert - distance > 0
      ) {
        current = revert - distance;
        position = revert;
        this.reset(current);
      }
    } else if (this.settings.rewind) {
      maximum += 1;
      position = ((position % maximum) + maximum) % maximum;
    } else {
      position = Math.max(minimum, Math.min(maximum, position));
    }

    this.speed(this.duration(current, position, speed));
    this.current(position);

    if (this.$element.is(":visible")) {
      this.update();
    }
  };

  /**
   * Slides to the next item.
   * @public
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.next = function (speed) {
    speed = speed || false;
    this.to(this.relative(this.current()) + 1, speed);
  };

  /**
   * Slides to the previous item.
   * @public
   * @param {Number} [speed] - The time in milliseconds for the transition.
   */
  Owl.prototype.prev = function (speed) {
    speed = speed || false;
    this.to(this.relative(this.current()) - 1, speed);
  };

  /**
   * Handles the end of an animation.
   * @protected
   * @param {Event} event - The event arguments.
   */
  Owl.prototype.onTransitionEnd = function (event) {
    // if css2 animation then event object is undefined
    if (event !== undefined) {
      event.stopPropagation();

      // Catch only owl-stage transitionEnd event
      if (
        (event.target || event.srcElement || event.originalTarget) !==
        this.$stage.get(0)
      ) {
        return false;
      }
    }

    this.leave("animating");
    this.trigger("translated");
  };

  /**
   * Gets viewport width.
   * @protected
   * @return {Number} - The width in pixel.
   */
  Owl.prototype.viewport = function () {
    var width;
    if (this.options.responsiveBaseElement !== window) {
      width = $(this.options.responsiveBaseElement).width();
    } else if (window.innerWidth) {
      width = window.innerWidth;
    } else if (
      document.documentElement &&
      document.documentElement.clientWidth
    ) {
      width = document.documentElement.clientWidth;
    } else {
      console.warn("Can not detect viewport width.");
    }
    return width;
  };

  /**
   * Replaces the current content.
   * @public
   * @param {HTMLElement|jQuery|String} content - The new content.
   */
  Owl.prototype.replace = function (content) {
    this.$stage.empty();
    this._items = [];

    if (content) {
      content = content instanceof jQuery ? content : $(content);
    }

    if (this.settings.nestedItemSelector) {
      content = content.find("." + this.settings.nestedItemSelector);
    }

    content
      .filter(function () {
        return this.nodeType === 1;
      })
      .each(
        $.proxy(function (index, item) {
          item = this.prepare(item);
          this.$stage.append(item);
          this._items.push(item);
          this._mergers.push(
            item
              .find("[data-merge]")
              .addBack("[data-merge]")
              .attr("data-merge") * 1 || 1
          );
        }, this)
      );

    this.reset(
      this.isNumeric(this.settings.startPosition)
        ? this.settings.startPosition
        : 0
    );

    this.invalidate("items");
  };

  /**
   * Adds an item.
   * @todo Use `item` instead of `content` for the event arguments.
   * @public
   * @param {HTMLElement|jQuery|String} content - The item content to add.
   * @param {Number} [position] - The relative position at which to insert the item otherwise the item will be added to the end.
   */
  Owl.prototype.add = function (content, position) {
    var current = this.relative(this._current);

    position =
      position === undefined
        ? this._items.length
        : this.normalize(position, true);
    content = content instanceof jQuery ? content : $(content);

    this.trigger("add", { content: content, position: position });

    content = this.prepare(content);

    if (this._items.length === 0 || position === this._items.length) {
      this._items.length === 0 && this.$stage.append(content);
      this._items.length !== 0 && this._items[position - 1].after(content);
      this._items.push(content);
      this._mergers.push(
        content
          .find("[data-merge]")
          .addBack("[data-merge]")
          .attr("data-merge") * 1 || 1
      );
    } else {
      this._items[position].before(content);
      this._items.splice(position, 0, content);
      this._mergers.splice(
        position,
        0,
        content
          .find("[data-merge]")
          .addBack("[data-merge]")
          .attr("data-merge") * 1 || 1
      );
    }

    this._items[current] && this.reset(this._items[current].index());

    this.invalidate("items");

    this.trigger("added", { content: content, position: position });
  };

  /**
   * Removes an item by its position.
   * @todo Use `item` instead of `content` for the event arguments.
   * @public
   * @param {Number} position - The relative position of the item to remove.
   */
  Owl.prototype.remove = function (position) {
    position = this.normalize(position, true);

    if (position === undefined) {
      return;
    }

    this.trigger("remove", {
      content: this._items[position],
      position: position,
    });

    this._items[position].remove();
    this._items.splice(position, 1);
    this._mergers.splice(position, 1);

    this.invalidate("items");

    this.trigger("removed", { content: null, position: position });
  };

  /**
   * Preloads images with auto width.
   * @todo Replace by a more generic approach
   * @protected
   */
  Owl.prototype.preloadAutoWidthImages = function (images) {
    images.each(
      $.proxy(function (i, element) {
        this.enter("pre-loading");
        element = $(element);
        $(new Image())
          .one(
            "load",
            $.proxy(function (e) {
              element.attr("src", e.target.src);
              element.css("opacity", 1);
              this.leave("pre-loading");
              !this.is("pre-loading") &&
                !this.is("initializing") &&
                this.refresh();
            }, this)
          )
          .attr(
            "src",
            element.attr("src") ||
              element.attr("data-src") ||
              element.attr("data-src-retina")
          );
      }, this)
    );
  };

  /**
   * Destroys the carousel.
   * @public
   */
  Owl.prototype.destroy = function () {
    this.$element.off(".owl.core");
    this.$stage.off(".owl.core");
    $(document).off(".owl.core");

    if (this.settings.responsive !== false) {
      window.clearTimeout(this.resizeTimer);
      this.off(window, "resize", this._handlers.onThrottledResize);
    }

    for (var i in this._plugins) {
      this._plugins[i].destroy();
    }

    this.$stage.children(".cloned").remove();

    this.$stage.unwrap();
    this.$stage.children().contents().unwrap();
    this.$stage.children().unwrap();

    this.$element
      .removeClass(this.options.refreshClass)
      .removeClass(this.options.loadingClass)
      .removeClass(this.options.loadedClass)
      .removeClass(this.options.rtlClass)
      .removeClass(this.options.dragClass)
      .removeClass(this.options.grabClass)
      .attr(
        "class",
        this.$element
          .attr("class")
          .replace(
            new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"),
            ""
          )
      )
      .removeData("owl.carousel");
  };

  /**
   * Operators to calculate right-to-left and left-to-right.
   * @protected
   * @param {Number} [a] - The left side operand.
   * @param {String} [o] - The operator.
   * @param {Number} [b] - The right side operand.
   */
  Owl.prototype.op = function (a, o, b) {
    var rtl = this.settings.rtl;
    switch (o) {
      case "<":
        return rtl ? a > b : a < b;
      case ">":
        return rtl ? a < b : a > b;
      case ">=":
        return rtl ? a <= b : a >= b;
      case "<=":
        return rtl ? a >= b : a <= b;
      default:
        break;
    }
  };

  /**
   * Attaches to an internal event.
   * @protected
   * @param {HTMLElement} element - The event source.
   * @param {String} event - The event name.
   * @param {Function} listener - The event handler to attach.
   * @param {Boolean} capture - Wether the event should be handled at the capturing phase or not.
   */
  Owl.prototype.on = function (element, event, listener, capture) {
    if (element.addEventListener) {
      element.addEventListener(event, listener, capture);
    } else if (element.attachEvent) {
      element.attachEvent("on" + event, listener);
    }
  };

  /**
   * Detaches from an internal event.
   * @protected
   * @param {HTMLElement} element - The event source.
   * @param {String} event - The event name.
   * @param {Function} listener - The attached event handler to detach.
   * @param {Boolean} capture - Wether the attached event handler was registered as a capturing listener or not.
   */
  Owl.prototype.off = function (element, event, listener, capture) {
    if (element.removeEventListener) {
      element.removeEventListener(event, listener, capture);
    } else if (element.detachEvent) {
      element.detachEvent("on" + event, listener);
    }
  };

  /**
   * Triggers a public event.
   * @todo Remove `status`, `relatedTarget` should be used instead.
   * @protected
   * @param {String} name - The event name.
   * @param {*} [data=null] - The event data.
   * @param {String} [namespace=carousel] - The event namespace.
   * @param {String} [state] - The state which is associated with the event.
   * @param {Boolean} [enter=false] - Indicates if the call enters the specified state or not.
   * @returns {Event} - The event arguments.
   */
  Owl.prototype.trigger = function (name, data, namespace, state, enter) {
    var status = {
        item: { count: this._items.length, index: this.current() },
      },
      handler = $.camelCase(
        $.grep(["on", name, namespace], function (v) {
          return v;
        })
          .join("-")
          .toLowerCase()
      ),
      event = $.Event(
        [name, "owl", namespace || "carousel"].join(".").toLowerCase(),
        $.extend({ relatedTarget: this }, status, data)
      );

    if (!this._supress[name]) {
      $.each(this._plugins, function (name, plugin) {
        if (plugin.onTrigger) {
          plugin.onTrigger(event);
        }
      });

      this.register({ type: Owl.Type.Event, name: name });
      this.$element.trigger(event);

      if (this.settings && typeof this.settings[handler] === "function") {
        this.settings[handler].call(this, event);
      }
    }

    return event;
  };

  /**
   * Enters a state.
   * @param name - The state name.
   */
  Owl.prototype.enter = function (name) {
    $.each(
      [name].concat(this._states.tags[name] || []),
      $.proxy(function (i, name) {
        if (this._states.current[name] === undefined) {
          this._states.current[name] = 0;
        }

        this._states.current[name]++;
      }, this)
    );
  };

  /**
   * Leaves a state.
   * @param name - The state name.
   */
  Owl.prototype.leave = function (name) {
    $.each(
      [name].concat(this._states.tags[name] || []),
      $.proxy(function (i, name) {
        this._states.current[name]--;
      }, this)
    );
  };

  /**
   * Registers an event or state.
   * @public
   * @param {Object} object - The event or state to register.
   */
  Owl.prototype.register = function (object) {
    if (object.type === Owl.Type.Event) {
      if (!$.event.special[object.name]) {
        $.event.special[object.name] = {};
      }

      if (!$.event.special[object.name].owl) {
        var _default = $.event.special[object.name]._default;
        $.event.special[object.name]._default = function (e) {
          if (
            _default &&
            _default.apply &&
            (!e.namespace || e.namespace.indexOf("owl") === -1)
          ) {
            return _default.apply(this, arguments);
          }
          return e.namespace && e.namespace.indexOf("owl") > -1;
        };
        $.event.special[object.name].owl = true;
      }
    } else if (object.type === Owl.Type.State) {
      if (!this._states.tags[object.name]) {
        this._states.tags[object.name] = object.tags;
      } else {
        this._states.tags[object.name] = this._states.tags[object.name].concat(
          object.tags
        );
      }

      this._states.tags[object.name] = $.grep(
        this._states.tags[object.name],
        $.proxy(function (tag, i) {
          return $.inArray(tag, this._states.tags[object.name]) === i;
        }, this)
      );
    }
  };

  /**
   * Suppresses events.
   * @protected
   * @param {Array.<String>} events - The events to suppress.
   */
  Owl.prototype.suppress = function (events) {
    $.each(
      events,
      $.proxy(function (index, event) {
        this._supress[event] = true;
      }, this)
    );
  };

  /**
   * Releases suppressed events.
   * @protected
   * @param {Array.<String>} events - The events to release.
   */
  Owl.prototype.release = function (events) {
    $.each(
      events,
      $.proxy(function (index, event) {
        delete this._supress[event];
      }, this)
    );
  };

  /**
   * Gets unified pointer coordinates from event.
   * @todo #261
   * @protected
   * @param {Event} - The `mousedown` or `touchstart` event.
   * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
   */
  Owl.prototype.pointer = function (event) {
    var result = { x: null, y: null };

    event = event.originalEvent || event || window.event;

    event =
      event.touches && event.touches.length
        ? event.touches[0]
        : event.changedTouches && event.changedTouches.length
        ? event.changedTouches[0]
        : event;

    if (event.pageX) {
      result.x = event.pageX;
      result.y = event.pageY;
    } else {
      result.x = event.clientX;
      result.y = event.clientY;
    }

    return result;
  };

  /**
   * Determines if the input is a Number or something that can be coerced to a Number
   * @protected
   * @param {Number|String|Object|Array|Boolean|RegExp|Function|Symbol} - The input to be tested
   * @returns {Boolean} - An indication if the input is a Number or can be coerced to a Number
   */
  Owl.prototype.isNumeric = function (number) {
    return !isNaN(parseFloat(number));
  };

  /**
   * Gets the difference of two vectors.
   * @todo #261
   * @protected
   * @param {Object} - The first vector.
   * @param {Object} - The second vector.
   * @returns {Object} - The difference.
   */
  Owl.prototype.difference = function (first, second) {
    return {
      x: first.x - second.x,
      y: first.y - second.y,
    };
  };

  /**
   * The jQuery Plugin for the Owl Carousel
   * @todo Navigation plugin `next` and `prev`
   * @public
   */
  $.fn.owlCarousel = function (option) {
    var args = Array.prototype.slice.call(arguments, 1);

    return this.each(function () {
      var $this = $(this),
        data = $this.data("owl.carousel");

      if (!data) {
        data = new Owl(this, typeof option == "object" && option);
        $this.data("owl.carousel", data);

        $.each(
          [
            "next",
            "prev",
            "to",
            "destroy",
            "refresh",
            "replace",
            "add",
            "remove",
          ],
          function (i, event) {
            data.register({ type: Owl.Type.Event, name: event });
            data.$element.on(
              event + ".owl.carousel.core",
              $.proxy(function (e) {
                if (e.namespace && e.relatedTarget !== this) {
                  this.suppress([event]);
                  data[event].apply(this, [].slice.call(arguments, 1));
                  this.release([event]);
                }
              }, data)
            );
          }
        );
      }

      if (typeof option == "string" && option.charAt(0) !== "_") {
        data[option].apply(data, args);
      }
    });
  };

  /**
   * The constructor for the jQuery Plugin
   * @public
   */
  $.fn.owlCarousel.Constructor = Owl;
})(window.Zepto || window.jQuery, window, document);

/**
 * AutoRefresh Plugin
 * @version 2.1.0
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  /**
   * Creates the auto refresh plugin.
   * @class The Auto Refresh Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var AutoRefresh = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Refresh interval.
     * @protected
     * @type {number}
     */
    this._interval = null;

    /**
     * Whether the element is currently visible or not.
     * @protected
     * @type {Boolean}
     */
    this._visible = null;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "initialized.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.autoRefresh) {
          this.watch();
        }
      }, this),
    };

    // set default options
    this._core.options = $.extend({}, AutoRefresh.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  AutoRefresh.Defaults = {
    autoRefresh: true,
    autoRefreshInterval: 500,
  };

  /**
   * Watches the element.
   */
  AutoRefresh.prototype.watch = function () {
    if (this._interval) {
      return;
    }

    this._visible = this._core.$element.is(":visible");
    this._interval = window.setInterval(
      $.proxy(this.refresh, this),
      this._core.settings.autoRefreshInterval
    );
  };

  /**
   * Refreshes the element.
   */
  AutoRefresh.prototype.refresh = function () {
    if (this._core.$element.is(":visible") === this._visible) {
      return;
    }

    this._visible = !this._visible;

    this._core.$element.toggleClass("owl-hidden", !this._visible);

    this._visible && this._core.invalidate("width") && this._core.refresh();
  };

  /**
   * Destroys the plugin.
   */
  AutoRefresh.prototype.destroy = function () {
    var handler, property;

    window.clearInterval(this._interval);

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.AutoRefresh = AutoRefresh;
})(window.Zepto || window.jQuery, window, document);

/**
 * Lazy Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  /**
   * Creates the lazy plugin.
   * @class The Lazy Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Lazy = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Already loaded items.
     * @protected
     * @type {Array.<jQuery>}
     */
    this._loaded = [];

    /**
     * Event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "initialized.owl.carousel change.owl.carousel resized.owl.carousel":
        $.proxy(function (e) {
          if (!e.namespace) {
            return;
          }

          if (!this._core.settings || !this._core.settings.lazyLoad) {
            return;
          }

          if (
            (e.property && e.property.name == "position") ||
            e.type == "initialized"
          ) {
            var settings = this._core.settings,
              n =
                (settings.center && Math.ceil(settings.items / 2)) ||
                settings.items,
              i = (settings.center && n * -1) || 0,
              position =
                (e.property && e.property.value !== undefined
                  ? e.property.value
                  : this._core.current()) + i,
              clones = this._core.clones().length,
              load = $.proxy(function (i, v) {
                this.load(v);
              }, this);

            while (i++ < n) {
              this.load(clones / 2 + this._core.relative(position));
              clones &&
                $.each(this._core.clones(this._core.relative(position)), load);
              position++;
            }
          }
        }, this),
    };

    // set the default options
    this._core.options = $.extend({}, Lazy.Defaults, this._core.options);

    // register event handler
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  Lazy.Defaults = {
    lazyLoad: false,
  };

  /**
   * Loads all resources of an item at the specified position.
   * @param {Number} position - The absolute position of the item.
   * @protected
   */
  Lazy.prototype.load = function (position) {
    var $item = this._core.$stage.children().eq(position),
      $elements = $item && $item.find(".owl-lazy");

    if (!$elements || $.inArray($item.get(0), this._loaded) > -1) {
      return;
    }

    $elements.each(
      $.proxy(function (index, element) {
        var $element = $(element),
          image,
          url =
            (window.devicePixelRatio > 1 && $element.attr("data-src-retina")) ||
            $element.attr("data-src");

        this._core.trigger("load", { element: $element, url: url }, "lazy");

        if ($element.is("img")) {
          $element
            .one(
              "load.owl.lazy",
              $.proxy(function () {
                $element.css("opacity", 1);
                this._core.trigger(
                  "loaded",
                  { element: $element, url: url },
                  "lazy"
                );
              }, this)
            )
            .attr("src", url);
        } else {
          image = new Image();
          image.onload = $.proxy(function () {
            $element.css({
              "background-image": 'url("' + url + '")',
              opacity: "1",
            });
            this._core.trigger(
              "loaded",
              { element: $element, url: url },
              "lazy"
            );
          }, this);
          image.src = url;
        }
      }, this)
    );

    this._loaded.push($item.get(0));
  };

  /**
   * Destroys the plugin.
   * @public
   */
  Lazy.prototype.destroy = function () {
    var handler, property;

    for (handler in this.handlers) {
      this._core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Lazy = Lazy;
})(window.Zepto || window.jQuery, window, document);

/**
 * AutoHeight Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  /**
   * Creates the auto height plugin.
   * @class The Auto Height Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var AutoHeight = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "initialized.owl.carousel refreshed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.autoHeight) {
          this.update();
        }
      }, this),
      "changed.owl.carousel": $.proxy(function (e) {
        if (
          e.namespace &&
          this._core.settings.autoHeight &&
          e.property.name == "position"
        ) {
          this.update();
        }
      }, this),
      "loaded.owl.lazy": $.proxy(function (e) {
        if (
          e.namespace &&
          this._core.settings.autoHeight &&
          e.element.closest("." + this._core.settings.itemClass).index() ===
            this._core.current()
        ) {
          this.update();
        }
      }, this),
    };

    // set default options
    this._core.options = $.extend({}, AutoHeight.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   */
  AutoHeight.Defaults = {
    autoHeight: false,
    autoHeightClass: "owl-height",
  };

  /**
   * Updates the view.
   */
  AutoHeight.prototype.update = function () {
    var start = this._core._current,
      end = start + this._core.settings.items,
      visible = this._core.$stage.children().toArray().slice(start, end),
      heights = [],
      maxheight = 0;

    $.each(visible, function (index, item) {
      heights.push($(item).height());
    });

    maxheight = Math.max.apply(null, heights);

    this._core.$stage
      .parent()
      .height(maxheight)
      .addClass(this._core.settings.autoHeightClass);
  };

  AutoHeight.prototype.destroy = function () {
    var handler, property;

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.AutoHeight = AutoHeight;
})(window.Zepto || window.jQuery, window, document);

/**
 * Video Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  /**
   * Creates the video plugin.
   * @class The Video Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Video = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Cache all video URLs.
     * @protected
     * @type {Object}
     */
    this._videos = {};

    /**
     * Current playing item.
     * @protected
     * @type {jQuery}
     */
    this._playing = null;

    /**
     * All event handlers.
     * @todo The cloned content removale is too late
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "initialized.owl.carousel": $.proxy(function (e) {
        if (e.namespace) {
          this._core.register({
            type: "state",
            name: "playing",
            tags: ["interacting"],
          });
        }
      }, this),
      "resize.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.video && this.isInFullScreen()) {
          e.preventDefault();
        }
      }, this),
      "refreshed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.is("resizing")) {
          this._core.$stage.find(".cloned .owl-video-frame").remove();
        }
      }, this),
      "changed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && e.property.name === "position" && this._playing) {
          this.stop();
        }
      }, this),
      "prepared.owl.carousel": $.proxy(function (e) {
        if (!e.namespace) {
          return;
        }

        var $element = $(e.content).find(".owl-video");

        if ($element.length) {
          $element.css("display", "none");
          this.fetch($element, $(e.content));
        }
      }, this),
    };

    // set default options
    this._core.options = $.extend({}, Video.Defaults, this._core.options);

    // register event handlers
    this._core.$element.on(this._handlers);

    this._core.$element.on(
      "click.owl.video",
      ".owl-video-play-icon",
      $.proxy(function (e) {
        this.play(e);
      }, this)
    );
  };

  /**
   * Default options.
   * @public
   */
  Video.Defaults = {
    video: false,
    videoHeight: false,
    videoWidth: false,
  };

  /**
   * Gets the video ID and the type (YouTube/Vimeo/vzaar only).
   * @protected
   * @param {jQuery} target - The target containing the video data.
   * @param {jQuery} item - The item containing the video.
   */
  Video.prototype.fetch = function (target, item) {
    var type = (function () {
        if (target.attr("data-vimeo-id")) {
          return "vimeo";
        } else if (target.attr("data-vzaar-id")) {
          return "vzaar";
        } else {
          return "youtube";
        }
      })(),
      id =
        target.attr("data-vimeo-id") ||
        target.attr("data-youtube-id") ||
        target.attr("data-vzaar-id"),
      width = target.attr("data-width") || this._core.settings.videoWidth,
      height = target.attr("data-height") || this._core.settings.videoHeight,
      url = target.attr("href");

    if (url) {
      /*
					Parses the id's out of the following urls (and probably more):
					https://www.youtube.com/watch?v=:id
					https://youtu.be/:id
					https://vimeo.com/:id
					https://vimeo.com/channels/:channel/:id
					https://vimeo.com/groups/:group/videos/:id
					https://app.vzaar.com/videos/:id

					Visual example: https://regexper.com/#(http%3A%7Chttps%3A%7C)%5C%2F%5C%2F(player.%7Cwww.%7Capp.)%3F(vimeo%5C.com%7Cyoutu(be%5C.com%7C%5C.be%7Cbe%5C.googleapis%5C.com)%7Cvzaar%5C.com)%5C%2F(video%5C%2F%7Cvideos%5C%2F%7Cembed%5C%2F%7Cchannels%5C%2F.%2B%5C%2F%7Cgroups%5C%2F.%2B%5C%2F%7Cwatch%5C%3Fv%3D%7Cv%5C%2F)%3F(%5BA-Za-z0-9._%25-%5D*)(%5C%26%5CS%2B)%3F
			*/

      id = url.match(
        /(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/
      );

      if (id[3].indexOf("youtu") > -1) {
        type = "youtube";
      } else if (id[3].indexOf("vimeo") > -1) {
        type = "vimeo";
      } else if (id[3].indexOf("vzaar") > -1) {
        type = "vzaar";
      } else {
        throw new Error("Video URL not supported.");
      }
      id = id[6];
    } else {
      throw new Error("Missing video URL.");
    }

    this._videos[url] = {
      type: type,
      id: id,
      width: width,
      height: height,
    };

    item.attr("data-video", url);

    this.thumbnail(target, this._videos[url]);
  };

  /**
   * Creates video thumbnail.
   * @protected
   * @param {jQuery} target - The target containing the video data.
   * @param {Object} info - The video info object.
   * @see `fetch`
   */
  Video.prototype.thumbnail = function (target, video) {
    var tnLink,
      icon,
      path,
      dimensions =
        video.width && video.height
          ? 'style="width:' + video.width + "px;height:" + video.height + 'px;"'
          : "",
      customTn = target.find("img"),
      srcType = "src",
      lazyClass = "",
      settings = this._core.settings,
      create = function (path) {
        icon = '<div class="owl-video-play-icon"></div>';

        if (settings.lazyLoad) {
          tnLink =
            '<div class="owl-video-tn ' +
            lazyClass +
            '" ' +
            srcType +
            '="' +
            path +
            '"></div>';
        } else {
          tnLink =
            '<div class="owl-video-tn" style="opacity:1;background-image:url(' +
            path +
            ')"></div>';
        }
        target.after(tnLink);
        target.after(icon);
      };

    // wrap video content into owl-video-wrapper div
    target.wrap('<div class="owl-video-wrapper"' + dimensions + "></div>");

    if (this._core.settings.lazyLoad) {
      srcType = "data-src";
      lazyClass = "owl-lazy";
    }

    // custom thumbnail
    if (customTn.length) {
      create(customTn.attr(srcType));
      customTn.remove();
      return false;
    }

    if (video.type === "youtube") {
      path = "//img.youtube.com/vi/" + video.id + "/hqdefault.jpg";
      create(path);
    } else if (video.type === "vimeo") {
      $.ajax({
        type: "GET",
        url: "//vimeo.com/api/v2/video/" + video.id + ".json",
        jsonp: "callback",
        dataType: "jsonp",
        success: function (data) {
          path = data[0].thumbnail_large;
          create(path);
        },
      });
    } else if (video.type === "vzaar") {
      $.ajax({
        type: "GET",
        url: "//vzaar.com/api/videos/" + video.id + ".json",
        jsonp: "callback",
        dataType: "jsonp",
        success: function (data) {
          path = data.framegrab_url;
          create(path);
        },
      });
    }
  };

  /**
   * Stops the current video.
   * @public
   */
  Video.prototype.stop = function () {
    this._core.trigger("stop", null, "video");
    this._playing.find(".owl-video-frame").remove();
    this._playing.removeClass("owl-video-playing");
    this._playing = null;
    this._core.leave("playing");
    this._core.trigger("stopped", null, "video");
  };

  /**
   * Starts the current video.
   * @public
   * @param {Event} event - The event arguments.
   */
  Video.prototype.play = function (event) {
    var target = $(event.target),
      item = target.closest("." + this._core.settings.itemClass),
      video = this._videos[item.attr("data-video")],
      width = video.width || "100%",
      height = video.height || this._core.$stage.height(),
      html;

    if (this._playing) {
      return;
    }

    this._core.enter("playing");
    this._core.trigger("play", null, "video");

    item = this._core.items(this._core.relative(item.index()));

    this._core.reset(item.index());

    if (video.type === "youtube") {
      html =
        '<iframe width="' +
        width +
        '" height="' +
        height +
        '" src="//www.youtube.com/embed/' +
        video.id +
        "?autoplay=1&rel=0&v=" +
        video.id +
        '" frameborder="0" allowfullscreen></iframe>';
    } else if (video.type === "vimeo") {
      html =
        '<iframe src="//player.vimeo.com/video/' +
        video.id +
        '?autoplay=1" width="' +
        width +
        '" height="' +
        height +
        '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
    } else if (video.type === "vzaar") {
      html =
        '<iframe frameborder="0"' +
        'height="' +
        height +
        '"' +
        'width="' +
        width +
        '" allowfullscreen mozallowfullscreen webkitAllowFullScreen ' +
        'src="//view.vzaar.com/' +
        video.id +
        '/player?autoplay=true"></iframe>';
    }

    $('<div class="owl-video-frame">' + html + "</div>").insertAfter(
      item.find(".owl-video")
    );

    this._playing = item.addClass("owl-video-playing");
  };

  /**
   * Checks whether an video is currently in full screen mode or not.
   * @todo Bad style because looks like a readonly method but changes members.
   * @protected
   * @returns {Boolean}
   */
  Video.prototype.isInFullScreen = function () {
    var element =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;

    return element && $(element).parent().hasClass("owl-video-frame");
  };

  /**
   * Destroys the plugin.
   */
  Video.prototype.destroy = function () {
    var handler, property;

    this._core.$element.off("click.owl.video");

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Video = Video;
})(window.Zepto || window.jQuery, window, document);

/**
 * Animate Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  /**
   * Creates the animate plugin.
   * @class The Navigation Plugin
   * @param {Owl} scope - The Owl Carousel
   */
  var Animate = function (scope) {
    this.core = scope;
    this.core.options = $.extend({}, Animate.Defaults, this.core.options);
    this.swapping = true;
    this.previous = undefined;
    this.next = undefined;

    this.handlers = {
      "change.owl.carousel": $.proxy(function (e) {
        if (e.namespace && e.property.name == "position") {
          this.previous = this.core.current();
          this.next = e.property.value;
        }
      }, this),
      "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": $.proxy(
        function (e) {
          if (e.namespace) {
            this.swapping = e.type == "translated";
          }
        },
        this
      ),
      "translate.owl.carousel": $.proxy(function (e) {
        if (
          e.namespace &&
          this.swapping &&
          (this.core.options.animateOut || this.core.options.animateIn)
        ) {
          this.swap();
        }
      }, this),
    };

    this.core.$element.on(this.handlers);
  };

  /**
   * Default options.
   * @public
   */
  Animate.Defaults = {
    animateOut: false,
    animateIn: false,
  };

  /**
   * Toggles the animation classes whenever an translations starts.
   * @protected
   * @returns {Boolean|undefined}
   */
  Animate.prototype.swap = function () {
    if (this.core.settings.items !== 1) {
      return;
    }

    if (!$.support.animation || !$.support.transition) {
      return;
    }

    this.core.speed(0);

    var left,
      clear = $.proxy(this.clear, this),
      previous = this.core.$stage.children().eq(this.previous),
      next = this.core.$stage.children().eq(this.next),
      incoming = this.core.settings.animateIn,
      outgoing = this.core.settings.animateOut;

    if (this.core.current() === this.previous) {
      return;
    }

    if (outgoing) {
      left =
        this.core.coordinates(this.previous) - this.core.coordinates(this.next);
      previous
        .one($.support.animation.end, clear)
        .css({ left: left + "px" })
        .addClass("animated owl-animated-out")
        .addClass(outgoing);
    }

    if (incoming) {
      next
        .one($.support.animation.end, clear)
        .addClass("animated owl-animated-in")
        .addClass(incoming);
    }
  };

  Animate.prototype.clear = function (e) {
    $(e.target)
      .css({ left: "" })
      .removeClass("animated owl-animated-out owl-animated-in")
      .removeClass(this.core.settings.animateIn)
      .removeClass(this.core.settings.animateOut);
    this.core.onTransitionEnd();
  };

  /**
   * Destroys the plugin.
   * @public
   */
  Animate.prototype.destroy = function () {
    var handler, property;

    for (handler in this.handlers) {
      this.core.$element.off(handler, this.handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Animate = Animate;
})(window.Zepto || window.jQuery, window, document);

/**
 * Autoplay Plugin
 * @version 2.1.0
 * @author Bartosz Wojciechowski
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  /**
   * Creates the autoplay plugin.
   * @class The Autoplay Plugin
   * @param {Owl} scope - The Owl Carousel
   */
  var Autoplay = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * The autoplay timeout.
     * @type {Timeout}
     */
    this._timeout = null;

    /**
     * Indicates whenever the autoplay is paused.
     * @type {Boolean}
     */
    this._paused = false;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "changed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && e.property.name === "settings") {
          if (this._core.settings.autoplay) {
            this.play();
          } else {
            this.stop();
          }
        } else if (e.namespace && e.property.name === "position") {
          //console.log('play?', e);
          if (this._core.settings.autoplay) {
            this._setAutoPlayInterval();
          }
        }
      }, this),
      "initialized.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.autoplay) {
          this.play();
        }
      }, this),
      "play.owl.autoplay": $.proxy(function (e, t, s) {
        if (e.namespace) {
          this.play(t, s);
        }
      }, this),
      "stop.owl.autoplay": $.proxy(function (e) {
        if (e.namespace) {
          this.stop();
        }
      }, this),
      "mouseover.owl.autoplay": $.proxy(function () {
        if (
          this._core.settings.autoplayHoverPause &&
          this._core.is("rotating")
        ) {
          this.pause();
        }
      }, this),
      "mouseleave.owl.autoplay": $.proxy(function () {
        if (
          this._core.settings.autoplayHoverPause &&
          this._core.is("rotating")
        ) {
          this.play();
        }
      }, this),
      "touchstart.owl.core": $.proxy(function () {
        if (
          this._core.settings.autoplayHoverPause &&
          this._core.is("rotating")
        ) {
          this.pause();
        }
      }, this),
      "touchend.owl.core": $.proxy(function () {
        if (this._core.settings.autoplayHoverPause) {
          this.play();
        }
      }, this),
    };

    // register event handlers
    this._core.$element.on(this._handlers);

    // set default options
    this._core.options = $.extend({}, Autoplay.Defaults, this._core.options);
  };

  /**
   * Default options.
   * @public
   */
  Autoplay.Defaults = {
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: false,
    autoplaySpeed: false,
  };

  /**
   * Starts the autoplay.
   * @public
   * @param {Number} [timeout] - The interval before the next animation starts.
   * @param {Number} [speed] - The animation speed for the animations.
   */
  Autoplay.prototype.play = function (timeout, speed) {
    this._paused = false;

    if (this._core.is("rotating")) {
      return;
    }

    this._core.enter("rotating");

    this._setAutoPlayInterval();
  };

  /**
   * Gets a new timeout
   * @private
   * @param {Number} [timeout] - The interval before the next animation starts.
   * @param {Number} [speed] - The animation speed for the animations.
   * @return {Timeout}
   */
  Autoplay.prototype._getNextTimeout = function (timeout, speed) {
    if (this._timeout) {
      window.clearTimeout(this._timeout);
    }
    return window.setTimeout(
      $.proxy(function () {
        if (
          this._paused ||
          this._core.is("busy") ||
          this._core.is("interacting") ||
          document.hidden
        ) {
          return;
        }
        this._core.next(speed || this._core.settings.autoplaySpeed);
      }, this),
      timeout || this._core.settings.autoplayTimeout
    );
  };

  /**
   * Sets autoplay in motion.
   * @private
   */
  Autoplay.prototype._setAutoPlayInterval = function () {
    this._timeout = this._getNextTimeout();
  };

  /**
   * Stops the autoplay.
   * @public
   */
  Autoplay.prototype.stop = function () {
    if (!this._core.is("rotating")) {
      return;
    }

    window.clearTimeout(this._timeout);
    this._core.leave("rotating");
  };

  /**
   * Stops the autoplay.
   * @public
   */
  Autoplay.prototype.pause = function () {
    if (!this._core.is("rotating")) {
      return;
    }

    this._paused = true;
  };

  /**
   * Destroys the plugin.
   */
  Autoplay.prototype.destroy = function () {
    var handler, property;

    this.stop();

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.autoplay = Autoplay;
})(window.Zepto || window.jQuery, window, document);

/**
 * Navigation Plugin
 * @version 2.1.0
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  "use strict";

  /**
   * Creates the navigation plugin.
   * @class The Navigation Plugin
   * @param {Owl} carousel - The Owl Carousel.
   */
  var Navigation = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Indicates whether the plugin is initialized or not.
     * @protected
     * @type {Boolean}
     */
    this._initialized = false;

    /**
     * The current paging indexes.
     * @protected
     * @type {Array}
     */
    this._pages = [];

    /**
     * All DOM elements of the user interface.
     * @protected
     * @type {Object}
     */
    this._controls = {};

    /**
     * Markup for an indicator.
     * @protected
     * @type {Array.<String>}
     */
    this._templates = [];

    /**
     * The carousel element.
     * @type {jQuery}
     */
    this.$element = this._core.$element;

    /**
     * Overridden methods of the carousel.
     * @protected
     * @type {Object}
     */
    this._overrides = {
      next: this._core.next,
      prev: this._core.prev,
      to: this._core.to,
    };

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "prepared.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.dotsData) {
          this._templates.push(
            '<div class="' +
              this._core.settings.dotClass +
              '">' +
              $(e.content)
                .find("[data-dot]")
                .addBack("[data-dot]")
                .attr("data-dot") +
              "</div>"
          );
        }
      }, this),
      "added.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.dotsData) {
          this._templates.splice(e.position, 0, this._templates.pop());
        }
      }, this),
      "remove.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.dotsData) {
          this._templates.splice(e.position, 1);
        }
      }, this),
      "changed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && e.property.name == "position") {
          this.draw();
        }
      }, this),
      "initialized.owl.carousel": $.proxy(function (e) {
        if (e.namespace && !this._initialized) {
          this._core.trigger("initialize", null, "navigation");
          this.initialize();
          this.update();
          this.draw();
          this._initialized = true;
          this._core.trigger("initialized", null, "navigation");
        }
      }, this),
      "refreshed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._initialized) {
          this._core.trigger("refresh", null, "navigation");
          this.update();
          this.draw();
          this._core.trigger("refreshed", null, "navigation");
        }
      }, this),
    };

    // set default options
    this._core.options = $.extend({}, Navigation.Defaults, this._core.options);

    // register event handlers
    this.$element.on(this._handlers);
  };

  /**
   * Default options.
   * @public
   * @todo Rename `slideBy` to `navBy`
   */
  Navigation.Defaults = {
    nav: false,
    navText: ["prev", "next"],
    navSpeed: false,
    navElement: "div",
    navContainer: false,
    navContainerClass: "owl-nav",
    navClass: ["owl-prev", "owl-next"],
    slideBy: 1,
    dotClass: "owl-dot",
    dotsClass: "owl-dots",
    dots: true,
    dotsEach: false,
    dotsData: false,
    dotsSpeed: false,
    dotsContainer: false,
  };

  /**
   * Initializes the layout of the plugin and extends the carousel.
   * @protected
   */
  Navigation.prototype.initialize = function () {
    var override,
      settings = this._core.settings;

    // create DOM structure for relative navigation
    this._controls.$relative = (
      settings.navContainer
        ? $(settings.navContainer)
        : $("<div>")
            .addClass(settings.navContainerClass)
            .appendTo(this.$element)
    ).addClass("disabled");

    this._controls.$previous = $("<" + settings.navElement + ">")
      .addClass(settings.navClass[0])
      .html(settings.navText[0])
      .prependTo(this._controls.$relative)
      .on(
        "click",
        $.proxy(function (e) {
          this.prev(settings.navSpeed);
        }, this)
      );
    this._controls.$next = $("<" + settings.navElement + ">")
      .addClass(settings.navClass[1])
      .html(settings.navText[1])
      .appendTo(this._controls.$relative)
      .on(
        "click",
        $.proxy(function (e) {
          this.next(settings.navSpeed);
        }, this)
      );

    // create DOM structure for absolute navigation
    if (!settings.dotsData) {
      this._templates = [
        $("<div>")
          .addClass(settings.dotClass)
          .append($("<span>"))
          .prop("outerHTML"),
      ];
    }

    this._controls.$absolute = (
      settings.dotsContainer
        ? $(settings.dotsContainer)
        : $("<div>").addClass(settings.dotsClass).appendTo(this.$element)
    ).addClass("disabled");

    this._controls.$absolute.on(
      "click",
      "div",
      $.proxy(function (e) {
        var index = $(e.target).parent().is(this._controls.$absolute)
          ? $(e.target).index()
          : $(e.target).parent().index();

        e.preventDefault();

        this.to(index, settings.dotsSpeed);
      }, this)
    );

    // override public methods of the carousel
    for (override in this._overrides) {
      this._core[override] = $.proxy(this[override], this);
    }
  };

  /**
   * Destroys the plugin.
   * @protected
   */
  Navigation.prototype.destroy = function () {
    var handler, control, property, override;

    for (handler in this._handlers) {
      this.$element.off(handler, this._handlers[handler]);
    }
    for (control in this._controls) {
      this._controls[control].remove();
    }
    for (override in this.overides) {
      this._core[override] = this._overrides[override];
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  /**
   * Updates the internal state.
   * @protected
   */
  Navigation.prototype.update = function () {
    var i,
      j,
      k,
      lower = this._core.clones().length / 2,
      upper = lower + this._core.items().length,
      maximum = this._core.maximum(true),
      settings = this._core.settings,
      size =
        settings.center || settings.autoWidth || settings.dotsData
          ? 1
          : settings.dotsEach || settings.items;

    if (settings.slideBy !== "page") {
      settings.slideBy = Math.min(settings.slideBy, settings.items);
    }

    if (settings.dots || settings.slideBy == "page") {
      this._pages = [];

      for (i = lower, j = 0, k = 0; i < upper; i++) {
        if (j >= size || j === 0) {
          this._pages.push({
            start: Math.min(maximum, i - lower),
            end: i - lower + size - 1,
          });
          if (Math.min(maximum, i - lower) === maximum) {
            break;
          }
          (j = 0), ++k;
        }
        j += this._core.mergers(this._core.relative(i));
      }
    }
  };

  /**
   * Draws the user interface.
   * @todo The option `dotsData` wont work.
   * @protected
   */
  Navigation.prototype.draw = function () {
    var difference,
      settings = this._core.settings,
      disabled = this._core.items().length <= settings.items,
      index = this._core.relative(this._core.current()),
      loop = settings.loop || settings.rewind;

    this._controls.$relative.toggleClass("disabled", !settings.nav || disabled);

    if (settings.nav) {
      this._controls.$previous.toggleClass(
        "disabled",
        !loop && index <= this._core.minimum(true)
      );
      this._controls.$next.toggleClass(
        "disabled",
        !loop && index >= this._core.maximum(true)
      );
    }

    this._controls.$absolute.toggleClass(
      "disabled",
      !settings.dots || disabled
    );

    if (settings.dots) {
      difference =
        this._pages.length - this._controls.$absolute.children().length;

      if (settings.dotsData && difference !== 0) {
        this._controls.$absolute.html(this._templates.join(""));
      } else if (difference > 0) {
        this._controls.$absolute.append(
          new Array(difference + 1).join(this._templates[0])
        );
      } else if (difference < 0) {
        this._controls.$absolute.children().slice(difference).remove();
      }

      this._controls.$absolute.find(".active").removeClass("active");
      this._controls.$absolute
        .children()
        .eq($.inArray(this.current(), this._pages))
        .addClass("active");
    }
  };

  /**
   * Extends event data.
   * @protected
   * @param {Event} event - The event object which gets thrown.
   */
  Navigation.prototype.onTrigger = function (event) {
    var settings = this._core.settings;

    event.page = {
      index: $.inArray(this.current(), this._pages),
      count: this._pages.length,
      size:
        settings &&
        (settings.center || settings.autoWidth || settings.dotsData
          ? 1
          : settings.dotsEach || settings.items),
    };
  };

  /**
   * Gets the current page position of the carousel.
   * @protected
   * @returns {Number}
   */
  Navigation.prototype.current = function () {
    var current = this._core.relative(this._core.current());
    return $.grep(
      this._pages,
      $.proxy(function (page, index) {
        return page.start <= current && page.end >= current;
      }, this)
    ).pop();
  };

  /**
   * Gets the current succesor/predecessor position.
   * @protected
   * @returns {Number}
   */
  Navigation.prototype.getPosition = function (successor) {
    var position,
      length,
      settings = this._core.settings;

    if (settings.slideBy == "page") {
      position = $.inArray(this.current(), this._pages);
      length = this._pages.length;
      successor ? ++position : --position;
      position = this._pages[((position % length) + length) % length].start;
    } else {
      position = this._core.relative(this._core.current());
      length = this._core.items().length;
      successor
        ? (position += settings.slideBy)
        : (position -= settings.slideBy);
    }

    return position;
  };

  /**
   * Slides to the next item or page.
   * @public
   * @param {Number} [speed=false] - The time in milliseconds for the transition.
   */
  Navigation.prototype.next = function (speed) {
    $.proxy(this._overrides.to, this._core)(this.getPosition(true), speed);
  };

  /**
   * Slides to the previous item or page.
   * @public
   * @param {Number} [speed=false] - The time in milliseconds for the transition.
   */
  Navigation.prototype.prev = function (speed) {
    $.proxy(this._overrides.to, this._core)(this.getPosition(false), speed);
  };

  /**
   * Slides to the specified item or page.
   * @public
   * @param {Number} position - The position of the item or page.
   * @param {Number} [speed] - The time in milliseconds for the transition.
   * @param {Boolean} [standard=false] - Whether to use the standard behaviour or not.
   */
  Navigation.prototype.to = function (position, speed, standard) {
    var length;

    if (!standard && this._pages.length) {
      length = this._pages.length;
      $.proxy(this._overrides.to, this._core)(
        this._pages[((position % length) + length) % length].start,
        speed
      );
    } else {
      $.proxy(this._overrides.to, this._core)(position, speed);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Navigation = Navigation;
})(window.Zepto || window.jQuery, window, document);

/**
 * Hash Plugin
 * @version 2.1.0
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  "use strict";

  /**
   * Creates the hash plugin.
   * @class The Hash Plugin
   * @param {Owl} carousel - The Owl Carousel
   */
  var Hash = function (carousel) {
    /**
     * Reference to the core.
     * @protected
     * @type {Owl}
     */
    this._core = carousel;

    /**
     * Hash index for the items.
     * @protected
     * @type {Object}
     */
    this._hashes = {};

    /**
     * The carousel element.
     * @type {jQuery}
     */
    this.$element = this._core.$element;

    /**
     * All event handlers.
     * @protected
     * @type {Object}
     */
    this._handlers = {
      "initialized.owl.carousel": $.proxy(function (e) {
        if (e.namespace && this._core.settings.startPosition === "URLHash") {
          $(window).trigger("hashchange.owl.navigation");
        }
      }, this),
      "prepared.owl.carousel": $.proxy(function (e) {
        if (e.namespace) {
          var hash = $(e.content)
            .find("[data-hash]")
            .addBack("[data-hash]")
            .attr("data-hash");

          if (!hash) {
            return;
          }

          this._hashes[hash] = e.content;
        }
      }, this),
      "changed.owl.carousel": $.proxy(function (e) {
        if (e.namespace && e.property.name === "position") {
          var current = this._core.items(
              this._core.relative(this._core.current())
            ),
            hash = $.map(this._hashes, function (item, hash) {
              return item === current ? hash : null;
            }).join();

          if (!hash || window.location.hash.slice(1) === hash) {
            return;
          }

          window.location.hash = hash;
        }
      }, this),
    };

    // set default options
    this._core.options = $.extend({}, Hash.Defaults, this._core.options);

    // register the event handlers
    this.$element.on(this._handlers);

    // register event listener for hash navigation
    $(window).on(
      "hashchange.owl.navigation",
      $.proxy(function (e) {
        var hash = window.location.hash.substring(1),
          items = this._core.$stage.children(),
          position = this._hashes[hash] && items.index(this._hashes[hash]);

        if (position === undefined || position === this._core.current()) {
          return;
        }

        this._core.to(this._core.relative(position), false, true);
      }, this)
    );
  };

  /**
   * Default options.
   * @public
   */
  Hash.Defaults = {
    URLhashListener: false,
  };

  /**
   * Destroys the plugin.
   * @public
   */
  Hash.prototype.destroy = function () {
    var handler, property;

    $(window).off("hashchange.owl.navigation");

    for (handler in this._handlers) {
      this._core.$element.off(handler, this._handlers[handler]);
    }
    for (property in Object.getOwnPropertyNames(this)) {
      typeof this[property] != "function" && (this[property] = null);
    }
  };

  $.fn.owlCarousel.Constructor.Plugins.Hash = Hash;
})(window.Zepto || window.jQuery, window, document);

/**
 * Support Plugin
 *
 * @version 2.1.0
 * @author Vivid Planet Software GmbH
 * @author Artus Kolanowski
 * @author David Deutsch
 * @license The MIT License (MIT)
 */
(function ($, window, document, undefined) {
  var style = $("<support>").get(0).style,
    prefixes = "Webkit Moz O ms".split(" "),
    events = {
      transition: {
        end: {
          WebkitTransition: "webkitTransitionEnd",
          MozTransition: "transitionend",
          OTransition: "oTransitionEnd",
          transition: "transitionend",
        },
      },
      animation: {
        end: {
          WebkitAnimation: "webkitAnimationEnd",
          MozAnimation: "animationend",
          OAnimation: "oAnimationEnd",
          animation: "animationend",
        },
      },
    },
    tests = {
      csstransforms: function () {
        return !!test("transform");
      },
      csstransforms3d: function () {
        return !!test("perspective");
      },
      csstransitions: function () {
        return !!test("transition");
      },
      cssanimations: function () {
        return !!test("animation");
      },
    };

  function test(property, prefixed) {
    var result = false,
      upper = property.charAt(0).toUpperCase() + property.slice(1);

    $.each(
      (property + " " + prefixes.join(upper + " ") + upper).split(" "),
      function (i, property) {
        if (style[property] !== undefined) {
          result = prefixed ? property : true;
          return false;
        }
      }
    );

    return result;
  }

  function prefixed(property) {
    return test(property, true);
  }

  if (tests.csstransitions()) {
    /* jshint -W053 */
    $.support.transition = new String(prefixed("transition"));
    $.support.transition.end = events.transition.end[$.support.transition];
  }

  if (tests.cssanimations()) {
    /* jshint -W053 */
    $.support.animation = new String(prefixed("animation"));
    $.support.animation.end = events.animation.end[$.support.animation];
  }

  if (tests.csstransforms()) {
    /* jshint -W053 */
    $.support.transform = new String(prefixed("transform"));
    $.support.transform3d = tests.csstransforms3d();
  }
})(window.Zepto || window.jQuery, window, document);

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {},
    };
    factory(mod.exports);
    global.PinchZoom = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true,
  });
  /*

        PinchZoom.js
        Copyright (c) Manuel Stofer 2013 - today

        Author: Manuel Stofer (mst@rtp.ch)
        Version: 2.3.0

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

  // polyfills
  if (typeof Object.assign != "function") {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs) {
        // .length of function is 2
        if (target == null) {
          // TypeError if undefined or null
          throw new TypeError("Cannot convert undefined or null to object");
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) {
            // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true,
    });
  }

  if (typeof Array.from != "function") {
    Array.from = function (object) {
      return [].slice.call(object);
    };
  }

  // utils
  var buildElement = function buildElement(str) {
    // empty string as title argument required by IE and Edge
    var tmp = document.implementation.createHTMLDocument("");
    tmp.body.innerHTML = str;
    return Array.from(tmp.body.children)[0];
  };

  var triggerEvent = function triggerEvent(el, name) {
    var event = document.createEvent("HTMLEvents");
    event.initEvent(name, true, false);
    el.dispatchEvent(event);
  };

  var definePinchZoom = function definePinchZoom() {
    /**
     * Pinch zoom
     * @param el
     * @param options
     * @constructor
     */
    var PinchZoom = function PinchZoom(el, options) {
        this.el = el;
        this.zoomFactor = 1;
        this.lastScale = 1;
        this.offset = {
          x: 0,
          y: 0,
        };
        this.initialOffset = {
          x: 0,
          y: 0,
        };
        this.options = Object.assign({}, this.defaults, options);
        this.setupMarkup();
        this.bindEvents();
        this.update();

        // The image may already be loaded when PinchZoom is initialized,
        // and then the load event (which trigger update) will never fire.
        if (this.isImageLoaded(this.el)) {
          this.updateAspectRatio();
          this.setupOffsets();
        }

        this.enable();
      },
      sum = function sum(a, b) {
        return a + b;
      },
      isCloseTo = function isCloseTo(value, expected) {
        return value > expected - 0.01 && value < expected + 0.01;
      };

    PinchZoom.prototype = {
      defaults: {
        tapZoomFactor: 2,
        zoomOutFactor: 1.3,
        animationDuration: 300,
        maxZoom: 4,
        minZoom: 0.5,
        draggableUnzoomed: true,
        lockDragAxis: false,
        setOffsetsOnce: false,
        use2d: true,
        zoomStartEventName: "pz_zoomstart",
        zoomUpdateEventName: "pz_zoomupdate",
        zoomEndEventName: "pz_zoomend",
        dragStartEventName: "pz_dragstart",
        dragUpdateEventName: "pz_dragupdate",
        dragEndEventName: "pz_dragend",
        doubleTapEventName: "pz_doubletap",
        verticalPadding: 0,
        horizontalPadding: 0,
      },

      /**
       * Event handler for 'dragstart'
       * @param event
       */
      handleDragStart: function handleDragStart(event) {
        triggerEvent(this.el, this.options.dragStartEventName);
        this.stopAnimation();
        this.lastDragPosition = false;
        this.hasInteraction = true;
        this.handleDrag(event);
      },

      /**
       * Event handler for 'drag'
       * @param event
       */
      handleDrag: function handleDrag(event) {
        var touch = this.getTouches(event)[0];
        this.drag(touch, this.lastDragPosition);
        this.offset = this.sanitizeOffset(this.offset);
        this.lastDragPosition = touch;
      },

      handleDragEnd: function handleDragEnd() {
        triggerEvent(this.el, this.options.dragEndEventName);
        this.end();
      },

      /**
       * Event handler for 'zoomstart'
       * @param event
       */
      handleZoomStart: function handleZoomStart(event) {
        triggerEvent(this.el, this.options.zoomStartEventName);
        this.stopAnimation();
        this.lastScale = 1;
        this.nthZoom = 0;
        this.lastZoomCenter = false;
        this.hasInteraction = true;
      },

      /**
       * Event handler for 'zoom'
       * @param event
       */
      handleZoom: function handleZoom(event, newScale) {
        // a relative scale factor is used
        var touchCenter = this.getTouchCenter(this.getTouches(event)),
          scale = newScale / this.lastScale;
        this.lastScale = newScale;

        // the first touch events are thrown away since they are not precise
        this.nthZoom += 1;
        if (this.nthZoom > 3) {
          this.scale(scale, touchCenter);
          this.drag(touchCenter, this.lastZoomCenter);
        }
        this.lastZoomCenter = touchCenter;
      },

      handleZoomEnd: function handleZoomEnd() {
        triggerEvent(this.el, this.options.zoomEndEventName);
        this.end();
      },

      /**
       * Event handler for 'doubletap'
       * @param event
       */
      handleDoubleTap: function handleDoubleTap(event) {
        var center = this.getTouches(event)[0],
          zoomFactor = this.zoomFactor > 1 ? 1 : this.options.tapZoomFactor,
          startZoomFactor = this.zoomFactor,
          updateProgress = function (progress) {
            this.scaleTo(
              startZoomFactor + progress * (zoomFactor - startZoomFactor),
              center
            );
          }.bind(this);

        if (this.hasInteraction) {
          return;
        }

        this.isDoubleTap = true;

        if (startZoomFactor > zoomFactor) {
          center = this.getCurrentZoomCenter();
        }

        this.animate(
          this.options.animationDuration,
          updateProgress,
          this.swing
        );
        triggerEvent(this.el, this.options.doubleTapEventName);
      },

      /**
       * Compute the initial offset
       *
       * the element should be centered in the container upon initialization
       */
      computeInitialOffset: function computeInitialOffset() {
        this.initialOffset = {
          x:
            -Math.abs(
              this.el.offsetWidth * this.getInitialZoomFactor() -
                this.container.offsetWidth
            ) / 2,
          y:
            -Math.abs(
              this.el.offsetHeight * this.getInitialZoomFactor() -
                this.container.offsetHeight
            ) / 2,
        };
      },

      /**
       * Reset current image offset to that of the initial offset
       */
      resetOffset: function resetOffset() {
        this.offset.x = this.initialOffset.x;
        this.offset.y = this.initialOffset.y;
      },

      /**
       * Determine if image is loaded
       */
      isImageLoaded: function isImageLoaded(el) {
        if (el.nodeName === "IMG") {
          return el.complete && el.naturalHeight !== 0;
        } else {
          return Array.from(el.querySelectorAll("img")).every(
            this.isImageLoaded
          );
        }
      },

      setupOffsets: function setupOffsets() {
        if (this.options.setOffsetsOnce && this._isOffsetsSet) {
          return;
        }

        this._isOffsetsSet = true;

        this.computeInitialOffset();
        this.resetOffset();
      },

      /**
       * Max / min values for the offset
       * @param offset
       * @return {Object} the sanitized offset
       */
      sanitizeOffset: function sanitizeOffset(offset) {
        var elWidth =
          this.el.offsetWidth * this.getInitialZoomFactor() * this.zoomFactor;
        var elHeight =
          this.el.offsetHeight * this.getInitialZoomFactor() * this.zoomFactor;
        var maxX =
            elWidth - this.getContainerX() + this.options.horizontalPadding,
          maxY = elHeight - this.getContainerY() + this.options.verticalPadding,
          maxOffsetX = Math.max(maxX, 0),
          maxOffsetY = Math.max(maxY, 0),
          minOffsetX = Math.min(maxX, 0) - this.options.horizontalPadding,
          minOffsetY = Math.min(maxY, 0) - this.options.verticalPadding;

        return {
          x: Math.min(Math.max(offset.x, minOffsetX), maxOffsetX),
          y: Math.min(Math.max(offset.y, minOffsetY), maxOffsetY),
        };
      },

      /**
       * Scale to a specific zoom factor (not relative)
       * @param zoomFactor
       * @param center
       */
      scaleTo: function scaleTo(zoomFactor, center) {
        this.scale(zoomFactor / this.zoomFactor, center);
      },

      /**
       * Scales the element from specified center
       * @param scale
       * @param center
       */
      scale: function scale(_scale, center) {
        _scale = this.scaleZoomFactor(_scale);
        this.addOffset({
          x: (_scale - 1) * (center.x + this.offset.x),
          y: (_scale - 1) * (center.y + this.offset.y),
        });
        triggerEvent(this.el, this.options.zoomUpdateEventName);
      },

      /**
       * Scales the zoom factor relative to current state
       * @param scale
       * @return the actual scale (can differ because of max min zoom factor)
       */
      scaleZoomFactor: function scaleZoomFactor(scale) {
        var originalZoomFactor = this.zoomFactor;
        this.zoomFactor *= scale;
        this.zoomFactor = Math.min(
          this.options.maxZoom,
          Math.max(this.zoomFactor, this.options.minZoom)
        );
        return this.zoomFactor / originalZoomFactor;
      },

      /**
       * Determine if the image is in a draggable state
       *
       * When the image can be dragged, the drag event is acted upon and cancelled.
       * When not draggable, the drag event bubbles through this component.
       *
       * @return {Boolean}
       */
      canDrag: function canDrag() {
        return this.options.draggableUnzoomed || !isCloseTo(this.zoomFactor, 1);
      },

      /**
       * Drags the element
       * @param center
       * @param lastCenter
       */
      drag: function drag(center, lastCenter) {
        if (lastCenter) {
          if (this.options.lockDragAxis) {
            // lock scroll to position that was changed the most
            if (
              Math.abs(center.x - lastCenter.x) >
              Math.abs(center.y - lastCenter.y)
            ) {
              this.addOffset({
                x: -(center.x - lastCenter.x),
                y: 0,
              });
            } else {
              this.addOffset({
                y: -(center.y - lastCenter.y),
                x: 0,
              });
            }
          } else {
            this.addOffset({
              y: -(center.y - lastCenter.y),
              x: -(center.x - lastCenter.x),
            });
          }
          triggerEvent(this.el, this.options.dragUpdateEventName);
        }
      },

      /**
       * Calculates the touch center of multiple touches
       * @param touches
       * @return {Object}
       */
      getTouchCenter: function getTouchCenter(touches) {
        return this.getVectorAvg(touches);
      },

      /**
       * Calculates the average of multiple vectors (x, y values)
       */
      getVectorAvg: function getVectorAvg(vectors) {
        return {
          x:
            vectors
              .map(function (v) {
                return v.x;
              })
              .reduce(sum) / vectors.length,
          y:
            vectors
              .map(function (v) {
                return v.y;
              })
              .reduce(sum) / vectors.length,
        };
      },

      /**
       * Adds an offset
       * @param offset the offset to add
       * @return return true when the offset change was accepted
       */
      addOffset: function addOffset(offset) {
        this.offset = {
          x: this.offset.x + offset.x,
          y: this.offset.y + offset.y,
        };
      },

      sanitize: function sanitize() {
        if (this.zoomFactor < this.options.zoomOutFactor) {
          this.zoomOutAnimation();
        } else if (this.isInsaneOffset(this.offset)) {
          this.sanitizeOffsetAnimation();
        }
      },

      /**
       * Checks if the offset is ok with the current zoom factor
       * @param offset
       * @return {Boolean}
       */
      isInsaneOffset: function isInsaneOffset(offset) {
        var sanitizedOffset = this.sanitizeOffset(offset);
        return sanitizedOffset.x !== offset.x || sanitizedOffset.y !== offset.y;
      },

      /**
       * Creates an animation moving to a sane offset
       */
      sanitizeOffsetAnimation: function sanitizeOffsetAnimation() {
        var targetOffset = this.sanitizeOffset(this.offset),
          startOffset = {
            x: this.offset.x,
            y: this.offset.y,
          },
          updateProgress = function (progress) {
            this.offset.x =
              startOffset.x + progress * (targetOffset.x - startOffset.x);
            this.offset.y =
              startOffset.y + progress * (targetOffset.y - startOffset.y);
            this.update();
          }.bind(this);

        this.animate(
          this.options.animationDuration,
          updateProgress,
          this.swing
        );
      },

      /**
       * Zooms back to the original position,
       * (no offset and zoom factor 1)
       */
      zoomOutAnimation: function zoomOutAnimation() {
        if (this.zoomFactor === 1) {
          return;
        }

        var startZoomFactor = this.zoomFactor,
          zoomFactor = 1,
          center = this.getCurrentZoomCenter(),
          updateProgress = function (progress) {
            this.scaleTo(
              startZoomFactor + progress * (zoomFactor - startZoomFactor),
              center
            );
          }.bind(this);

        this.animate(
          this.options.animationDuration,
          updateProgress,
          this.swing
        );
      },

      /**
       * Updates the container aspect ratio
       *
       * Any previous container height must be cleared before re-measuring the
       * parent height, since it depends implicitly on the height of any of its children
       */
      updateAspectRatio: function updateAspectRatio() {
        this.unsetContainerY();
        this.setContainerY(this.container.parentElement.offsetHeight);
      },

      /**
       * Calculates the initial zoom factor (for the element to fit into the container)
       * @return {number} the initial zoom factor
       */
      getInitialZoomFactor: function getInitialZoomFactor() {
        var xZoomFactor = this.container.offsetWidth / this.el.offsetWidth;
        var yZoomFactor = this.container.offsetHeight / this.el.offsetHeight;

        return Math.min(xZoomFactor, yZoomFactor);
      },

      /**
       * Calculates the aspect ratio of the element
       * @return the aspect ratio
       */
      getAspectRatio: function getAspectRatio() {
        return this.el.offsetWidth / this.el.offsetHeight;
      },

      /**
       * Calculates the virtual zoom center for the current offset and zoom factor
       * (used for reverse zoom)
       * @return {Object} the current zoom center
       */
      getCurrentZoomCenter: function getCurrentZoomCenter() {
        var offsetLeft = this.offset.x - this.initialOffset.x;
        var centerX =
          -1 * this.offset.x - offsetLeft / (1 / this.zoomFactor - 1);

        var offsetTop = this.offset.y - this.initialOffset.y;
        var centerY =
          -1 * this.offset.y - offsetTop / (1 / this.zoomFactor - 1);

        return {
          x: centerX,
          y: centerY,
        };
      },

      /**
       * Returns the touches of an event relative to the container offset
       * @param event
       * @return array touches
       */
      getTouches: function getTouches(event) {
        var rect = this.container.getBoundingClientRect();
        var scrollTop =
          document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft =
          document.documentElement.scrollLeft || document.body.scrollLeft;
        var posTop = rect.top + scrollTop;
        var posLeft = rect.left + scrollLeft;

        return Array.prototype.slice.call(event.touches).map(function (touch) {
          return {
            x: touch.pageX - posLeft,
            y: touch.pageY - posTop,
          };
        });
      },

      /**
       * Animation loop
       * does not support simultaneous animations
       * @param duration
       * @param framefn
       * @param timefn
       * @param callback
       */
      animate: function animate(duration, framefn, timefn, callback) {
        var startTime = new Date().getTime(),
          renderFrame = function () {
            if (!this.inAnimation) {
              return;
            }
            var frameTime = new Date().getTime() - startTime,
              progress = frameTime / duration;
            if (frameTime >= duration) {
              framefn(1);
              if (callback) {
                callback();
              }
              this.update();
              this.stopAnimation();
              this.update();
            } else {
              if (timefn) {
                progress = timefn(progress);
              }
              framefn(progress);
              this.update();
              requestAnimationFrame(renderFrame);
            }
          }.bind(this);
        this.inAnimation = true;
        requestAnimationFrame(renderFrame);
      },

      /**
       * Stops the animation
       */
      stopAnimation: function stopAnimation() {
        this.inAnimation = false;
      },

      /**
       * Swing timing function for animations
       * @param p
       * @return {Number}
       */
      swing: function swing(p) {
        return -Math.cos(p * Math.PI) / 2 + 0.5;
      },

      getContainerX: function getContainerX() {
        return this.container.offsetWidth;
      },

      getContainerY: function getContainerY() {
        return this.container.offsetHeight;
      },

      setContainerY: function setContainerY(y) {
        return (this.container.style.height = y + "px");
      },

      unsetContainerY: function unsetContainerY() {
        this.container.style.height = null;
      },

      /**
       * Creates the expected html structure
       */
      setupMarkup: function setupMarkup() {
        this.container = buildElement(
          '<div class="pinch-zoom-container"></div>'
        );
        this.el.parentNode.insertBefore(this.container, this.el);
        this.container.appendChild(this.el);

        this.container.style.overflow = "hidden";
        this.container.style.position = "relative";

        this.el.style.webkitTransformOrigin = "0% 0%";
        this.el.style.mozTransformOrigin = "0% 0%";
        this.el.style.msTransformOrigin = "0% 0%";
        this.el.style.oTransformOrigin = "0% 0%";
        this.el.style.transformOrigin = "0% 0%";

        this.el.style.position = "absolute";
      },

      end: function end() {
        this.hasInteraction = false;
        this.sanitize();
        this.update();
      },

      /**
       * Binds all required event listeners
       */
      bindEvents: function bindEvents() {
        var self = this;
        detectGestures(this.container, this);

        window.addEventListener("resize", this.update.bind(this));
        Array.from(this.el.querySelectorAll("img")).forEach(function (imgEl) {
          imgEl.addEventListener("load", self.update.bind(self));
        });

        if (this.el.nodeName === "IMG") {
          this.el.addEventListener("load", this.update.bind(this));
        }
      },

      /**
       * Updates the css values according to the current zoom factor and offset
       */
      update: function update(event) {
        if (this.updatePlaned) {
          return;
        }
        this.updatePlaned = true;

        window.setTimeout(
          function () {
            this.updatePlaned = false;

            if (event && event.type === "resize") {
              this.updateAspectRatio();
              this.setupOffsets();
            }

            if (event && event.type === "load") {
              this.updateAspectRatio();
              this.setupOffsets();
            }

            var zoomFactor = this.getInitialZoomFactor() * this.zoomFactor,
              offsetX = -this.offset.x / zoomFactor,
              offsetY = -this.offset.y / zoomFactor,
              transform3d =
                "scale3d(" +
                zoomFactor +
                ", " +
                zoomFactor +
                ",1) " +
                "translate3d(" +
                offsetX +
                "px," +
                offsetY +
                "px,0px)",
              transform2d =
                "scale(" +
                zoomFactor +
                ", " +
                zoomFactor +
                ") " +
                "translate(" +
                offsetX +
                "px," +
                offsetY +
                "px)",
              removeClone = function () {
                if (this.clone) {
                  this.clone.parentNode.removeChild(this.clone);
                  delete this.clone;
                }
              }.bind(this);

            // Scale 3d and translate3d are faster (at least on ios)
            // but they also reduce the quality.
            // PinchZoom uses the 3d transformations during interactions
            // after interactions it falls back to 2d transformations
            if (
              !this.options.use2d ||
              this.hasInteraction ||
              this.inAnimation
            ) {
              this.is3d = true;
              removeClone();

              this.el.style.webkitTransform = transform3d;
              this.el.style.mozTransform = transform2d;
              this.el.style.msTransform = transform2d;
              this.el.style.oTransform = transform2d;
              this.el.style.transform = transform3d;
            } else {
              // When changing from 3d to 2d transform webkit has some glitches.
              // To avoid this, a copy of the 3d transformed element is displayed in the
              // foreground while the element is converted from 3d to 2d transform
              if (this.is3d) {
                this.clone = this.el.cloneNode(true);
                this.clone.style.pointerEvents = "none";
                this.container.appendChild(this.clone);
                window.setTimeout(removeClone, 200);
              }

              this.el.style.webkitTransform = transform2d;
              this.el.style.mozTransform = transform2d;
              this.el.style.msTransform = transform2d;
              this.el.style.oTransform = transform2d;
              this.el.style.transform = transform2d;

              this.is3d = false;
            }
          }.bind(this),
          0
        );
      },

      /**
       * Enables event handling for gestures
       */
      enable: function enable() {
        this.enabled = true;
      },

      /**
       * Disables event handling for gestures
       */
      disable: function disable() {
        this.enabled = false;
      },
    };

    var detectGestures = function detectGestures(el, target) {
      var interaction = null,
        fingers = 0,
        lastTouchStart = null,
        startTouches = null,
        setInteraction = function setInteraction(newInteraction, event) {
          if (interaction !== newInteraction) {
            if (interaction && !newInteraction) {
              switch (interaction) {
                case "zoom":
                  target.handleZoomEnd(event);
                  break;
                case "drag":
                  target.handleDragEnd(event);
                  break;
              }
            }

            switch (newInteraction) {
              case "zoom":
                target.handleZoomStart(event);
                break;
              case "drag":
                target.handleDragStart(event);
                break;
            }
          }
          interaction = newInteraction;
        },
        updateInteraction = function updateInteraction(event) {
          if (fingers === 2) {
            setInteraction("zoom");
          } else if (fingers === 1 && target.canDrag()) {
            setInteraction("drag", event);
          } else {
            setInteraction(null, event);
          }
        },
        targetTouches = function targetTouches(touches) {
          return Array.from(touches).map(function (touch) {
            return {
              x: touch.pageX,
              y: touch.pageY,
            };
          });
        },
        getDistance = function getDistance(a, b) {
          var x, y;
          x = a.x - b.x;
          y = a.y - b.y;
          return Math.sqrt(x * x + y * y);
        },
        calculateScale = function calculateScale(startTouches, endTouches) {
          var startDistance = getDistance(startTouches[0], startTouches[1]),
            endDistance = getDistance(endTouches[0], endTouches[1]);
          return endDistance / startDistance;
        },
        cancelEvent = function cancelEvent(event) {
          event.stopPropagation();
          event.preventDefault();
        },
        detectDoubleTap = function detectDoubleTap(event) {
          var time = new Date().getTime();

          if (fingers > 1) {
            lastTouchStart = null;
          }

          if (time - lastTouchStart < 300) {
            cancelEvent(event);

            target.handleDoubleTap(event);
            switch (interaction) {
              case "zoom":
                target.handleZoomEnd(event);
                break;
              case "drag":
                target.handleDragEnd(event);
                break;
            }
          } else {
            target.isDoubleTap = false;
          }

          if (fingers === 1) {
            lastTouchStart = time;
          }
        },
        firstMove = true;

      el.addEventListener("touchstart", function (event) {
        if (target.enabled) {
          firstMove = true;
          fingers = event.touches.length;
          detectDoubleTap(event);
        }
      });

      el.addEventListener("touchmove", function (event) {
        if (target.enabled && !target.isDoubleTap) {
          if (firstMove) {
            updateInteraction(event);
            if (interaction) {
              cancelEvent(event);
            }
            startTouches = targetTouches(event.touches);
          } else {
            switch (interaction) {
              case "zoom":
                target.handleZoom(
                  event,
                  calculateScale(startTouches, targetTouches(event.touches))
                );
                break;
              case "drag":
                target.handleDrag(event);
                break;
            }
            if (interaction) {
              cancelEvent(event);
              target.update();
            }
          }

          firstMove = false;
        }
      });

      el.addEventListener("touchend", function (event) {
        if (target.enabled) {
          fingers = event.touches.length;
          updateInteraction(event);
        }
      });
    };

    return PinchZoom;
  };

  var PinchZoom = definePinchZoom();

  exports.default = PinchZoom;
});

/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
 */

window.Swipe = function (element, options) {
  // return immediately if element doesn't exist
  if (!element) return null;

  var _this = this;

  // retreive options
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function () {};
  this.delay = this.options.auto || 0;

  // reference dom elements
  this.container = element;
  this.element = this.container.children[0]; // the slide pane

  // static css
  this.container.style.overflow = "hidden";
  this.element.style.listStyle = "none";

  // trigger slider initialization
  this.setup();

  // begin auto slideshow
  this.begin();

  // add event listeners
  if (this.element.addEventListener) {
    this.element.addEventListener("touchstart", this, false);
    this.element.addEventListener("touchmove", this, false);
    this.element.addEventListener("touchend", this, false);
    this.element.addEventListener("webkitTransitionEnd", this, false);
    this.element.addEventListener("msTransitionEnd", this, false);
    this.element.addEventListener("oTransitionEnd", this, false);
    this.element.addEventListener("transitionend", this, false);
    window.addEventListener("resize", this, false);
  }
};

Swipe.prototype = {
  setup: function () {
    // get and measure amt of slides
    this.slides = this.element.children;
    this.length = this.slides.length;

    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // determine width of each slide
    this.width = this.container.getBoundingClientRect().width;

    // return immediately if measurement fails
    if (!this.width) return null;

    // hide slider element but keep positioning during setup
    this.container.style.visibility = "hidden";

    // dynamic css
    this.element.style.width = this.slides.length * this.width + "px";
    var index = this.slides.length;
    while (index--) {
      var el = this.slides[index];
      el.style.width = this.width + "px";
      el.style.display = "table-cell";
      el.style.verticalAlign = "top";
    }

    // set start position and force translate to remove initial flickering
    this.slide(this.index, 0);

    // show slider element
    this.container.style.visibility = "visible";
  },

  slide: function (index, duration) {
    var style = this.element.style;

    // fallback to default speed
    if (duration == undefined) {
      duration = this.speed;
    }

    // set duration speed (0 represents 1-to-1 scrolling)
    style.webkitTransitionDuration =
      style.MozTransitionDuration =
      style.msTransitionDuration =
      style.OTransitionDuration =
      style.transitionDuration =
        duration + "ms";

    // translate to given index position
    style.MozTransform = style.webkitTransform =
      "translate3d(" + -(index * this.width) + "px,0,0)";
    style.msTransform = style.OTransform =
      "translateX(" + -(index * this.width) + "px)";

    // set new index to allow for expression arguments
    this.index = index;
  },

  getPos: function () {
    // return current index position
    return this.index;
  },

  prev: function (delay) {
    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    // if not at first slide
    if (this.index) this.slide(this.index - 1, this.speed);
  },

  next: function (delay) {
    // cancel next scheduled automatic transition, if any
    this.delay = delay || 0;
    clearTimeout(this.interval);

    if (this.index < this.length - 1)
      this.slide(this.index + 1, this.speed); // if not last slide
    else this.slide(0, this.speed); //if last slide return to start
  },

  begin: function () {
    var _this = this;

    this.interval = this.delay
      ? setTimeout(function () {
          _this.next(_this.delay);
        }, this.delay)
      : 0;
  },

  stop: function () {
    this.delay = 0;
    clearTimeout(this.interval);
  },

  resume: function () {
    this.delay = this.options.auto || 0;
    this.begin();
  },

  handleEvent: function (e) {
    switch (e.type) {
      case "touchstart":
        this.onTouchStart(e);
        break;
      case "touchmove":
        this.onTouchMove(e);
        break;
      case "touchend":
        this.onTouchEnd(e);
        break;
      case "webkitTransitionEnd":
      case "msTransitionEnd":
      case "oTransitionEnd":
      case "transitionend":
        this.transitionEnd(e);
        break;
      case "resize":
        this.setup();
        break;
    }
  },

  transitionEnd: function (e) {
    if (this.delay) this.begin();

    this.callback(e, this.index, this.slides[this.index]);
  },

  onTouchStart: function (e) {
    this.start = {
      // get touch coordinates for delta calculations in onTouchMove
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,

      // set initial timestamp of touch sequence
      time: Number(new Date()),
    };

    // used for testing first onTouchMove event
    this.isScrolling = undefined;

    // reset deltaX
    this.deltaX = 0;

    // set transition time to 0 for 1-to-1 touch movement
    this.element.style.MozTransitionDuration =
      this.element.style.webkitTransitionDuration = 0;
  },

  onTouchMove: function (e) {
    // ensure swiping with one touch and not pinching
    if (e.touches.length > 1 || (e.scale && e.scale !== 1)) return;

    this.deltaX = e.touches[0].pageX - this.start.pageX;

    // determine if scrolling test has run - one time test
    if (typeof this.isScrolling == "undefined") {
      this.isScrolling = !!(
        this.isScrolling ||
        Math.abs(this.deltaX) < Math.abs(e.touches[0].pageY - this.start.pageY)
      );
    }

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {
      // prevent native scrolling
      e.preventDefault();

      // cancel slideshow
      clearTimeout(this.interval);

      // increase resistance if first or last slide
      this.deltaX =
        this.deltaX /
        ((!this.index && this.deltaX > 0) || // if first slide and sliding left
        (this.index == this.length - 1 && // or if last slide and sliding right
          this.deltaX < 0) // and if sliding at all
          ? Math.abs(this.deltaX) / this.width + 1 // determine resistance level
          : 1); // no resistance if false

      // translate immediately 1-to-1
      this.element.style.MozTransform = this.element.style.webkitTransform =
        "translate3d(" + (this.deltaX - this.index * this.width) + "px,0,0)";
    }
  },

  onTouchEnd: function (e) {
    // determine if slide attempt triggers next/prev slide
    var isValidSlide =
        (Number(new Date()) - this.start.time < 250 && // if slide duration is less than 250ms
          Math.abs(this.deltaX) > 20) || // and if slide amt is greater than 20px
        Math.abs(this.deltaX) > this.width / 2, // or if slide amt is greater than half the width
      // determine if slide attempt is past start and end
      isPastBounds =
        (!this.index && this.deltaX > 0) || // if first slide and slide amt is greater than 0
        (this.index == this.length - 1 && this.deltaX < 0); // or if last slide and slide amt is less than 0

    // if not scrolling vertically
    if (!this.isScrolling) {
      // call slide function with slide end value based on isValidSlide and isPastBounds tests
      this.slide(
        this.index +
          (isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0),
        this.speed
      );
    }
  },
};

function windowPopup(url, width, height) {
  var left = screen.width / 2 - width / 2,
    top = screen.height / 2 - height / 2;
  window.open(
    url,
    "",
    "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" +
      width +
      ",height=" +
      height +
      ",top=" +
      top +
      ",left=" +
      left
  );
}

jQuery(document).ready(function () {
  // var checkForHeaderMessage = readCookie('geoIPHeaderMessage');
  // // if cookie is set and it hasn't just redirected:
  // if((checkForHeaderMessage == 'closed') && (hasRedirected === -1)) {
  //     document.getElementById('storeViewInformation').style.display = 'none';
  // }

  // Detect newsletter signup page
  if (location.pathname.indexOf("sign-up") != -1) {
    jQuery("#socialRow").addClass("no-newsleter-sign-up");
  }

  // jQuery("#searchToggle").click(function (e) {
  //     jQuery(this).toggleClass("active");
  //     jQuery(".top-links,.search-container").toggleClass("active");
  //     jQuery("#bc-sf-search-box-0").focus().val('');
  //     e.preventDefault();
  //     if(!jQuery(this).hasClass('active')){
  //         jQuery('.bc-sf-search-suggestion-mobile.bc-sf-search-suggestion-wrapper').hide();
  //     }
  // });

  // klevu code part 1
  const searchFunctionality = (e) => {
    // console.log("search functionality works");
    jQuery(".overlay_for_klevu").toggleClass("active");
    jQuery(this).toggleClass("active");
    jQuery(".top-links,.search-container").toggleClass("active");
    //include this line
    jQuery(".input-wrapee input").val("");
    jQuery(".input-wrapee input").focus();
    e.preventDefault();
    pollerLite([".search-container .menu-section.level-1"], () => {
      document.querySelector(
        ".search-container .menu-section.level-1"
      ).style.display = "none";
      document.querySelector(
        ".search-container .menu-section.level-1"
      ).style.opacity = "0";
    });

    if (
      document.querySelector(
        ".search-container .tablet-search-footer .pages-wrapper header"
      )
    ) {
      document
        .querySelector(
          ".search-container .tablet-search-footer .pages-wrapper header"
        )
        .remove();
    }
    document
      .querySelector(".search-container .menu-section.level-0 .result-types")
      ?.remove();
    document
      .querySelector(".search-container .mobile-results .klevuWrap")
      ?.remove();

    if (!jQuery(this).hasClass("active")) {
      if (document.querySelector(".search_result").childElementCount === 0) {
        document.querySelector(
          ".search-container .menu-section.level-1"
        ).style.display = "none";
        document.querySelector(
          ".search-container .menu-section.level-1"
        ).style.opacity = "0";
      }
    }

    document.body.classList.toggle("no-scroll");
  };

  let searchValue = "";

  document
    .querySelector(".search-container .input-wrapee input")
    ?.addEventListener("input", (e) => {
      document.querySelector(
        ".search-container .input-wrapee input + a.button"
      ).href = `/pages/search-results?q=${e.target.value.trim()}`;
      searchValue = e.target.value;
    });

  document
    .querySelector(".search-container .input-wrapee input")
    ?.addEventListener("focus", (e) => {
      if (searchValue !== e.target.value) {
        klevuSearchFn();
      }
    });

  jQuery(".overlay_for_klevu").click(function (e) {
    searchFunctionality(e);
  });

  jQuery(".klevu_close_button").click(function (e) {
    searchFunctionality(e);
  });

  jQuery("#searchToggle").click(function (e) {
    searchFunctionality(e);
  });
  // klevu code part 1

  jQuery(".top-links a.link").hover(
    function () {
      jQuery(this).addClass("opacity");
      jQuery(".top-links").addClass("opacity");
    },
    function () {
      jQuery(".top-links").removeClass("opacity");
      jQuery(this).removeClass("opacity");
    }
  );

  jQuery("#cmsAccordionBlock").each(function () {
    jQuery("#cmsAccordionBlock h4")
      .unbind("click")
      .bind("click", function () {
        if (jQuery(this).hasClass("active")) {
          jQuery(this).removeClass("active").next(".tabContent").slideUp();
        } else {
          jQuery(this).parent().find("> .tabContent").slideUp();
          jQuery(this).parent().find("> h4").removeClass("active");
          jQuery(this).addClass("active").next(".tabContent").slideDown();
        }
      });
  });

  jQuery(".faq-list dt").click(function () {
    jQuery(this).next().slideToggle(200);
    jQuery(this).toggleClass("active");
  });

  var des = jQuery(".descriptionWrapper");
  if (des) {
    jQuery(".more", des).hide();
    jQuery(".read", des).click(function (e) {
      e.preventDefault();
      jQuery(".more", des).slideToggle(200);
      jQuery(".dot", des).toggleClass("active");
      jQuery(".read", des).addClass("active");
      jQuery(this).removeClass("active");
    });

    const header = jQuery(".page-header");

    jQuery(".read-more").on("click", function (e) {
      e.preventDefault();

      const scrollTop =
        jQuery(jQuery(this).attr("href")).position().top - header.outerHeight();

      jQuery("html, body").animate({ scrollTop });
      jQuery("#collection-description-bottom").show();
    });
  }

  jQuery(".footer-links h3").click(function () {
    jQuery(this).next().slideToggle(300);
  });

  jQuery(".currentCurrency").click(function (e) {
    if (e) {
      e.preventDefault();
    }
    jQuery(this).toggleClass("active").next().toggleClass("active");
  });

  jQuery(".collection-filters .title").click(function (e) {
    if (e) {
      e.preventDefault();
    }
    console.log("clicked");
    console.log(jQuery("html").hasClass("filtersShow"));
    if (!jQuery("html").hasClass("filtersShow")) {
      jQuery("html, body").animate(
        { scrollTop: jQuery("#shopify-section-header-style-01").offset().top },
        0
      );
    }
    jQuery("html").toggleClass("filtersShow");
    jQuery(this).toggleClass("active").next().toggleClass("active");
  });

  var des = jQuery(".collect-description");
  if (des) {
    jQuery(".more", des).hide();
    jQuery(".read", des).click(function (e) {
      e.preventDefault();
      jQuery(".more", des).slideToggle(200);
      jQuery(".dot", des).toggleClass("active");
      jQuery(".read", des).addClass("active");
      jQuery(this).removeClass("active");
    });
  }

  jQuery(".selector-wrapper > select").wrap(
    '<div class="selectWrapper"></div>'
  );

  //jQuery('.product-collapse .title-coll:first-of-type').addClass('active');
  //jQuery('.product-collapse .content-coll:first-of-type').show();
  jQuery(".product-collapse .title").click(function () {
    if (jQuery(this).hasClass("active")) {
      jQuery(this).removeClass("active").next(".content").slideUp(200);
    } else {
      jQuery(".product-collapse .content").slideUp(200);
      jQuery(".product-collapse .title").removeClass("active");
      jQuery(this).addClass("active").next(".content").slideDown(200);
    }
  });

  if (jQuery(".slideshow-wrapper .owl-carousel")) {
    jQuery(".slideshow-wrapper .owl-carousel").owlCarousel({
      items: 1,
      loop: true,
      dots: true,
      nav: true,
      navText: [
        "<i class='fa fa-chevron-left'></i>",
        "<i class='fa fa-chevron-right'></i>",
      ],
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: false,
      autoplaySpeed: 2500,
      navSpeed: 2500,
      animateOut: "fadeOut",
    });
  }

  if (jQuery(".productCarousel .owl-carousel")) {
    jQuery(".productCarousel .owl-carousel").owlCarousel({
      loop: true,
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: true,
      autoplaySpeed: 1500,
      stopOnHover: true,
      margin: 0,
      nav: true,
      navText: [
        "<i class='fa fa-chevron-left'></i>",
        "<i class='fa fa-chevron-right'></i>",
      ],
      dots: false,
      responsive: {
        0: {
          items: 1,
          margin: 20,
        },
        768: {
          items: 2,
          margin: 20,
        },
        1024: {
          items: 2,
          margin: 20,
        },
        1200: {
          items: 4,
          margin: 34,
        },
      },
    });
  }

  if (jQuery(".related-products .owl-carousel .item").length > 3) {
    jQuery(".related-products .owl-carousel").owlCarousel({
      loop: true,
      autoplay: false,
      autoplayTimeout: 1000,
      autoplayHoverPause: true,
      autoplaySpeed: 2000,
      stopOnHover: true,
      margin: 0,
      nav: true,
      dots: false,
      responsive: {
        0: {
          items: 1,
          margin: 20,
        },
        768: {
          items: 2,
          margin: 20,
        },
        1024: {
          items: 2,
          margin: 20,
        },
        1200: {
          items: 3,
          margin: 34,
        },
      },
    });
  }

  if (jQuery(".journal-featured-collections .owl-carousel")) {
    jQuery(".journal-featured-collections .owl-carousel").owlCarousel({
      loop: true,
      autoplay: false,
      autoplayTimeout: 1000,
      autoplayHoverPause: true,
      autoplaySpeed: 2000,
      stopOnHover: true,
      margin: 0,
      nav: true,
      dots: false,
      navText: [
        '<i class="fal fa-long-arrow-left"></i>',
        '<i class="fal fa-long-arrow-right"></i>',
      ],
      responsive: {
        0: {
          items: 1,
          margin: 10,
        },
        768: {
          items: 2,
          margin: 20,
        },
        960: {
          items: 3,
          margin: 30,
        },
      },
    });
  }

  if (jQuery(".featrued-blog-section .owl-carousel")) {
    jQuery(".featrued-blog-section .owl-carousel").owlCarousel({
      loop: true,
      autoplay: false,
      autoplayTimeout: 1000,
      autoplayHoverPause: true,
      autoplaySpeed: 2000,
      stopOnHover: true,
      margin: 0,
      nav: true,
      dots: false,
      responsive: {
        0: {
          items: 1,
        },
        767: {
          items: 2,
        },
        1024: {
          items: 4,
        },
      },
    });
  }

  if (jQuery(".product-photo-container .owl-carousel")) {
    jQuery(".product-photo-container .owl-carousel").owlCarousel({
      items: 1,
      loop: false,
      autoplay: false,
      autoplayTimeout: 1000,
      autoplayHoverPause: true,
      autoplaySpeed: 2000,
      stopOnHover: true,
      margin: 0,
      nav: true,
      dots: true,
    });

    jQuery(".product-photo-container .item").featherlightGallery({
      namespace: "product-photos-featherlight-gallery",
      targetAttr: "data-gallery",
      beforeOpen: function (event) {
        jQuery("body").addClass("product-zoom");
      },
      afterOpen: function (event) {
        jQuery(
          ".product-photos-featherlight-gallery-previous,.product-photos-featherlight-gallery-next,.product-photos-featherlight-gallery-close"
        ).appendTo(this.$instance);
        Array.from(
          document.querySelectorAll(
            ".product-photos-featherlight-gallery-content"
          )
        ).forEach(function (el) {
          new PinchZoom.default(el, {});
        });
        window.mySwipe = new Swipe(
          document.querySelector(".product-photos-featherlight-gallery"),
          {
            speed: 400,
          }
        );
      },
      afterClose: function (event) {
        jQuery("body").removeClass("product-zoom");
      },
    });

    if (!jQuery("#menuToggle").is(":visible")) {
      jQuery("body").on(
        "click",
        ".product-photos-featherlight-gallery-content",
        function (e) {
          if (
            !e.target.classList.contains(
              "product-photos-featherlight-gallery-image"
            )
          ) {
            $.featherlight.close();
          }
        }
      );
    }
  }

  function fourSixtyLoadedFallback() {
    fourSixtyOwl();
    window.clearTimeout(fourSixtyRenderedTimeout);
  }

  function fourSixtyOwl() {
    jQuery(".instagram-section .fs-timeline").owlCarousel({
      loop: false,
      autoplay: false,
      autoplayTimeout: 1000,
      autoplayHoverPause: true,
      autoplaySpeed: 2000,
      stopOnHover: true,
      margin: 0,
      nav: true,
      startPosition: 4,
      dots: false,
      responsive: {
        0: {
          items: 1,
        },
        768: {
          items: 3,
        },
        1024: {
          items: 4,
        },
        1280: {
          items: 6,
        },
      },
    });
  }

  if (jQuery("body").hasClass("template-index")) {
    if (jQuery(".instagram-section").length > 0) {
      fourSixtyRenderedTimeout = window.setTimeout(
        fourSixtyLoadedFallback,
        3500
      );
      document
        .querySelector("script[data-feed-id]")
        .addEventListener("foursixtyPageRendered", function (event) {
          window.clearTimeout(fourSixtyRenderedTimeout);
          setTimeout(function () {
            fourSixtyOwl();
          }, 200);
        });
    }
  }

  jQuery("#shareOn a, .lookbookText ul a, .social-share ul li a").on(
    "click",
    function (e) {
      if (e) {
        e.preventDefault();
      }
      if (jQuery(this).hasClass("pin")) {
        // pinterest needs a larger popup:
        windowPopup(jQuery(this).attr("href"), 750, 552);
      } else {
        windowPopup(jQuery(this).attr("href"), 500, 300);
      }
    }
  );

  if (jQuery("#fullRegisterBirthday").length > 0) {
    jQuery(".accountBirthdaySignup").on("change", function () {
      var fullBirthday =
        jQuery("#birthdayDay").val() +
        "/" +
        jQuery("#birthdayMonth").val() +
        "/" +
        jQuery("#birthdayYear").val();
      console.log(fullBirthday);
      jQuery("#fullRegisterBirthday").val(fullBirthday);
    });
  }

  jQuery("body").on("click", "button.js-qty__adjust--plus", function (e) {
    //  var line = parseInt(jQuery(this).parents('tr').index(),10)+1;
    var line = jQuery(this).parents("tr").find("button.remove").data("line");
    line = parseInt(line, 10);
    var quantity = jQuery(this).prev().val();
    if ($(this).closest("tr.line-item[data-personalisation='true']").length) {
      let remainingChargeItem = $(
        "tr.personalisation-charge .bag-qty input"
      ).val();
      remainingChargeItem = parseInt(remainingChargeItem) - 1;
      console.log(line, quantity, remainingChargeItem);
      // First line item update
      window.location.href = `/cart/change?line=${line}&quantity=${quantity}`;
      // After the first update completes, use setTimeout to delay the second request slightly
      let line2 = $("tr.personalisation-charge").data("line");
      line2 = parseInt(line2, 10);
      let quantity2 = remainingChargeItem;
      setTimeout(() => {
        window.location.href = `/cart/change?line=${line2}&quantity=${quantity2}`;
      }, 1000);
    } else {
      window.location.href = `/cart/change?line=${line}&quantity=${quantity}`;
    }
  });

  jQuery("body").on("click", "button.js-qty__adjust--minus", function (e) {
    // var line = parseInt(jQuery(this).parents('tr').index(),10)+1;

    var line = jQuery(this).parents("tr").find("button.remove").data("line");
    line = parseInt(line, 10);

    var quantity = jQuery(this).next().val();
    if (quantity < 0) {
      quantity = 0;
    }
    if ($(this).closest("tr.line-item[data-personalisation='true']").length) {
      let remainingChargeItem = $(
        "tr.personalisation-charge .bag-qty input"
      ).val();
      remainingChargeItem = parseInt(remainingChargeItem) - 1;
      let line2 = $("tr.personalisation-charge").data("line");
      line2 = parseInt(line2, 10);
      let quantity2 = remainingChargeItem;
      const updates = {
        [line]: quantity,
        [line2]: quantity2,
      };

      $.ajax({
        url: "/cart/update.js",
        method: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ updates }),
        success: function (response) {
          console.log("Cart updated successfully:", response);
          // Optionally, you could refresh the cart or redirect here
          location.reload();
        },
        error: function (error) {
          console.error("Error updating cart:", error);
        },
      });
      // setTimeout(() => {
      //   window.location.href = `/cart/change?line=${line2}&quantity=${quantity2}`;
      // }, 1000);
    } else {
      window.location.href = `/cart/change?line=${line}&quantity=${quantity}`;
    }
  });

  function triggerFlourishAnimation() {
    hasShownTheFlourish = true;
    var path = document.querySelector("#newsletterFlourish path");
    var length = path.getTotalLength();

    // Clear any previous transition
    path.style.transition = path.style.WebkitTransition = "none";
    // Set up the starting positions
    path.style.strokeDasharray = length + " " + length;
    path.style.strokeDashoffset = 0 - length * 0.52;
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    path.getBoundingClientRect();
    // Define our transition
    path.style.transition = path.style.WebkitTransition =
      "stroke-dashoffset 2.5s ease-in";
    // Go!
    path.style.strokeDashoffset = "0";
  }

  var hasShownTheFlourish = false;

  function handleIntersect(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio > 0) {
        if (!hasShownTheFlourish) {
          triggerFlourishAnimation();
        }
      }
    });
  }

  function checkScrolledAmount() {
    var currentScroll = jQuery(window).scrollTop();

    if (currentScroll >= scrollDistanceBeforeHide) {
      jQuery("body").addClass("scrolledBeyond");
    } else {
      jQuery("body").removeClass("scrolledBeyond");
    }

    var bodytHeight = jQuery(document).height();
    var footerHeight = jQuery("#shopify-section-footer").height();

    if (bodytHeight - currentScroll < footerHeight + viewportHeight) {
      jQuery("body").addClass("scrolledFooter");
    } else {
      jQuery("body").removeClass("scrolledFooter");
    }
  }

  newsletterFlourish = document.getElementById("newsletterFlourish");
  //var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

  if (!jQuery("#menuToggle").is(":visible")) {
    var observer, observer2;
    var observerOptions = {
      root: null,
      rootMargin: "100px 0px",
      threshold: 1.0,
    };

    if (newsletterFlourish) {
      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(handleIntersect, observerOptions);
        observer.observe(newsletterFlourish);
        // secondHomeBanner = document.querySelectorAll(                "#MainContent .shopify-section"            )[1];
      }
    }

    if (!jQuery("#menuToggle").is(":visible")) {
      var scrollTimeout;

      var visibleNavHeight = jQuery("#nav-ul .level0.shop ul.level1").height();
      var viewportHeight = jQuery(window).height();
      var scrollDistanceBeforeHide = viewportHeight - visibleNavHeight;

      checkScrolledAmount();
      jQuery(window).on("scroll", function () {
        //console.log( jQuery(this).scrollTop() );
        if (!scrollTimeout) {
          scrollTimeout = setTimeout(function () {
            checkScrolledAmount();
            scrollTimeout = null;
          }, 100);
        }
      });
    }
  }

  // quick buy:
  jQuery(".quickBuy").click(function (e) {
    if (e) {
      e.preventDefault();
    }
    thisQuickButton = jQuery(this).parent().parent();

    var variantId = jQuery(this).data("variantid");

    jQuery
      .get(thisQuickButton.siblings("a").attr("href") + ".json")
      .done(function (data) {
        var product = data.product;
        var selectedVariants = product.variants.filter(function (variant) {
          return variant.id === variantId;
        });
        if (selectedVariants.length) {
          var selectedVariant = selectedVariants[0];
          var gtmData = {
            name: product.title,
            brand: product.vendor,
            category: product.product_type,
            id: selectedVariant.sku,
            price: selectedVariant.price,
            variant: selectedVariant.title,
            quantity: 1,
          };

          // if (window.GTMFunctions && window.GTMFunctions.addToCart) {
          //     window.GTMFunctions.addToCart(gtmData);
          // }

          // Create or push data to the dataLayer
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              currency: window.Shopify.currency.active,
              value: selectedVariant.price,
              items: [
                {
                  item_id: product.id,
                  item_name: product.title,
                  item_price: selectedVariant.price,
                  item_brand: product.vendor,
                  item_variant: selectedVariant.title,
                  quantity: 1,
                },
              ],
            },
          });

          // Trigger a custom event
          $(document).trigger("add_to_cart");
        }
      });

    jQuery
      .post(
        "/cart/add.js",
        {
          quantity: 1,
          id: jQuery(this).data("variantid"),
        },
        null,
        "json"
      )
      .done(function (data) {
        if (data.product_title) {
          // jQuery('<p class="form--success quickBuySuccess">Added ' + data.product_title + ' to your cart</p>').insertAfter(thisQuickButton).delay(2500).fadeOut(3000);

          jQuery('<p class="quickBuySuccess">Added to bag</p>')
            .insertBefore(thisQuickButton)
            .delay(2500)
            .fadeOut(3000);
          document.documentElement.classList.add("offCanvasBasket");
          juno.basketIsRevealed = true;
          setTimeout(function () {
            document.documentElement.classList.remove("offCanvasBasket");
            juno.basketIsRevealed = false;
          }, 5000);
        }

        ajaxCart.load();
      })
      .fail(function (data) {
        // console.log(data);
        // error handling
        if (data.responseJSON.description) {
          //thisQuickButton.parent().append('<p class="quickBuyError">' + data.responseJSON.description + '</p>').delay(2500).fadeOut(3000);

          jQuery(
            '<p class="quickBuyError">' + data.responseJSON.description + "</p>"
          )
            .insertBefore(thisQuickButton)
            .delay(2500)
            .fadeOut(3000);

          // jQuery('<p class="form--error quickBuyError">' + data.responseJSON.description + '</p>').insertAfter(thisQuickButton).delay(2500).fadeOut(3000);
        }
      });
  });

  jQuery("a.pressClippingLink").click(function (e) {
    if (e) {
      e.preventDefault();
    }
    $.featherlight(jQuery(this).next().next(), { variant: "pressLightbox" });
  });

  jQuery("#cmInToggle li").click(function (e) {
    if (e) {
      e.preventDefault();
    }
    jQuery("#cmInTable table").attr("class", "show" + jQuery(this).attr("id"));
    jQuery("#cmInToggle li").removeClass("active");
    jQuery(this).addClass("active");
  });

  if (jQuery(window).width() < 421) {
    jQuery('#contact_form .input-group input[type="email"]').attr(
      "placeholder",
      "Enter your email address here"
    );
  }

  // show cart when item added:
  jQuery("#product-add button").click(function (e) {
    document.documentElement.classList.add("offCanvasBasket");
    juno.basketIsRevealed = true;

    setTimeout(function () {
      document.documentElement.classList.remove("offCanvasBasket");
      juno.basketIsRevealed = false;
    }, 5000);
  });

  jQuery("#backToTopLink").click(function (e) {
    if (e) {
      e.preventDefault();
    }

    jQuery("html, body").animate({ scrollTop: 0 }, 450);
  });

  jQuery("#geoLocationClose").click(function (e) {
    if (e) {
      e.preventDefault();
    }
    jQuery("#storeViewInformation").hide();
    createCookie("geoIPHeaderMessage", "closed", 31);
  });

  relocationURL = "";

  jQuery("body").on("click", ".storeSelectDropdown label", function (e) {
    e.preventDefault();
    jQuery(this).toggleClass("active").next().slideToggle(200);
  });

  jQuery("body").on("click", ".storeSelectDropdown li", function (e) {
    e.preventDefault();
    var variantSize = jQuery(this).find("span").text();
    jQuery(this)
      .parent()
      .slideToggle(200)
      .prev()
      .text(variantSize)
      .toggleClass("active")
      .data("size", variantSize);
    relocationURL = jQuery(this).data("href");
  });

  jQuery("body").on("click", "#multiStoreSwitcherSubmit", function (e) {
    e.preventDefault();
    if (relocationURL != "") {
      window.location.href = relocationURL;
    } else {
      $.featherlight.close();
    }
  });

  jQuery("body").on("click", "#ajaxCartContinueShopping", function (e) {
    if (e) {
      e.preventDefault();
    }
    juno.checkToggleBasketNavigation();
  });

  if (jQuery("body").hasClass("template-collection")) {
    if (window.localStorage) {
      localStorage.setItem(
        "lastCollection",
        jQuery("body").data("collection-handle")
      );
    }
  }

  if (jQuery("body").hasClass("template-cart")) {
    if (window.localStorage) {
      if (localStorage.getItem("lastCollection")) {
        jQuery(".shopping-bag .return .button-text").click(function (e) {
          if (e) {
            e.preventDefault();
          }
          location = "/collections/" + localStorage.getItem("lastCollection");
        });
      }
    }
  }
});

window.FeatherLightafterOpen = function () {
  // fix tabindex on forms within Feather Light
  // called with eg:
  // <a href="#" class="button button-primary" data-featherlight="#mc_embed_signup" data-featherlight-variant="joinUs" data-featherlight-after-open="FeatherLightafterOpen()">Join us</a>
  var count = 1;
  jQuery("body > .featherlight")
    .find("input")
    .each(function () {
      jQuery(this).attr("tabindex", count++);
    });
};

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//klevu code part 2
function clickHandler() {
  document
    .querySelector(".search-container")
    .addEventListener("click", ({ target }) => {
      const parentElem = target.closest(".result-item");
      const type = parentElem?.getAttribute("data-klevu-attr");
      if (parentElem && type) {
        document
          .querySelectorAll(".search-container .level-0 .result-item.active")
          .forEach((item) => {
            item.classList.remove("active");
          });

        parentElem.classList.add("active");

        if (type === "productList") {
          if (
            document.querySelector(
              `.search-container .results-wrapper .klevuSuggestionsBlock`
            )
          ) {
            document.querySelector(
              `.search-container .results-wrapper .klevuSuggestionsBlock`
            ).style.display = "none";
          }
          if (
            document.querySelector(
              `.search-container .results-wrapper #productList`
            )
          ) {
            document.querySelector(
              `.search-container .results-wrapper #productList`
            ).style.display = "block";
          }
        } else {
          const sections = document.querySelectorAll(
            `.search-container .results-wrapper .klevuSuggestionsBlock div`
          );
          sections.length &&
            sections.forEach((item) => {
              item.style.display = "none";
            });
          if (
            document.querySelector(
              `.search-container .results-wrapper #productList`
            )
          ) {
            document.querySelector(
              `.search-container .results-wrapper #productList`
            ).style.display = "none";
          }
          if (
            document.querySelector(
              `.search-container .results-wrapper .klevuSuggestionsBlock`
            )
          ) {
            document.querySelector(
              `.search-container .results-wrapper .klevuSuggestionsBlock`
            ).style.display = "block";
          }
          if (
            document.querySelector(
              `.search-container .results-wrapper .klevuSuggestionsBlock div[id="${type}"]`
            )
          ) {
            document.querySelector(
              `.search-container .results-wrapper .klevuSuggestionsBlock div[id="${type}"]`
            ).style.display = "block";
          }
        }
      }
    });
}

function klevuSearchFn() {
  pollerLite(
    [
      ".klevu-fluid",
      () =>
        document.querySelector(
          "#klevu-quick-search-theme-templates ~ .klevu-fluid"
        ).style.display === "block",
    ],
    () => {
      //console.log('replacement process start');
      document.querySelector(".search_result > .klevuWrap")?.remove();
      document
        .querySelector(".search_result")
        .classList.add("search-result-active");
      if (!document.querySelector(".search_result > .klevuWrap")) {
        //console.log('first');
        setTimeout(() => {
          pollerLite(
            [
              ".klevu-fluid .klevuWrap",
              () =>
                !document.querySelector(
                  ".klevu-fluid .klevuWrap .kuSearchPersonalizationsContainer"
                ),
            ],
            () => {
              //console.log('need to hide');
              if (document.querySelector(".klevu-fluid .klevuWrap")) {
                //console.log(document.querySelector('.klevu-fluid .klevuWrap'));
                if (
                  document.querySelector(".search-container input").value === ""
                ) {
                  //console.log('yess need to hide');
                  pollerLite(
                    [".search-container.active .menu-section.level-1"],
                    () => {
                      document.querySelector(
                        ".search-container.active .menu-section.level-1"
                      ).style.display = "none";
                      document.querySelector(
                        ".search-container .menu-section.level-1"
                      ).style.opacity = "0";
                      if (
                        document.querySelector(
                          ".search-container .tablet-search-footer .pages-wrapper header"
                        )
                      ) {
                        document
                          .querySelector(
                            ".search-container .tablet-search-footer .pages-wrapper header"
                          )
                          .remove();
                      }

                      document
                        .querySelector(
                          ".search-container .menu-section.level-0 .result-types"
                        )
                        ?.remove();
                      document
                        .querySelector(
                          ".search-container .mobile-results .klevuWrap"
                        )
                        ?.remove();
                    }
                  );
                } else {
                  if (!document.querySelector(".search_result > .klevuWrap")) {
                    const cloneElementForDesktop = document
                      .querySelector(".klevu-fluid .klevuWrap")
                      .cloneNode(true);
                    const cloneElementForMobile = document
                      .querySelector(".klevu-fluid .klevuWrap")
                      .cloneNode(true);

                    //desktop
                    document
                      .querySelector(".search_result")
                      .insertAdjacentElement(
                        "beforeend",
                        cloneElementForDesktop
                      );
                    //tablet
                    const headerPartForTablet = document
                      .querySelector(
                        '.search-container .level-1 #klevuSearchingArea div[data-container-id="ku_quick_main_container"] header'
                      )
                      .cloneNode(true);
                    const selectorForTablet = document.querySelector(
                      ".search-container .tablet-search-footer .pages-wrapper .tablet-container .help-block"
                    );
                    if (
                      document.querySelector(
                        ".search-container .tablet-search-footer .pages-wrapper header"
                      )
                    ) {
                      document
                        .querySelector(
                          ".search-container .tablet-search-footer .pages-wrapper header"
                        )
                        .remove();
                    }
                    selectorForTablet.insertAdjacentElement(
                      "beforebegin",
                      headerPartForTablet
                    );
                    //mobile
                    pollerLite(
                      [".klevu-fluid .klevuWrap .result-types"],
                      () => {
                        const cloneElementForMobileOption = document
                          .querySelector(
                            ".klevu-fluid .klevuWrap .result-types"
                          )
                          .cloneNode(true);
                        if (
                          !document.querySelector(
                            ".search-container .level-0 .result-types"
                          )
                        ) {
                          document
                            .querySelector(".search-container .mobile-results")
                            .insertAdjacentElement(
                              "beforebegin",
                              cloneElementForMobileOption
                            );
                        } else {
                          document
                            .querySelector(
                              ".search-container .level-0 .result-types"
                            )
                            .remove();
                          document
                            .querySelector(".search-container .mobile-results")
                            .insertAdjacentElement(
                              "beforebegin",
                              cloneElementForMobileOption
                            );
                        }
                      }
                    );

                    if (
                      !document.querySelector(
                        ".search-container .mobile-results .klevuWrap"
                      )
                    ) {
                      document
                        .querySelector(
                          ".search-container .mobile-results .mobile-wrapper .help-block"
                        )
                        .insertAdjacentElement(
                          "beforebegin",
                          cloneElementForMobile
                        );
                    } else {
                      document
                        .querySelector(
                          ".search-container .mobile-results .klevuWrap"
                        )
                        .remove();
                      document
                        .querySelector(
                          ".search-container .mobile-results .mobile-wrapper .help-block"
                        )
                        .insertAdjacentElement(
                          "beforebegin",
                          cloneElementForMobile
                        );
                    }
                    setTimeout(() => {
                      pollerLite(
                        [".search-container .menu-section.level-1 .klevuWrap"],
                        () => {
                          //console.log('got it');
                          document.querySelector(
                            ".search-container .menu-section.level-1"
                          ).style.display = "block";
                          document.querySelector(
                            ".search-container .menu-section.level-1"
                          ).style.opacity = "1";
                        }
                      );
                    }, 10);
                  }
                  pollerLite(
                    [
                      "body .search-container .level-1 .kuQuickSearchNoRecordFound",
                    ],
                    () => {
                      if (
                        document.querySelector(
                          ".search-container .tablet-search-footer .pages-wrapper header"
                        )
                      ) {
                        document
                          .querySelector(
                            ".search-container .tablet-search-footer .pages-wrapper header"
                          )
                          .remove();
                      }

                      document
                        .querySelector(
                          ".search-container .menu-section.level-0 .result-types"
                        )
                        ?.remove();
                    }
                  );
                  pollerLite(
                    [
                      () =>
                        document.querySelector(
                          "body .mega-menu.level-1 .klevuSuggestionsBlock"
                        ) &&
                        document.querySelector(
                          "body .mega-menu.level-1 .klevuSuggestionsBlock"
                        ).childElementCount == 0,
                    ],
                    () => {
                      //console.log('section will be none');
                      document
                        .querySelector(
                          "body .mega-menu.level-1 .klevuSuggestionsBlock"
                        )
                        .closest("header")
                        .classList.add("custom-hidden");
                    }
                  );
                }
              }

              pollerLite(
                [".search-container .level-0 .result-item.active"],
                () => {
                  const selectCategory = document
                    .querySelector(
                      ".search-container .level-0 .result-item.active"
                    )
                    .getAttribute("data-klevu-attr");
                  if (selectCategory === "productList") {
                  } else {
                    document.querySelector(
                      `.search-container .results-wrapper .klevuSuggestionsBlock div[id="${selectCategory}"]`
                    ).style.display = "block";
                  }
                }
              );
              return;
            }
          );
          pollerLite(
            [
              ".klevu-fluid .klevuWrap",
              () =>
                document.querySelector(
                  ".klevu-fluid .klevuWrap .kuSearchPersonalizationsContainer"
                ),
            ],
            () => {
              //console.log(document.querySelector('.klevu-fluid .klevuWrap'), 'element');
              document.querySelector(
                ".search-container .menu-section.level-1"
              ).style.display = "none";
              document.querySelector(
                ".search-container .menu-section.level-1"
              ).style.opacity = "0";
              if (
                document.querySelector(
                  ".search-container .tablet-search-footer .pages-wrapper header"
                )
              ) {
                document
                  .querySelector(
                    ".search-container .tablet-search-footer .pages-wrapper header"
                  )
                  .remove();
              }
              document
                .querySelector(
                  ".search-container .menu-section.level-0 .result-types"
                )
                ?.remove();
              document
                .querySelector(".search-container .mobile-results .klevuWrap")
                ?.remove();
            }
          );
        }, 1700); //1700
      }
    }
  );
}

pollerLite([".search-container .icon-submit"], () => {
  const targetNode = document.querySelector(".search-container .icon-submit");
  const config = { attributes: true, childList: false, subtree: false };
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      // console.log(mutation);
      if (mutation.type === "attributes") {
        setTimeout(() => {
          klevuSearchFn();
        }, 200);
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
});

clickHandler();
//klevu code part 2

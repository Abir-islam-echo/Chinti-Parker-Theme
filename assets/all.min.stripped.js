function addClass(t, e) {
    t.classList ? t.classList.add(e) : t.className += " " + e
}

function removeClass(t, e) {
    t.classList ? t.classList.remove(e) : t.className = t.className.replace(new RegExp("(^|\\b)" + e.split(" ").join("|") + "(\\b|$)", "gi"), " ")
}

function hasParent(t, e) {
    if (t)
        do {
            if (t.id === e) return !0;
            if (9 === t.nodeType) break
        } while (t = t.parentNode);
    return !1
}

function windowPopup(t, e, i) {
    var s = screen.width / 2 - e / 2,
        n = screen.height / 2 - i / 2;
    window.open(t, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + e + ",height=" + i + ",top=" + n + ",left=" + s)
}

function setCookie(t, e, i) {
    var s = new Date;
    s.setTime(s.getTime() + 24 * i * 60 * 60 * 1e3);
    var n = "expires=" + s.toUTCString();
    document.cookie = t + "=" + e + ";" + n + ";path=/"
}

function getCookie(t) {
    for (var e = t + "=", i = document.cookie.split(";"), s = 0; s < i.length; s++) {
        for (var n = i[s];
            " " == n.charAt(0);) n = n.substring(1);
        if (0 == n.indexOf(e)) return n.substring(e.length, n.length)
    }
    return ""
}
var juno = {},
    cutsTheMustard = !1;
"querySelector" in document && "localStorage" in window && "addEventListener" in window && (cutsTheMustard = !0, document.documentElement.className = "js");
var defaultNavToShow = "";
jQuery(document).ready(function() {
        if (!jQuery("#menuToggle").is(":visible")) {
            if (jQuery("body").hasClass("template-collection")) {
                var t = !1;
                "sale" == jQuery("body").attr("id") && jQuery(".product-grid .item").length < 1 && (t = !0), t ? jQuery("body").removeClass("mainNavOver") : (defaultNavToShow = "shop", jQuery(".innerCurrentActive").length > 0 ? defaultNavToShow = jQuery(".innerCurrentActive").parents("li.level0").attr("id").substring(6) : jQuery(".innerCurrent").length > 0 && (defaultNavToShow = jQuery(".innerCurrent").parents("li.level0").attr("id").substring(6)), jQuery("#nav-ul li.level0." + defaultNavToShow).addClass("activeHover").hover(function() {
                    jQuery(this).hasClass("activeHover") && jQuery("body").addClass("mainNavOver")
                }, function() {
                    jQuery(this).hasClass("activeHover") && jQuery("body").removeClass("mainNavOver")
                }), jQuery("body").addClass("mainNavOver"))
            }
            jQuery("#navigation li.level0").hover(function() {
                jQuery(this).addClass("liHover").parent().addClass("parentHover"), jQuery(this).hasClass("parent") ? (jQuery("body").addClass("mainNavOver"), "" != defaultNavToShow && jQuery("#nav-ul li.level0." + defaultNavToShow).removeClass("activeHover"), jQuery(this).addClass("activeHover")) : (jQuery("#nav-ul li.level0").removeClass("activeHover"), jQuery("body").removeClass("mainNavOver"))
            }, function() {
                jQuery(this).removeClass("liHover activeHover").parent().removeClass("parentHover"), "" != defaultNavToShow && jQuery("#nav-ul li.level0." + defaultNavToShow).addClass("activeHover"), jQuery("body").removeClass("mainNavOver")
            })
        }
        jQuery("#navigation a.level0.parent").click(function(t) {
            jQuery("#menuToggle").is(":visible") && (t && t.preventDefault(), jQuery(this).parent().addClass("isOpen").parent().parent().addClass("isOpen"))
        }), jQuery("#navigation a.level1.parent").click(function(t) {
            jQuery("#menuToggle").is(":visible") && (t && t.preventDefault(), jQuery(this).parent().addClass("isOpen").parent().parent().parent().addClass("isOpen"))
        }), jQuery("#navigation a.level1.back").click(function(t) {
            jQuery("#menuToggle").is(":visible") && (t && t.preventDefault(), jQuery(this).parent().parent().parent().parent().parent().removeClass("isOpen").parent().parent().removeClass("isOpen"))
        }), jQuery("#navigation a.level2.back").click(function(t) {
            jQuery("#menuToggle").is(":visible") && (t && t.preventDefault(), jQuery(this).parent().parent().parent().parent().removeClass("isOpen").parent().parent().parent().removeClass("isOpen"))
        })
    }), cutsTheMustard && (juno.navigationIsRevealed = !1, juno.basketIsRevealed = !1, document.getElementById("menuToggle").addEventListener("click", function(t) {
        juno.checkToggleNavigation(), t && t.preventDefault()
    }, !1), document.getElementById("basketToggle").addEventListener("click", function(t) {
        juno.checkToggleBasketNavigation(), t && t.preventDefault()
    }, !1), juno.checkToggleNavigation = function() {
        juno.navigationIsRevealed ? (removeClass(document.documentElement, "offCanvas"), juno.navigationIsRevealed = !1) : (addClass(document.documentElement, "offCanvas"), juno.navigationIsRevealed = !0)
    }, juno.checkToggleBasketNavigation = function() {
        juno.basketIsRevealed ? (removeClass(document.documentElement, "offCanvasBasket"), juno.basketIsRevealed = !1) : (addClass(document.documentElement, "offCanvasBasket"), juno.basketIsRevealed = !0)
    }, juno.checkCloseNavigation = function(t) {
        juno.navigationIsRevealed && ("menuToggle" == t.target.id || hasParent(t.target, "menuToggle") || hasParent(t.target, "navigation") || (removeClass(document.documentElement, "offCanvas"), juno.navigationIsRevealed = !1, t.preventDefault()))
    }, juno.checkCloseBasketNavigation = function(t) {
        juno.basketIsRevealed && "basketToggle" != t.target.id && (hasParent(t.target, "cart-container") || (removeClass(document.documentElement, "offCanvasBasket"), juno.basketIsRevealed = !1))
    }, document.addEventListener("click", function(t) {
        juno.checkCloseNavigation(t), juno.checkCloseBasketNavigation(t)
    }, !0), document.addEventListener("touchend", function(t) {
        juno.checkCloseNavigation(t), juno.checkCloseBasketNavigation(t)
    }), juno.swipeLeft = function() {
        juno.navigationIsRevealed && (removeClass(document.documentElement, "offCanvas"), juno.navigationIsRevealed = !1)
    }, juno.swipeRight = function() {
        juno.basketIsRevealed && (removeClass(document.documentElement, "offCanvasBasket"), juno.basketIsRevealed = !1)
    }, "ontouchstart" in document.documentElement && (document.body.addEventListener("touchstart", function(t) {
        startPointX = t.touches[0].pageX, startPointY = t.touches[0].pageY, isScrolling = "", deltaX = 0
    }, !1), document.body.addEventListener("touchmove", function(t) {
        t.touches.length > 1 || t.scale && 1 !== t.scale || (deltaX = t.touches[0].pageX - startPointX, "" === isScrolling && (isScrolling = isScrolling || Math.abs(deltaX) < Math.abs(t.touches[0].pageY - startPointY)), isScrolling || t.preventDefault())
    }, !1), document.body.addEventListener("touchend", function(t) {
        isScrolling || Math.abs(deltaX) > 100 && (deltaX < 0 ? juno.swipeLeft() : juno.swipeRight())
    }, !1))),

    jQuery(document).ready(function() {
        function t() {
            e(), window.clearTimeout(fourSixtyRenderedTimeout)
        }

        function e() {
            jQuery(".instagram-section .fs-timeline").owlCarousel({
                loop: !1,
                autoplay: !1,
                autoplayTimeout: 1e3,
                autoplayHoverPause: !0,
                autoplaySpeed: 2e3,
                stopOnHover: !0,
                margin: 0,
                nav: !0,
                startPosition: 4,
                dots: !1,
                responsive: {
                    0: {
                        items: 1
                    },
                    768: {
                        items: 3
                    },
                    1024: {
                        items: 4
                    },
                    1280: {
                        items: 6
                    }
                }
            })
        }

        function i() {
            r = !0;
            var t = document.querySelector("#newsletterFlourish path"),
                e = t.getTotalLength();
            t.style.transition = t.style.WebkitTransition = "none", t.style.strokeDasharray = e + " " + e, t.style.strokeDashoffset = 0 - .52 * e, t.getBoundingClientRect(), t.style.transition = t.style.WebkitTransition = "stroke-dashoffset 2.5s ease-in", t.style.strokeDashoffset = "0"
        }

        function s(t, e) {
            t.forEach(function(t) {
                t.intersectionRatio > 0 && (r || i())
            })
        }

        function n() {
            var t = jQuery(window).scrollTop();
            t >= d ? jQuery("body").addClass("scrolledBeyond") : jQuery("body").removeClass("scrolledBeyond"), jQuery(document).height() - t < jQuery("#shopify-section-footer").height() + u ? jQuery("body").addClass("scrolledFooter") : jQuery("body").removeClass("scrolledFooter")
        }
        "closed" == readCookie("geoIPHeaderMessage") && -1 === hasRedirected && (document.getElementById("storeViewInformation").style.display = "none"), -1 != location.pathname.indexOf("sign-up") && jQuery("#socialRow").addClass("no-newsleter-sign-up"), jQuery("#searchToggle").click(function(t) {
            jQuery(this).toggleClass("active"), jQuery(".top-links,.search-container").toggleClass("active"), jQuery("#bc-sf-search-box-0").focus().val(""), t.preventDefault(), jQuery(this).hasClass("active") || jQuery(".bc-sf-search-suggestion-mobile.bc-sf-search-suggestion-wrapper").hide()
        }), jQuery(".top-links a.link").hover(function() {
            jQuery(this).addClass("opacity"), jQuery(".top-links").addClass("opacity")
        }, function() {
            jQuery(".top-links").removeClass("opacity"), jQuery(this).removeClass("opacity")
        }), jQuery("#cmsAccordionBlock").each(function() {
            jQuery("#cmsAccordionBlock h4").unbind("click").bind("click", function() {
                jQuery(this).hasClass("active") ? jQuery(this).removeClass("active").next(".tabContent").slideUp() : (jQuery(this).parent().find("> .tabContent").slideUp(), jQuery(this).parent().find("> h4").removeClass("active"), jQuery(this).addClass("active").next(".tabContent").slideDown())
            })
        }), jQuery(".faq-list dt").click(function() {
            jQuery(this).next().slideToggle(200), jQuery(this).toggleClass("active")
        });
        var o = jQuery(".descriptionWrapper");
        o && (jQuery(".more", o).hide(), jQuery(".read", o).click(function(t) {
            t.preventDefault(), jQuery(".more", o).slideToggle(200), jQuery(".dot", o).toggleClass("active"), jQuery(".read", o).addClass("active"), jQuery(this).removeClass("active")
        })), jQuery(".footer-links h3").click(function() {
            jQuery(this).next().slideToggle(300)
        }), jQuery(".currentCurrency").click(function(t) {
            t && t.preventDefault(), jQuery(this).toggleClass("active").next().toggleClass("active")
        }), jQuery(".collection-filters .title").click(function(t) {
            t && t.preventDefault(), console.log("clicked"), console.log(jQuery("html").hasClass("filtersShow")), jQuery("html").hasClass("filtersShow") || jQuery("html, body").animate({
                scrollTop: jQuery("#shopify-section-header").offset().top
            }, 0), jQuery("html").toggleClass("filtersShow"), jQuery(this).toggleClass("active").next().toggleClass("active")
        });
        var o = jQuery(".collect-description");
        o && (jQuery(".more", o).hide(), jQuery(".read", o).click(function(t) {
            t.preventDefault(), jQuery(".more", o).slideToggle(200), jQuery(".dot", o).toggleClass("active"), jQuery(".read", o).addClass("active"), jQuery(this).removeClass("active")
        })), jQuery(".selector-wrapper > select").wrap('<div class="selectWrapper"></div>'), jQuery(".product-collapse .title").click(function() {
            jQuery(this).hasClass("active") ? jQuery(this).removeClass("active").next(".content").slideUp(200) : (jQuery(".product-collapse .content").slideUp(200), jQuery(".product-collapse .title").removeClass("active"), jQuery(this).addClass("active").next(".content").slideDown(200))
        }), jQuery(".slideshow-wrapper .owl-carousel") && jQuery(".slideshow-wrapper .owl-carousel").owlCarousel({
            items: 1,
            loop: !0,
            nav: !1,
            dots: !0,
            autoplay: !0,
            autoplayTimeout: 6e3,
            autoplayHoverPause: !0,
            autoplaySpeed: 1500,
            navSpeed: 1500,
            animateOut: "fadeOut"
        }), jQuery(".productCarousel .owl-carousel") && jQuery(".productCarousel .owl-carousel").owlCarousel({
            loop: !0,
            autoplay: !1,
            autoplayTimeout: 1e3,
            autoplayHoverPause: !0,
            autoplaySpeed: 2e3,
            stopOnHover: !0,
            margin: 0,
            nav: !1,
            dots: !0,
            responsive: {
                0: {
                    items: 1,
                    margin: 20
                },
                768: {
                    items: 2,
                    margin: 20
                },
                1024: {
                    items: 2,
                    margin: 20
                },
                1200: {
                    items: 4,
                    margin: 34
                }
            }
        }), jQuery(".related-products .owl-carousel .item").length > 3 && jQuery(".related-products .owl-carousel").owlCarousel({
            loop: !0,
            autoplay: !1,
            autoplayTimeout: 1e3,
            autoplayHoverPause: !0,
            autoplaySpeed: 2e3,
            stopOnHover: !0,
            margin: 0,
            nav: !0,
            dots: !1,
            responsive: {
                0: {
                    items: 1,
                    margin: 20
                },
                768: {
                    items: 2,
                    margin: 20
                },
                1024: {
                    items: 2,
                    margin: 20
                },
                1200: {
                    items: 3,
                    margin: 34
                }
            }
        }), jQuery(".journal-featured-collections .owl-carousel") && jQuery(".journal-featured-collections .owl-carousel").owlCarousel({
            loop: !0,
            autoplay: !1,
            autoplayTimeout: 1e3,
            autoplayHoverPause: !0,
            autoplaySpeed: 2e3,
            stopOnHover: !0,
            margin: 0,
            nav: !0,
            dots: !1,
            navText: ['<i class="fal fa-long-arrow-left"></i>', '<i class="fal fa-long-arrow-right"></i>'],
            responsive: {
                0: {
                    items: 1,
                    margin: 10
                },
                768: {
                    items: 2,
                    margin: 20
                },
                960: {
                    items: 3,
                    margin: 30
                }
            }
        }), jQuery(".featrued-blog-section .owl-carousel") && jQuery(".featrued-blog-section .owl-carousel").owlCarousel({
            loop: !0,
            autoplay: !1,
            autoplayTimeout: 1e3,
            autoplayHoverPause: !0,
            autoplaySpeed: 2e3,
            stopOnHover: !0,
            margin: 0,
            nav: !0,
            dots: !1,
            responsive: {
                0: {
                    items: 1
                },
                767: {
                    items: 2
                },
                1024: {
                    items: 4
                }
            }
        }), jQuery(".product-photo-container .owl-carousel") && (jQuery(".product-photo-container .owl-carousel").owlCarousel({
            items: 1,
            loop: !1,
            autoplay: !1,
            autoplayTimeout: 1e3,
            autoplayHoverPause: !0,
            autoplaySpeed: 2e3,
            stopOnHover: !0,
            margin: 0,
            nav: !0,
            dots: !0
        }), jQuery(".product-photo-container .item").featherlightGallery({
            namespace: "product-photos-featherlight-gallery",
            targetAttr: "data-gallery",
            beforeOpen: function(t) {
                jQuery("body").addClass("product-zoom")
            },
            afterOpen: function(t) {
                jQuery(".product-photos-featherlight-gallery-previous,.product-photos-featherlight-gallery-next,.product-photos-featherlight-gallery-close").appendTo(this.$instance), Array.from(document.querySelectorAll(".product-photos-featherlight-gallery-content")).forEach(function(t) {
                    new PinchZoom.default(t, {})
                }), window.mySwipe = new Swipe(document.querySelector(".product-photos-featherlight-gallery"), {
                    speed: 400
                })
            },
            afterClose: function(t) {
                jQuery("body").removeClass("product-zoom")
            }
        }), jQuery("#menuToggle").is(":visible") || jQuery("body").on("click", ".product-photos-featherlight-gallery-content", function(t) {
            t.target.classList.contains("product-photos-featherlight-gallery-image") || $.featherlight.close()
        })), jQuery("body").hasClass("template-index") && jQuery(".instagram-section").length > 0 && (fourSixtyRenderedTimeout = window.setTimeout(t, 3500), document.querySelector("script[data-feed-id]").addEventListener("foursixtyPageRendered", function(t) {
            window.clearTimeout(fourSixtyRenderedTimeout), setTimeout(function() {
                e()
            }, 200)
        })), jQuery("#shareOn a, .lookbookText ul a, .social-share ul li a").on("click", function(t) {
            t && t.preventDefault(), jQuery(this).hasClass("pin") ? windowPopup(jQuery(this).attr("href"), 750, 552) : windowPopup(jQuery(this).attr("href"), 500, 300)
        }), jQuery("#fullRegisterBirthday").length > 0 && jQuery(".accountBirthdaySignup").on("change", function() {
            var t = jQuery("#birthdayDay").val() + "/" + jQuery("#birthdayMonth").val() + "/" + jQuery("#birthdayYear").val();
            console.log(t), jQuery("#fullRegisterBirthday").val(t)
        }), jQuery("body").on("click", "button.js-qty__adjust--plus", function(t) {
            var e = jQuery(this).parents("tr").find("a.remove").attr("href"),
                i = e.split("line=");
            e = parseInt(i[1], 10);
            var s = jQuery(this).prev().val();
            window.location = "/cart/change?line=" + e + "&amp;quantity=" + s
        }), jQuery("body").on("click", "button.js-qty__adjust--minus", function(t) {
            var e = jQuery(this).parents("tr").find("a.remove").attr("href"),
                i = e.split("line=");
            e = parseInt(i[1], 10);
            var s = jQuery(this).next().val();
            s < 0 && (s = 0), window.location = "/cart/change?line=" + e + "&amp;quantity=" + s
        });
        var r = !1;
        if (newsletterFlourish = document.getElementById("newsletterFlourish"), !jQuery("#menuToggle").is(":visible")) {
            var a, l = {
                root: null,
                rootMargin: "100px 0px",
                threshold: 1
            };
            if (newsletterFlourish && "IntersectionObserver" in window && (a = new IntersectionObserver(s, l), a.observe(newsletterFlourish)), !jQuery("#menuToggle").is(":visible")) {
                var h, c = jQuery("#nav-ul .level0.shop ul.level1").height(),
                    u = jQuery(window).height(),
                    d = u - c;
                n(), jQuery(window).on("scroll", function() {
                    h || (h = setTimeout(function() {
                        n(), h = null
                    }, 100))
                })
            }
        }
        jQuery(".quickBuy").click(function(t) {
            t && t.preventDefault(), thisQuickButton = jQuery(this).parent().parent(), jQuery.post("/cart/add.js", {
                quantity: 1,
                id: jQuery(this).data("variantid")
            }, null, "json").done(function(t) {
                t.product_title && (jQuery('<p class="quickBuySuccess">Added to bag</p>').insertBefore(thisQuickButton).delay(2500).fadeOut(3e3), document.documentElement.classList.add("offCanvasBasket"), juno.basketIsRevealed = !0, setTimeout(function() {
                    document.documentElement.classList.remove("offCanvasBasket"), juno.basketIsRevealed = !1
                }, 5e3)), ajaxCart.load()
            }).fail(function(t) {
                t.responseJSON.description && jQuery('<p class="quickBuyError">' + t.responseJSON.description + "</p>").insertBefore(thisQuickButton).delay(2500).fadeOut(3e3)
            })
        }), jQuery("a.pressClippingLink").click(function(t) {
            t && t.preventDefault(), $.featherlight(jQuery(this).next().next(), {
                variant: "pressLightbox"
            })
        }), jQuery("#cmInToggle li").click(function(t) {
            t && t.preventDefault(), jQuery("#cmInTable table").attr("class", "show" + jQuery(this).attr("id")), jQuery("#cmInToggle li").removeClass("active"), jQuery(this).addClass("active")
        }), jQuery(window).width() < 421 && jQuery('#contact_form .input-group input[type="email"]').attr("placeholder", "Enter your email & get 10% off"), jQuery("#product-add button").click(function(t) {
            document.documentElement.classList.add("offCanvasBasket"), juno.basketIsRevealed = !0, setTimeout(function() {
                document.documentElement.classList.remove("offCanvasBasket"), juno.basketIsRevealed = !1
            }, 5e3)
        }), jQuery("#backToTopLink").click(function(t) {
            t && t.preventDefault(), jQuery("html, body").animate({
                scrollTop: 0
            }, 450)
        }), jQuery("#geoLocationClose").click(function(t) {
            t && t.preventDefault(), jQuery("#storeViewInformation").hide(), createCookie("geoIPHeaderMessage", "closed", 31)
        }), relocationURL = "", jQuery("body").on("click", ".storeSelectDropdown label", function(t) {
            t.preventDefault(), jQuery(this).toggleClass("active").next().slideToggle(200)
        }), jQuery("body").on("click", ".storeSelectDropdown li", function(t) {
            t.preventDefault();
            var e = jQuery(this).find("span").text();
            jQuery(this).parent().slideToggle(200).prev().text(e).toggleClass("active").data("size", e), relocationURL = jQuery(this).data("href")
        }), jQuery("body").on("click", "#multiStoreSwitcherSubmit", function(t) {
            t.preventDefault(), "" != relocationURL ? window.location.href = relocationURL : $.featherlight.close()
        }), jQuery("body").on("click", "#ajaxCartContinueShopping", function(t) {
            t && t.preventDefault(), juno.checkToggleBasketNavigation()
        }), jQuery("body").hasClass("template-collection") && window.localStorage && localStorage.setItem("lastCollection", jQuery("body").data("collection-handle")), jQuery("body").hasClass("template-cart") && window.localStorage && localStorage.getItem("lastCollection") && jQuery(".shopping-bag .return .button-text").click(function(t) {
            t && t.preventDefault(), location = "/collections/" + localStorage.getItem("lastCollection")
        })
    }), window.FeatherLightafterOpen = function() {
        var t = 1;
        jQuery("body > .featherlight").find("input").each(function() {
            jQuery(this).attr("tabindex", t++)
        })
    }, jQuery(document).ready(function() {
        "dismissed" != localStorage.getItem("newsletter-sign-up") && -1 == window.location.href.indexOf("newsletter-sign-up") && (jQuery('<div class="first-click-newsletter-open"></div>').insertBefore(".popup-newsletter"), jQuery(".first-click-newsletter-open").click(function() {
            jQuery(".popup-newsletter").fadeIn(), localStorage.setItem("newsletter-sign-up", "dismissed"), clearTimeout(newsletterDisplayTimer)
        })), jQuery(".popup-newsletter .featherlight-close").click(function(t) {
            t.preventDefault(), jQuery(".popup-newsletter").fadeOut(), jQuery(".first-click-newsletter-open").remove(), localStorage.setItem("newsletter-sign-up", "dismissed")
        }), jQuery(".popup-newsletter").click(function(t) {
            jQuery(t.target).hasClass("popup-newsletter") && (t.preventDefault(), jQuery(".popup-newsletter").fadeOut(), jQuery(".first-click-newsletter-open").remove(), localStorage.setItem("newsletter-sign-up", "dismissed"))
        }), jQuery("#newsletter-sign-up #signup #btnsubmit").click(function() {
            localStorage.setItem("newsletter-sign-up", "dismissed")
        })
    }), jQuery("body").on("click", ".popup-newsletter #btnsubmit", function() {
        localStorage.setItem("newsletter-sign-up", "dismissed")
    }), jQuery(window).load(function() {
        var t = localStorage.getItem("newsletter-sign-up"),
            e = !0;
        window.location.search && -1 !== window.location.search.indexOf("utm_medium=email") && (e = !1), -1 != window.location.href.indexOf("newsletter-sign-up") && (e = !1), e && "dismissed" != t && (newsletterDisplayTimer = setTimeout(function() {
            jQuery(".popup-newsletter").fadeIn()
        }, 1e4)), location.search && -1 !== location.search.indexOf("result=success") && jQuery(".popup-newsletter").fadeIn()
    });

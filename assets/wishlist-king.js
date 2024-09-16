import { WishlistApp } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/wishlist-app.js";

export const createApp = ({ settings, config, locale }) => {
  if (window.WishlistKing) {
    return;
  }

  const app = new WishlistApp({
    config,
    settings,
    locale,
    dependencies: [
      "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/components/wishlist.css",
      "//www.chintiandparker.com/cdn/shop/t/306/assets/wishlist-king-custom.css?v=63816522155686180531725889490",
      "//www.chintiandparker.com/cdn/shop/t/306/assets/wishlist-king-components.js?v=67192780879355402051725889490",
    ],
  });

  initEvents(app);
  initComponents(app);

  return app;
};

const initComponents = ({ theme, routes }) => {
  // Header link
  theme.watch(
    {
      selector: ".header-actions__action--cart.miniCart",
    },
    (target) => {
      target.insertBefore(
        theme.createComponent("wishlist-link", {
          props: {
            layout: "icon-only",
            alignment: "center",
            badgeLayout: "text",
            badgeParentheses: false,
            badgeHiddenIfEmpty: false,
          },
          wrap: {
            name: "li",
            props: {
              className: "header-actions__action header-actions__action--wishlist",
            }
          }
        })
      );
    }
  );

  theme.watch(
    {
      selector: ".meganav--mobile .meganav-actions",
    },
    (target) => {
      target.prepend(
        theme.createComponent("wishlist-link", {
          props: {
            layout: "icon-only",
            alignment: "center",
            badgeLayout: "hidden",
            badgeParentheses: false,
            badgeHiddenIfEmpty: false,
          },
          wrap: {
            name: "li",
            props: {
              className: "meganav-actions__action meganav-actions__action--wishlist",
            }
          }
        })
      );
    }
  );

  // Grid items
  theme.watch(
    {
      selector: `.product-image-wrap > a[href*="/products/"]`,
      pageType: ["home", "product", "collection"],
    },
    (target) => {
      target.insertAfter(
        theme.createComponent("wishlist-button", {
          dataset: {
            productHandle: theme.getProductHandle(target.element.href),
            variantId: theme.getVariantId(target.element.href),
          },
          props: {
            layout: "icon-only",
            alignment: "center",
            floating: {
              reference: target,
              position: {
                placement: "top-end",
                inset: true,
              },
              offset: 0,
            },
          },
        })
      );
    }
  );

  // Product page
  theme.watch(
    {
      selector: `#wishlist-wrapper`,
      pageType: ["product"],
    },
    (target) => {
      target.append(
        theme.createComponent("wishlist-button", {
          dataset: {
            productHandle: theme.getProductHandle(document.location.href),
            variantId: theme.getVariantId(document.location.href),
          },
          props: {
            layout: "icon-and-text",
            alignment: "center",
            fullWidth: true,
            outline: false,
          },
        })
      );
    }
  );
  
  // Cart page
  theme.watch(
    {
      selector: `#wishlist-reminder`,
      pageType: ["cart"],
    },
    (target) => {
      target.append(
        theme.createComponent("wishlist-section")
      );
    }
  );

  // Wishlist page
  theme.watch(
    {
      selector: "#wishlist-page",
    },
    (target) => {
      target.replace(
        theme.createComponent("wishlist-page", {
          dataset: {
            wishlistId: theme.getWishlistId(window.location.pathname),
          },
        })
      );
    }
  );
};



const initEvents = (app) => {
  app.events.subscribe("wk:wishlist:add-to-cart:success", (event) => {
    window.location.href = app.routes.cartUrl;
  });
  app.events.subscribe("wk:wishlist:add-all-to-cart:success", (event) => {
    window.location.href = app.routes.cartUrl;
  });
  app.events.subscribe("wk:wishlist:login-required", (event) => {
    const ignoreActions = ["wishlist:private:load"];
    if (!ignoreActions.includes(event.data.action)) {
      window.location.href = app.routes.accountLoginUrl;
    }
  });
};


setTimeout(()=>{
  document.querySelectorAll(".wk-page .wk-product-card .wk-form .wk-submit-button").forEach(button=>{
  const timeCount = new Date((new Date().getTime())+(30*60*1000));
  button.addEventListener("click",()=>{
  localStorage.setItem("cartTimer", JSON.stringify(timeCount));
  })
})
},1000)
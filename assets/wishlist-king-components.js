import { html } from "https://cdn.jsdelivr.net/npm/lit-html@2.4.0/+esm";
import { repeat } from "https://cdn.jsdelivr.net/npm/lit-html@2.4.0/directives/repeat.js";
import { WishlistElement } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/wishlist-element.js";
import { ProductFormController } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/controllers.js";
import { Icon } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/components/icon.js";
import "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/components/button.js";
import "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/components/badge.js";
import "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.17.6/components/option-select.js";

class WishlistSection extends WishlistElement {
  // Define the state configuration to include the wishlist
  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  render() {
    // Check if the wishlist is available and has items
    const wishlistItems = this.state.wishlist.items.slice().reverse();
    if (!this.state.wishlist || !wishlistItems.length) {
      return html``;
    }
    // Render the wishlist items
    return html`
      <div class="wishlist-items-wrapper">
        <div class="wishlist-heading">
          <h2>IN MY WISHLIST</h2>
          <a href="/apps/wishlist">SEE ALL</a>
        </div>
        <div class="wk-grid">
          ${repeat(
            wishlistItems.slice(0, 4),
            (wishlistItem) => wishlistItem.id,
            (wishlistItem) => html`
              <wishlist-product-card
                data-wishlist-id=${this.state.wishlist.id}
                data-wishlist-item-id=${wishlistItem.id}
                .wishlistId=${this.state.wishlist.id}
                .isMine=${this.state.wishlist.isMine}
              ></wishlist-product-card>
            `
          )}
        </div>
      </div>
    `;
  }
}

customElements.define("wishlist-section", WishlistSection);

export class WishlistPage extends WishlistElement {
  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  render() {
    if (!this.state.wishlist) {
      return;
    }

    return html`
      <section class="wk-page">
        <div class="wk-header">
          <h1 class="wk-title">
            ${this.getTranslation("wishlist_page.title")}
          </h1>
          ${this.renderControls()}
        </div>
        <div class="wk-body">
          ${this.renderWishlistEmptyCallout()}${this.renderLoginCallout()}
          ${this.renderWishlistItems()}
        </div>
      </section>
    `;
  }

  renderControls() {
    if (!this.state.wishlist.items.length) {
      return;
    }

    return html`
      <div class="wk-controls">
        <wishlist-share
          data-wishlist-id="${this.state.wishlist.id}"
          layout="icon-and-text"
        ></wishlist-share>
        <wishlist-buy-all
          data-wishlist-id="${this.state.wishlist.id}"
          layout="icon-and-text"
        ></wishlist-buy-all>
      </div>
    `;
  }

  renderWishlistEmptyCallout() {
    if (this.state.wishlist.items.length) {
      return;
    }

    return html`
      <div class="wk-wishlist-empty-callout">
        <p>
          ${this.getTranslation("wishlist_page.wishlist_empty_callout_html")}
        </p>
      </div>
    `;
  }

  renderLoginCallout() {
    if (
      this.app.customer ||
      !this.state.wishlist.isMine ||
      !this.state.wishlist.items.length
    ) {
      return;
    }

    return html`
      <div class="wk-login-callout">
        <p>
          ${this.getTranslation("wishlist_page.login_callout_html", {
            login_url: this.app.routes.accountLoginUrl,
            register_url: this.app.routes.accountRegisterUrl,
          })}
        </p>
      </div>
    `;
  }

  renderWishlistItems() {
    if (!this.state.wishlist.items.length) {
      return;
    }

    const wishlistItems = this.state.wishlist.items.slice().reverse();

    return html`
      <div class="wk-grid">
        ${repeat(
          wishlistItems,
          (wishlistItem) => wishlistItem.id,
          (wishlistItem) => html`
            <wishlist-product-card
              data-wishlist-id=${this.state.wishlist.id}
              data-wishlist-item-id=${wishlistItem.id}
              .wishlistId=${this.state.wishlist.id}
              .isMine=${this.state.wishlist.isMine}
            ></wishlist-product-card>
          `
        )}
      </div>
    `;
  }
}

customElements.define("wishlist-page", WishlistPage);

export class WishlistProductCard extends WishlistElement {
  static get properties() {
    return {
      isMine: { type: Boolean },
      wishlistId: { type: String },
    };
  }

  constructor() {
    super();
    this.form = new ProductFormController(this, {
      app: this.app,
    });
  }

  updateState(state) {
    if (state.wishlistItem) {
      this.form.setProduct({
        product: state.wishlistItem.product,
        selectedVariantId: state.wishlistItem.variantId,
        autoSelect: this.app.settings.autoSelectVariantOnInit,
      });
    }

    super.updateState(state);
  }

  getStateConfig() {
    return {
      loading: "lazy",
      wishlistItem: true,
    };
  }

  getEventConfig() {
    return {
      "change .wk-form": async (event) => {
        this.form.changeOption({
          input: event.target,
          autoSelect: this.app.settings.autoSelectVariantOnChange,
        });

        if (this.form.selectedVariant && this.isMine) {
          await this.app.updateWishlistItem({
            wishlistItemId: this.state.wishlistItem.id,
            changes: {
              variantId: this.form.selectedVariant.id,
            },
          });
        }
      },
      "submit .wk-form": async (event) => {
        event.preventDefault();

        await this.form.addToCart({
          wishlistId: this.wishlistId,
          wishlistItemId: this.state.wishlistItem.id,
        });
      },
    };
  }

  render() {
    if (!this.state.wishlistItem.product.id) {
      return html`
        <div class="wk-product-card">${this.renderLoadingState()}</div>
      `;
    }

    if (this.state.wishlistItem.product.hidden) {
      return html`
        <div class="wk-product-card">${this.renderUnavailableState()}</div>
      `;
    }

    const product = this.state.wishlistItem.product;
    const variant = this.form.selectedVariant;

    return html`
      <div class="wk-product-card">
        <a href=${this.getProductUrl(product, variant)} class="wk-image-link">
          <img
            class="wk-image"
            src=${this.getImageUrl(product, variant, {
              width: 1000,
              height: 1000,
            })}
          />
        </a>
        <div class="wk-meta">
          <span class="wk-vendor">${product.vendor}</span>
          <a
            class="wk-product-title"
            href=${this.getProductUrl(product, variant)}
          >
            ${product.title}
          </a>
          <div class="wk-price">
            ${this.renderCurrentPrice({ product, variant })}
            ${this.renderComparePrice({ product, variant })}
          </div>
        </div>
        ${this.renderProductForm({ variant })} ${this.renderRemoveButton()}
        ${this.renderWishlistButton()}
      </div>
    `;
  }

  renderCurrentPrice({ product, variant }) {
    if (variant) {
      const sale = variant.price < variant.compare_at_price;

      return html`
        <span class="wk-current-price ${sale ? "wk-sale" : ""}">
          ${this.formatMoney(variant.price)}
        </span>
      `;
    }

    if (product.price_min !== product.price_max) {
      return html`
        <span class="wk-current-price">
          ${this.getTranslation("wishlist_product.from_price_html", {
            price: this.formatMoney(product.price_min),
          })}
        </span>
      `;
    }

    return html`
      <span class="wk-current-price">
        ${this.formatMoney(product.price_min)}
      </span>
    `;
  }

  renderComparePrice({ variant }) {
    if (variant && variant.price < variant.compare_at_price) {
      return html`
        <span class="wk-compare-price">
          ${this.formatMoney(variant.compare_at_price)}
        </span>
      `;
    }
  }

  renderProductForm({ variant }) {
    const getSubmitText = () => {
      if (!variant && this.form.hasSelection) {
        return this.getTranslation("wishlist_product.unavailable");
      } else if (!variant) {
        return this.getTranslation("wishlist_product.select_option", {
          name: this.form.optionsWithValues.find(
            (option) => !option.selectedValue
          ).name,
        });
      }

      if (!variant.available) {
        return this.getTranslation("wishlist_product.sold_out");
      }

      return this.getTranslation("wishlist_product.add_to_cart");
    };

    return html`
      <form
        class="wk-form"
        method="post"
        action=${this.app.routes.cartAddUrl}
        data-wishlist-id=${this.wishlistId}
        data-wishlist-item-id=${this.state.wishlistItem.id}
      >
        <input
          name="id"
          value=${this.form.selectedVariant ? this.form.selectedVariant.id : ""}
          type="hidden"
        />
        <div class="wk-variants">${this.renderProductOptions()}</div>
        <div class="wk-quantity">
          <label class="wk-quantity-label">
            ${this.getTranslation("wishlist_product.quantity")}
          </label>
          <input
            class="wk-quantity-input"
            type="number"
            name="quantity"
            value="1"
            min="1"
          />
        </div>
        <button
          type="submit"
          class="wk-submit-button"
          data-wishlist-item-id=${this.state.wishlistItem.id}
          ?disabled=${!variant || !variant.available}
        >
          <span class="wk-submit-label">${getSubmitText()}</span>
          <wk-icon icon="spinner" class="wk-submit-spinner"></wk-icon>
        </button>
      </form>
    `;
  }

  renderProductOptions() {
    if (this.form.hasOnlyDefaultVariant) {
      return;
    }

    return html`
      ${this.form.optionsWithValues.map(
        (option) =>
          html`<wk-option-select .option=${option}></wk-option-select>`
      )}
    `;
  }

  renderLoadingState() {
    return html`
      <div class="wk-image">
          <wk-icon icon="spinner" class="wk-loading-spinner"></wk-icon>
        </div>  
      </div>
    `;
  }

  renderUnavailableState() {
    return html`
      <div class="wk-image-link">
        <img
          class="wk-image"
          src=${this.getImageUrl(null, null, { width: 1000, height: 1000 })}
        />
      </div>
      <div class="wk-meta">
        <span class="wk-vendor">&nbsp;</span>
        <span class="wk-product-title">
          ${this.getTranslation("wishlist_page.product_removed_html")}
        </span>
      </div>
      ${this.renderRemoveButton()}
    `;
  }

  renderRemoveButton() {
    if (!this.isMine) {
      return;
    }

    const floatSettings = {
      reference: this,
      position: {
        placement: "top-end",
        inset: true,
      },
    };

    return html`
      <remove-button
        data-wishlist-item-id=${this.state.wishlistItem.id}
        layout="icon-only"
        .floating=${floatSettings}
      ></remove-button>
    `;
  }

  renderWishlistButton() {
    if (this.isMine) {
      return;
    }

    return html`
      <wishlist-button
        data-product-id=${this.form.productId}
        data-variant-id=${this.form.selectedVariantId}
        layout="icon-only"
        floating='{"reference": "#{{ container_id }} .wk-image", "position": {"placement": "top-end", "inset": true}}'
      ></wishlist-button>
    `;
  }
}

customElements.define("wishlist-product-card", WishlistProductCard);

export class WishlistButton extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      productInfo: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  appReadyCallback() {
    this.app.events.subscribe("wk:product:change-variant:success", (event) => {
      if (this.dataset.productHandle === event.data.productHandle) {
        const wishlistItemId = this.state.productInfo
          ? this.state.productInfo.wishlistItemId
          : undefined;

        const currentVariantId = this.state.productInfo
          ? this.state.productInfo.variantId
          : undefined;

        if (wishlistItemId && !currentVariantId) {
          this.app.updateWishlistItem({
            wishlistItemId,
            changes: {
              variantId: event.data.variantId,
            },
          });
        }

        this.dataset.variantId = event.data.variantId;
      }
    });
  }

  handleClick() {
    if (this.state.productInfo.inWishlist) {
      return this.app.removeWishlistItem(this.state.productInfo);
    } else {
      return this.app.addWishlistItem(this.state.productInfo);
    }
  }

  render() {
    if (!this.state.productInfo) {
      return;
    }

    const inWishlist = this.state.productInfo.inWishlist;
    const text = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.product_in_wishlist"
        : "wishlist_buttons.add_product"
    );
    const hint = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.remove_product"
        : "wishlist_buttons.add_product"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .selected=${inWishlist}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"wishlist"}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-button", WishlistButton);

export class RemoveButton extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
    };
  }

  getEventConfig() {
    return {
      "click .wk-button": this.handleClick,
    };
  }

  handleClick() {
    return this.app.removeWishlistItem({
      wishlistItemId: this.dataset.wishlistItemId,
    });
  }

  render() {
    const text = this.getTranslation("wishlist_buttons.remove_product");
    const hint = this.getTranslation("wishlist_buttons.remove_product");

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"remove"}
      ></wk-button>
    `;
  }
}

customElements.define("remove-button", RemoveButton);

export class WishlistLink extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
      badgeLayout: { type: String },
      badgeParentheses: { type: Boolean },
      badgeHidden: { type: Boolean },
      badgeHiddenIfEmpty: { type: Boolean },
      badgeFloating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getWishlistUrl() {
    if (this.app.settings.loginRequired) {
      return this.app.routes.accountLoginUrl;
    }
    return this.app.routes.wishlistUrl;
  }

  render() {
    const numItems = this.state.wishlist ? this.state.wishlist.numItems : 0;
    const wishlistUrl = this.getWishlistUrl();
    const text = this.getTranslation("wishlist_buttons.wishlist");
    const hint = this.getTranslation("wishlist_buttons.view_wishlist");

    return html`
      <wk-button
        .href=${wishlistUrl}
        .text=${text}
        .hint=${hint}
        .selected=${numItems > 0}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"wishlist"}
        .badgeText=${numItems}
        .badgeLayout=${this.badgeLayout}
        .badgeParentheses=${this.badgeParentheses}
        .badgeHidden=${this.badgeHidden}
        .badgeHiddenIfEmpty=${this.badgeHiddenIfEmpty}
        .badgeFloating=${this.badgeFloating}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-link", WishlistLink);

export class WishlistShare extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      floating: { type: Object },
      linkCopied: { type: Boolean, state: true },
    };
  }

  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    const { clipboard } = await this.app.shareWishlist({
      wishlistId: this.state.wishlist.publicId,
      title: this.getTranslation("wishlist_share.share_title"),
      text: this.getTranslation("wishlist_share.share_message"),
    });

    if (clipboard) {
      this.linkCopied = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.linkCopied = false;
    }
  }

  render() {
    const text = this.getTranslation(
      this.linkCopied
        ? "wishlist_share.link_copied"
        : "wishlist_share.button_label"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .floating=${this.floating}
        .icon="${"share"}"
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-share", WishlistShare);

export class WishlistBuyAll extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      floating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    await this.app.addAllToCart({
      wishlistId: this.state.wishlist.id,
    });
  }

  render() {
    const text = this.getTranslation("wishlist_page.add_all_to_cart");

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .floating=${this.floating}
        .icon="${"buy"}"
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-buy-all", WishlistBuyAll);

export class WishlistSaveForLater extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      productInfo: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    if (!this.state.productInfo.inWishlist) {
      await this.app.addWishlistItem(this.state.productInfo);
      this.closest(".cart-item").querySelector("cart-remove-button a").click();
    }
  }

  render() {
    const inWishlist =
      this.state.productInfo && this.state.productInfo.inWishlist;

    const text = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.product_in_wishlist"
        : "wishlist_buttons.save_for_later"
    );

    const hint = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.product_in_wishlist"
        : "wishlist_buttons.save_for_later"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .selected=${inWishlist}
        .disabled=${inWishlist}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"wishlist"}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-save-for-later", WishlistSaveForLater);

Icon.addIcons({
  wishlist: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 64 64">
      <path d="M32.012,59.616c-1.119-.521-2.365-1.141-3.707-1.859a79.264,79.264,0,0,1-11.694-7.614C6.316,42,.266,32.6.254,22.076,0.244,12.358,7.871,4.506,17.232,4.5a16.661,16.661,0,0,1,11.891,4.99l2.837,2.889,2.827-2.9a16.639,16.639,0,0,1,11.874-5.02h0c9.368-.01,17.008,7.815,17.021,17.539,0.015,10.533-6.022,19.96-16.312,28.128a79.314,79.314,0,0,1-11.661,7.63C34.369,58.472,33.127,59.094,32.012,59.616Z"/>
    </svg>
  `,
  remove: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 64 64">
      <path d="M0.309,0.309a0.9,0.9,0,0,1,1.268,0L63.691,62.423a0.9,0.9,0,0,1-1.268,1.268L0.309,1.577A0.9,0.9,0,0,1,.309.309Z"/>
      <path d="M63.691,0.309a0.9,0.9,0,0,1,0,1.268L1.577,63.691A0.9,0.9,0,0,1,.309,62.423L62.423,0.309A0.9,0.9,0,0,1,63.691.309Z"/>
    </svg>
  `,
  share: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 122.88 122.88">
      <path d="M60.54,34.07A7.65,7.65,0,0,1,49.72,23.25l13-12.95a35.38,35.38,0,0,1,49.91,0l.07.08a35.37,35.37,0,0,1-.07,49.83l-13,12.95A7.65,7.65,0,0,1,88.81,62.34l13-13a20.08,20.08,0,0,0,0-28.23l-.11-.11a20.08,20.08,0,0,0-28.2.07l-12.95,13Zm14,3.16A7.65,7.65,0,0,1,85.31,48.05L48.05,85.31A7.65,7.65,0,0,1,37.23,74.5L74.5,37.23ZM62.1,89.05A7.65,7.65,0,0,1,72.91,99.87l-12.7,12.71a35.37,35.37,0,0,1-49.76.14l-.28-.27a35.38,35.38,0,0,1,.13-49.78L23,50A7.65,7.65,0,1,1,33.83,60.78L21.12,73.49a20.09,20.09,0,0,0,0,28.25l0,0a20.07,20.07,0,0,0,28.27,0L62.1,89.05Z"/>
    </svg>
  `,
  buy: `
    <svg viewBox="0 0 490.399 490.399">
      <path d="M490.086,464.75l-28.1-294.4c-1-10.4-10.4-18.7-20.8-18.7h-63.5v-17.7c0-72.8-59.3-133.2-133.2-133.2
        c-72.8,0-133.2,59.3-133.2,133.2v17.7h-61.3c-11.4,0-19.8,8.3-20.8,18.7l-29.1,297.5c-1.4,17.7,14.6,21.8,20.8,21.8h449.4
        C494.486,488.25,490.086,465.85,490.086,464.75z M152.986,133.95c0-51,41.6-92.6,92.6-92.6s92.6,41.6,92.6,92.6v17.7h-185.2
        L152.986,133.95L152.986,133.95z M43.786,449.15l25-257h42.7v33.3c0,11.4,9.4,20.8,20.8,20.8c11.4,0,20.8-9.4,20.8-20.8v-33.3
        h185.2v33.3c0,11.4,9.4,20.8,20.8,20.8c10.4,0,19.8-9.4,18.7-20.8v-33.3h44.7l25,257H43.786z" />
      <path d="M306.986,314.95h-32.3c-8.3,0-14.6-6.2-14.6-14.6v-31.2c0-8.3-6.2-14.6-14.6-14.6s-14.6,6.2-14.6,14.6v31.2
        c0,8.3-6.2,14.6-14.6,14.6h-32.3c-8.3,0-14.6,6.2-14.6,14.6c0,0-0.7,15.1,14.6,15.6h32.5c8.3,0,14.6,6.2,14.6,14.6v31.2
        c0,8.3,6.2,14.6,14.6,14.6c8.4,0,14.6-6.2,14.6-14.6v-31.2c0-8.3,6.2-14.6,14.6-14.6h32.3c15.7-1.3,14.6-15.6,14.6-15.6
        C321.586,321.15,315.286,314.95,306.986,314.95z" />
    </svg>
  `,
  spinner: `
    <svg class="wk-spinner-svg" aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 66 66">
      <circle class="wk-spinner-circle" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
    </svg>
  `,
});

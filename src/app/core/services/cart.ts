import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../../environments/environment.development';
import { AnalyticsService, AnalyticsItem } from './analytics';

export interface CartItem {
  id: string; // Line item ID in Shopify
  quantity: number;
  variantId: string;
  variantTitle: string;
  productTitle: string;
  price: { amount: string; currencyCode: string };
  imageUrl: string | null;
}

export interface CartDetails {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: { amount: string; currencyCode: string };
  lines: CartItem[];
}

export interface BuyerIdentityInput {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  zip?: string;
  countryCode?: string; // e.g. 'KE', 'US', 'GB', 'CA'
  paymentMethod?: 'mpesa' | 'card_paypal';
}

export interface UpsellOffer {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  originalPrice: { amount: string; currencyCode: string };
  imageUrl: string;
  discountBadge: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private platformId = inject(PLATFORM_ID);

  private client = createStorefrontApiClient({
    storeDomain: environment.shopifyDomain,
    apiVersion: environment.apiVersion || '2026-01',
    publicAccessToken: environment.shopifyToken,
  });

  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  cart = signal<CartDetails | null>(null);

  // High-Margin Dropshipping Upsell Offer
  upsellOffer = signal<UpsellOffer>({
    variantId: 'gid://shopify/ProductVariant/upsell-cable-organizer',
    productTitle: 'DigiTex Pro Cable Organizer & Clip',
    variantTitle: 'Stealth Black',
    price: { amount: '12.00', currencyCode: 'USD' },
    originalPrice: { amount: '20.00', currencyCode: 'USD' },
    imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&q=80',
    discountBadge: '40% OFF - PAIRED DISCOUNT',
  });

  itemCount = computed(() => this.cart()?.totalQuantity || 0);

  hasUpsellInCart = computed(() => {
    const currentLines = this.cart()?.lines || [];
    const upsellId = this.upsellOffer().variantId;
    return currentLines.some((item) => item.variantId === upsellId);
  });

  showUpsell = computed(() => {
    return (this.cart()?.totalQuantity || 0) > 0 && !this.hasUpsellInCart();
  });

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    if (this.isBrowser) {
      this.initCart();
    }
  }

  openDrawer(): void {
    this.isOpen.set(true);
  }

  closeDrawer(): void {
    this.isOpen.set(false);
  }

  toggleDrawer(): void {
    this.isOpen.update((v) => !v);
  }

  async initCart(): Promise<void> {
    const cartId = localStorage.getItem('cart_id');
    if (cartId) {
      await this.fetchCart(cartId);
    }
  }

  async fetchCart(cartId: string): Promise<void> {
    this.isLoading.set(true);
    const query = `
      query getCart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount { amount currencyCode }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    product {
                      title
                      images(first: 1) { edges { node { url } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const { data, errors }: any = await this.client.request(query, { variables: { cartId } });
      if (errors || !data?.cart) {
        if (this.isBrowser) localStorage.removeItem('cart_id');
        this.cart.set(null);
        return;
      }
      this.cart.set(this.parseShopifyCart(data.cart));
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      if (this.isBrowser) localStorage.removeItem('cart_id');
      this.cart.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addToCart(variantId: string, quantity = 1): Promise<void> {
    this.isLoading.set(true);
    const cartId = this.isBrowser ? localStorage.getItem('cart_id') : null;

    if (!cartId) {
      await this.createCart(variantId, quantity);
    } else {
      const mutation = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id checkoutUrl totalQuantity
              cost { subtotalAmount { amount currencyCode } }
              lines(first: 50) {
                edges {
                  node {
                    id quantity
                    merchandise {
                      ... on ProductVariant {
                        id title price { amount currencyCode }
                        product { title images(first: 1) { edges { node { url } } } }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const { data, errors }: any = await this.client.request(mutation, {
          variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
        });

        if (errors || !data?.cartLinesAdd?.cart) {
          if (this.isBrowser) localStorage.removeItem('cart_id');
          await this.createCart(variantId, quantity);
        } else {
          this.cart.set(this.parseShopifyCart(data.cartLinesAdd.cart));
        }
      } catch (err) {
        console.error('Add to cart error:', err);
      }
    }

    this.isLoading.set(false);
    this.openDrawer();
  }

  async updateQuantity(lineId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      return this.removeItem(lineId);
    }

    const cartId = this.cart()?.id;
    if (!cartId) return;

    this.isLoading.set(true);
    const mutation = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const { data }: any = await this.client.request(mutation, {
        variables: { cartId, lines: [{ id: lineId, quantity }] },
      });
      if (data?.cartLinesUpdate?.cart) {
        this.cart.set(this.parseShopifyCart(data.cartLinesUpdate.cart));
      }
    } catch (err) {
      console.error('Update quantity error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async removeItem(lineId: string): Promise<void> {
    const cartId = this.cart()?.id;
    if (!cartId) return;

    this.isLoading.set(true);
    const mutation = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const { data }: any = await this.client.request(mutation, {
        variables: { cartId, lineIds: [lineId] },
      });
      if (data?.cartLinesRemove?.cart) {
        this.cart.set(this.parseShopifyCart(data.cartLinesRemove.cart));
      }
    } catch (err) {
      console.error('Remove item error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Formats Kenyan Safaricom phone numbers to E.164 (+254...) or formats international numbers
   */
  public formatPhone(phone?: string, countryCode = 'KE'): string | undefined {
    if (!phone) return undefined;
    let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (countryCode === 'KE') {
      if (cleaned.startsWith('0')) {
        return '+254' + cleaned.substring(1);
      } else if (cleaned.startsWith('254')) {
        return '+' + cleaned;
      }
    }
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }
    return cleaned;
  }

  /**
   * Binds Customer Identity (M-Pesa phone, email, delivery address) to Shopify Cart
   */
  async updateBuyerIdentity(buyerInfo: BuyerIdentityInput): Promise<string | null> {
    const cartId = this.cart()?.id;
    if (!cartId) return null;

    this.isLoading.set(true);
    const country = buyerInfo.countryCode || 'KE';
    const formattedPhone = this.formatPhone(buyerInfo.phone, country);

    const mutation = `
      mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
                    }
                  }
                }
              }
            }
          }
          userErrors { field message }
        }
      }
    `;

    const buyerIdentityPayload: any = {
      email: buyerInfo.email,
      countryCode: country,
      deliveryAddressPreferences: [
        {
          deliveryAddress: {
            address1: buyerInfo.address1,
            city: buyerInfo.city,
            firstName: buyerInfo.firstName,
            lastName: buyerInfo.lastName,
            zip: buyerInfo.zip || '00100',
            country: country,
            ...(formattedPhone ? { phone: formattedPhone } : {}),
          },
        },
      ],
    };

    if (formattedPhone) {
      buyerIdentityPayload.phone = formattedPhone;
    }

    try {
      const { data, errors }: any = await this.client.request(mutation, {
        variables: {
          cartId,
          buyerIdentity: buyerIdentityPayload,
        },
      });

      if (data?.cartBuyerIdentityUpdate?.userErrors?.length > 0) {
        console.warn('Shopify Buyer Identity Errors:', data.cartBuyerIdentityUpdate.userErrors);
      }

      if (data?.cartBuyerIdentityUpdate?.cart) {
        const updatedCart = this.parseShopifyCart(data.cartBuyerIdentityUpdate.cart);
        this.cart.set(updatedCart);
        return updatedCart.checkoutUrl;
      }
    } catch (err) {
      console.error('Failed to update buyer identity on cart:', err);
    } finally {
      this.isLoading.set(false);
    }

    return this.cart()?.checkoutUrl || null;
  }

  private async createCart(variantId: string, quantity: number): Promise<void> {
    const mutation = `
      mutation cartCreate($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id checkoutUrl totalQuantity
            cost { subtotalAmount { amount currencyCode } }
            lines(first: 50) {
              edges {
                node {
                  id quantity
                  merchandise {
                    ... on ProductVariant {
                      id title price { amount currencyCode }
                      product { title images(first: 1) { edges { node { url } } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const { data }: any = await this.client.request(mutation, {
      variables: { input: { lines: [{ merchandiseId: variantId, quantity }] } },
    });

    const newCart = data?.cartCreate?.cart;
    if (newCart?.id) {
      if (this.isBrowser) localStorage.setItem('cart_id', newCart.id);
      this.cart.set(this.parseShopifyCart(newCart));
    }
  }

  private parseShopifyCart(rawCart: any): CartDetails {
    const lines: CartItem[] = (rawCart.lines?.edges || []).map((edge: any) => {
      const node = edge.node;
      const merch = node.merchandise;
      return {
        id: node.id,
        quantity: node.quantity,
        variantId: merch.id,
        variantTitle: merch.title !== 'Default Title' ? merch.title : '',
        productTitle: merch.product?.title || 'Product',
        price: merch.price,
        imageUrl: merch.product?.images?.edges?.[0]?.node?.url || null,
      };
    });

    return {
      id: rawCart.id,
      checkoutUrl: rawCart.checkoutUrl,
      totalQuantity: rawCart.totalQuantity,
      subtotal: rawCart.cost?.subtotalAmount || { amount: '0.00', currencyCode: 'USD' },
      lines,
    };
  }

  // Inside Cart Service or Component
  private analytics = inject(AnalyticsService);

  onAddToCart(product: any): void {
    const item: AnalyticsItem = {
      item_id: product.variantId,
      item_name: product.title,
      price: parseFloat(product.price),
      quantity: 1,
    };

    this.analytics.trackAddToCart(item);
  }

  proceedToShopifyCheckout(cartItems: any[], checkoutUrl: string): void {
    const items: AnalyticsItem[] = cartItems.map((i) => ({
      item_id: i.variantId,
      item_name: i.title,
      price: parseFloat(i.price),
      quantity: i.quantity,
    }));

    const total = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    // Tracks checkout intent before redirecting to Shopify domain
    this.analytics.trackBeginCheckout(items, total);

    // Redirect user to Shopify Checkout
    window.location.href = checkoutUrl;
  }

  proceedToCheckout(): void {
    const url = this.cart()?.checkoutUrl;
    if (url && this.isBrowser) {
      window.location.href = url;
    }
  }
}

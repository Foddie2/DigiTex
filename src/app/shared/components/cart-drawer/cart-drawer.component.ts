import { Component, inject, effect, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { CartService } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';
import { AiChatbotService } from '../../../core/services/ai-chatbot';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cartService.isOpen()) {
      <div class="relative z-50">
        <div
          (click)="cartService.closeDrawer()"
          class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        ></div>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div
            class="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 flex flex-col shadow-2xl"
          >
            <div
              class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div class="flex items-center gap-2">
                <h2 class="text-lg font-bold">Your Cart</h2>
                <span
                  class="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full"
                >
                  {{ cartService.itemCount() }}
                  {{ cartService.itemCount() === 1 ? 'item' : 'items' }}
                </span>
              </div>

              <button
                (click)="cartService.closeDrawer()"
                class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close Cart"
              >
                ✕
              </button>
            </div>

            <div
              class="bg-slate-900 text-white px-4 py-2 text-[11px] font-bold flex items-center justify-between border-b border-slate-800"
            >
              <div class="flex items-center gap-1.5 text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>💚 M-Pesa & Credit Cards Accepted</span>
              </div>
              <div class="flex items-center gap-1 text-slate-300">
                <span>🔒 256-Bit SSL Encrypted</span>
              </div>
            </div>

            @if (cartService.isLoading()) {
              <div
                class="bg-emerald-600 text-white text-xs py-1.5 px-4 text-center font-medium animate-pulse"
              >
                Syncing with Shopify...
              </div>
            }

            <div class="flex-1 overflow-y-auto p-5 space-y-5">
              @if (!cartService.cart() || cartService.cart()?.lines?.length === 0) {
                <div
                  class="h-full flex flex-col items-center justify-center text-center space-y-4 py-16"
                >
                  <div
                    class="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center text-2xl"
                  >
                    🛍️
                  </div>
                  <div>
                    <h3 class="text-base font-bold">Your cart is empty</h3>
                    <p class="text-xs text-slate-500 mt-1">
                      Explore verified hardware & high-margin tech accessories.
                    </p>
                  </div>
                  <button
                    (click)="cartService.closeDrawer()"
                    class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (item of cartService.cart()?.lines; track item.id) {
                    <div
                      class="flex gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800"
                    >
                      <div
                        class="w-18 h-18 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      >
                        @if (item.imageUrl) {
                          <img
                            [src]="item.imageUrl"
                            [alt]="item.productTitle"
                            class="w-full h-full object-cover"
                          />
                        } @else {
                          <span class="text-[10px] text-slate-400">No Image</span>
                        }
                      </div>

                      <div class="flex-1 flex flex-col justify-between">
                        <div>
                          <div class="flex justify-between items-start">
                            <h4 class="font-bold text-xs line-clamp-1">
                              {{ item.productTitle }}
                            </h4>

                            <button
                              (click)="cartService.removeItem(item.id)"
                              class="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>

                          @if (item.variantTitle) {
                            <p class="text-[11px] text-slate-500 mt-0.5">
                              {{ item.variantTitle }}
                            </p>
                          }
                        </div>

                        <div class="flex justify-between items-center mt-2">
                          <span class="font-extrabold text-xs">
                            {{ currencyService.formatPrice(item.price) }}
                          </span>

                          <div
                            class="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                          >
                            <button
                              (click)="cartService.updateQuantity(item.id, item.quantity - 1)"
                              class="text-slate-500 hover:text-slate-900 dark:hover:text-white px-1 text-xs font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span class="text-xs font-bold w-4 text-center">{{
                              item.quantity
                            }}</span>
                            <button
                              (click)="cartService.updateQuantity(item.id, item.quantity + 1)"
                              class="text-slate-500 hover:text-slate-900 dark:hover:text-white px-1 text-xs font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                  @if (cartService.showUpsell()) {
                    <div
                      class="bg-gradient-to-r from-emerald-900/10 via-indigo-900/10 to-emerald-900/10 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-3.5 space-y-3 shadow-xs"
                    >
                      <div class="flex items-center justify-between">
                        <span
                          class="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider"
                        >
                          {{ cartService.upsellOffer().discountBadge }}
                        </span>
                        <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Frequently Paired
                        </span>
                      </div>

                      <div class="flex gap-3 items-center">
                        <img
                          [src]="cartService.upsellOffer().imageUrl"
                          [alt]="cartService.upsellOffer().productTitle"
                          class="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div class="flex-1 min-w-0">
                          <h5 class="text-xs font-bold truncate text-slate-900 dark:text-white">
                            {{ cartService.upsellOffer().productTitle }}
                          </h5>
                          <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {{ currencyService.formatPrice(cartService.upsellOffer().price) }}
                            </span>
                            <span class="text-[10px] text-slate-400 line-through">
                              {{
                                currencyService.formatPrice(cartService.upsellOffer().originalPrice)
                              }}
                            </span>
                          </div>
                        </div>

                        <button
                          (click)="addUpsellItem()"
                          [disabled]="cartService.isLoading()"
                          class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-2 rounded-xl shrink-0 cursor-pointer shadow-sm transition active:scale-95 disabled:opacity-50"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            @if (cartService.cart() && (cartService.cart()?.lines?.length || 0) > 0) {
              <div
                class="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-4"
              >
                <div
                  class="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500"
                >
                  <div
                    class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    ✈️ Express Global
                  </div>
                  <div
                    class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    💚 M-Pesa / Cards
                  </div>
                  <div
                    class="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800"
                  >
                    🔒 256-Bit SSL
                  </div>
                </div>

                <div class="flex justify-between items-center text-sm font-bold">
                  <span class="text-slate-500 dark:text-slate-400">Subtotal</span>
                  <span class="text-xl font-black">
                    {{ currencyService.formatPrice(cartService.cart()?.subtotal) }}
                  </span>
                </div>

                <button
                  (click)="cartService.proceedToCheckout()"
                  [disabled]="cartService.isLoading()"
                  class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                >
                  <span>Proceed to Checkout</span>
                  <span class="text-xs opacity-80">→</span>
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class CartDrawerComponent implements OnDestroy {
  private platformId = inject(PLATFORM_ID);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  public aiChatbotService = inject(AiChatbotService);

  private abandonmentTimer: any = null;

  constructor() {
    effect(() => {
      const isOpen = this.cartService.isOpen();
      const count = this.cartService.itemCount();

      if (isOpen && count > 0) {
        this.checkAbandonmentIntent();
      } else {
        this.clearAbandonmentWatch();
      }
    });
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  async addUpsellItem(): Promise<void> {
    const offer = this.cartService.upsellOffer();
    await this.cartService.addToCart(offer.variantId, 1);
  }

  private checkAbandonmentIntent(): void {
    if (!this.isBrowser) return;

    this.clearAbandonmentWatch();

    this.abandonmentTimer = setTimeout(() => {
      if (this.cartService.isOpen() && this.cartService.itemCount() > 0) {
        const count = this.cartService.itemCount();
        this.aiChatbotService.triggerProactiveNudge(
          `Hey! I noticed you have ${count} item${count > 1 ? 's' : ''} saved in your cart. Need help with specs or order checkout?`,
        );
      }
    }, 20000);

    window.addEventListener('mouseleave', this.onMouseLeaveExitIntent);
  }

  private onMouseLeaveExitIntent = (e: MouseEvent): void => {
    if (e.clientY <= 10 && this.cartService.isOpen() && this.cartService.itemCount() > 0) {
      this.aiChatbotService.triggerProactiveNudge(
        `Wait! Before you leave, would an instant 10% discount voucher code help you complete your order?`,
      );
      this.clearAbandonmentWatch();
    }
  };

  private clearAbandonmentWatch(): void {
    if (!this.isBrowser) return;

    if (this.abandonmentTimer) {
      clearTimeout(this.abandonmentTimer);
      this.abandonmentTimer = null;
    }
    window.removeEventListener('mouseleave', this.onMouseLeaveExitIntent);
  }

  ngOnDestroy(): void {
    this.clearAbandonmentWatch();
  }
}

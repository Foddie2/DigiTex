import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// Core Services
import { AuthService } from '../../core/services/auth';
import {
  ShopifyOrderService,
  ShopifyOrder,
  LineItem,
} from '../../core/services/shopify-track-order';
import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { AnalyticsService } from '../../core/services/analytics';
import { AiChatbotService } from '../../core/services/ai-chatbot';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <!-- Page Header -->
      <div
        class="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <span
            class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
          >
            Fulfillment & Delivery Intelligence
          </span>
          <h1
            class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tight"
          >
            Order Status & Live Tracking
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time status synced directly with official Shopify fulfillment pipelines.
          </p>
        </div>

        @if (authService.isLoggedIn() && orders().length > 0) {
          <div class="relative min-w-64">
            <span
              class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
            >
              search
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by Order # or item..."
              class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all shadow-xs"
            />
          </div>
        }
      </div>

      <!-- 1. UNAUTHENTICATED GUARD STATE -->
      @if (!authService.isLoggedIn()) {
        <div
          class="max-w-xl mx-auto text-center py-16 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl space-y-6"
        >
          <div
            class="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800/60"
          >
            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-4xl"
              >lock</span
            >
          </div>

          <div class="space-y-2">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">
              Authentication Required
            </h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              To view real-time tracking, live carrier updates, and order history, please log into
              your DigiTex account.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <a
              routerLink="/account"
              class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-600/30"
            >
              Sign In to Your Account
            </a>
            <button
              (click)="askByteForHelp('I need help finding my order details')"
              class="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-6 py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Ask Byte Advisor</span>
              <span class="text-xs">🤖</span>
            </button>
          </div>
        </div>
      }

      <!-- 2. LOGGED IN & LOADING STATE -->
      @if (authService.isLoggedIn() && isLoading()) {
        <div class="py-20 text-center space-y-4">
          <div
            class="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"
          ></div>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Syncing live orders from Shopify...
          </p>
        </div>
      }

      <!-- 3. LOGGED IN & EMPTY ORDERS STATE -->
      @if (authService.isLoggedIn() && !isLoading() && filteredOrders().length === 0) {
        <div
          class="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-4xl space-y-4"
        >
          <span class="text-5xl block">📦</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">No Orders Found</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            {{
              searchQuery()
                ? 'No orders match your search term "' + searchQuery() + '".'
                : 'You have not placed any orders with DigiTex yet.'
            }}
          </p>
          <a
            routerLink="/products"
            class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
          >
            Explore Hardware Catalog
          </a>
        </div>
      }

      <!-- 4. LOGGED IN & ORDERS DISPLAY LIST -->
      @if (authService.isLoggedIn() && !isLoading() && filteredOrders().length > 0) {
        <div class="space-y-6">
          @for (order of filteredOrders(); track order.id) {
            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-4xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <!-- Order Header -->
              <div
                class="p-6 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div class="space-y-1">
                  <div class="flex items-center gap-3">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white">
                      Order {{ order.name }}
                    </h3>
                    <span
                      class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border"
                      [ngClass]="getFulfillmentBadgeStyle(order.fulfillmentStatus)"
                    >
                      {{ order.fulfillmentStatus || 'UNFULFILLED' }}
                    </span>
                    <span
                      class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border"
                      [ngClass]="getFinancialBadgeStyle(order.financialStatus)"
                    >
                      {{ order.financialStatus }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Placed on {{ order.processedAt | date: 'mediumDate' }}
                  </p>
                </div>

                <div class="text-left sm:text-right">
                  <span class="text-xs text-slate-500 block">Total Amount</span>
                  <span class="text-2xl font-black text-slate-900 dark:text-white">
                    {{ currencyService.formatPrice(order.totalPrice) }}
                  </span>
                </div>
              </div>

              <!-- Carrier Tracking Banner (If Fulfilled) -->
              @if (order.trackingInfo.length > 0) {
                <div
                  class="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    class="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold"
                  >
                    <span class="material-symbols-outlined text-[20px]">local_shipping</span>
                    <span>
                      Carrier: {{ order.trackingInfo[0].company || 'Express Dispatch' }} • Tracking
                      #: {{ order.trackingInfo[0].number }}
                    </span>
                  </div>
                  @if (order.trackingInfo[0].url) {
                    <a
                      [href]="order.trackingInfo[0].url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 underline"
                    >
                      <span>Track Package on Carrier Website</span>
                      <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  }
                </div>
              }

              <!-- Line Items List -->
              <div class="p-6 divide-y divide-slate-100 dark:divide-slate-800">
                @for (item of order.lineItems; track item.id + $index) {
                  <div class="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-16 h-16 bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center p-1"
                      >
                        @if (item.image?.url) {
                          <img
                            [src]="item.image?.url"
                            [alt]="item.title"
                            class="w-full h-full object-cover rounded-lg"
                          />
                        } @else {
                          <span class="material-symbols-outlined text-slate-400 text-xl"
                            >inventory_2</span
                          >
                        }
                      </div>
                      <div>
                        <h4 class="font-bold text-slate-900 dark:text-white text-sm">
                          {{ item.title }}
                        </h4>
                        <p class="text-xs text-slate-500 mt-0.5">
                          Qty: {{ item.quantity }} • Unit Price:
                          {{ currencyService.formatPrice(item.price) }}
                        </p>
                      </div>
                    </div>

                    <button
                      (click)="reorderItem(item)"
                      class="text-xs font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-lg transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shrink-0"
                    >
                      + Buy Again
                    </button>
                  </div>
                }
              </div>

              <!-- Action Bar Footer -->
              <div
                class="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4"
              >
                <div class="flex items-center gap-2">
                  <button
                    (click)="askByteAboutOrder(order)"
                    class="inline-flex items-center gap-2 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <span>Ask Byte AI About Order {{ order.name }}</span>
                    <span>🤖</span>
                  </button>
                </div>

                @if (order.statusUrl) {
                  <a
                    [href]="order.statusUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline"
                  >
                    <span>View Official Shopify Receipt</span>
                    <span class="material-symbols-outlined text-[14px]">receipt_long</span>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TrackOrderComponent implements OnInit {
  public authService = inject(AuthService);
  private orderService = inject(ShopifyOrderService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private analytics = inject(AnalyticsService);
  private chatbotService = inject(AiChatbotService);

  orders = signal<ShopifyOrder[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');

  filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.orders();

    return this.orders().filter(
      (order) =>
        order.name.toLowerCase().includes(query) ||
        order.orderNumber.toString().includes(query) ||
        order.lineItems.some((item) => item.title.toLowerCase().includes(query)),
    );
  });

  async ngOnInit(): Promise<void> {
    this.analytics.trackPageView('/track-order');

    if (this.authService.isLoggedIn()) {
      const auth = this.authService as any;
      const token =
        auth.getCustomerToken?.() ??
        auth.getAccessToken?.() ??
        auth.getToken?.() ??
        auth.customerToken ??
        auth.token;

      if (token) {
        const data = await this.orderService.getCustomerOrders(token);
        this.orders.set(data);
        this.analytics.trackOrderSearch('customer_orders_list', data.length > 0);
      }
    }
    this.isLoading.set(false);
  }

  getFulfillmentBadgeStyle(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'FULFILLED':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
      case 'IN_TRANSIT':
      case 'PARTIALLY_FULFILLED':
        return 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    }
  }

  getFinancialBadgeStyle(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'PAID':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
      case 'REFUNDED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    }
  }

  async reorderItem(item: LineItem): Promise<void> {
    if (!item.variantId) return;
    await this.cartService.addToCart(item.variantId, item.quantity);
    this.cartService.openDrawer();
  }

  askByteAboutOrder(order: ShopifyOrder): void {
    const prompt = `I need assistance regarding my DigiTex Order ${order.name}. It currently shows status "${order.fulfillmentStatus || 'UNFULFILLED'}".`;
    this.chatbotService.openWithPrompt(prompt);
  }

  askByteForHelp(topic: string): void {
    this.chatbotService.openWithPrompt(topic);
  }
}

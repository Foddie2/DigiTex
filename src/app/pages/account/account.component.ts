import { Component, signal, computed, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { environment } from '../../../environments/environment.development';

import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { AuthService } from '../../core/services/auth';
import { AnalyticsService } from '../../core/services/analytics';

type TabType = 'overview' | 'orders' | 'wishlist' | 'privacy';

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  fulfillmentStatus: 'Dispatched & Tracked' | 'In Transit' | 'Delivered' | 'Processing';
  statusClass: string;
  itemCount: number;
  totalAmount: number;
  currencyCode: string;
  itemsSummary: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <!-- 1. GOOGLE SYNCED PROFILE HEADER -->
      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div class="flex items-center gap-4">
          <div class="relative">
            @if (authService.currentUser()?.picture) {
              <img
                [src]="authService.currentUser()?.picture"
                [alt]="userName()"
                referrerpolicy="no-referrer"
                (error)="authService.currentUser()!.picture = undefined"
                class="w-16 h-16 rounded-2xl border-2 border-emerald-600/20 object-cover shadow-sm"
              />
            } @else {
              <div
                class="w-16 h-16 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-black text-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50 shadow-inner"
              >
                {{ userInitials() }}
              </div>
            }
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider"
              >
                Customer Portal
              </span>
              <span
                [class]="
                  authService.isLoggedIn()
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                "
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
              >
                {{ authService.isLoggedIn() ? 'Authenticated' : 'Guest Account' }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {{ userName() }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ userEmail() }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          @if (!authService.isLoggedIn()) {
            <button
              (click)="authService.loginWithGoogle()"
              class="bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs px-5 py-3 rounded-2xl shadow-md transition cursor-pointer flex items-center gap-2.5 hover:bg-slate-800 dark:hover:bg-slate-100"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          } @else {
            <button
              (click)="authService.logout()"
              class="text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer px-3 py-2"
            >
              Sign Out
            </button>
          }
        </div>
      </div>

      <!-- 2. NAVIGATION TABS -->
      <div
        class="flex border-b border-slate-200 dark:border-slate-800 gap-6 overflow-x-auto no-scrollbar"
      >
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'overview' }"
          [class.border-emerald-600]="activeTab() === 'overview'"
          [class.text-emerald-600]="activeTab() === 'overview'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer"
        >
          Dashboard Overview
        </a>
        <a
          [routerLink]="['/account']"
          [queryParams]="{ tab: 'orders' }"
          [class.border-emerald-600]="activeTab() === 'orders'"
          [class.text-emerald-600]="activeTab() === 'orders'"
          class="pb-3 px-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition cursor-pointer flex items-center gap-2"
        >
          <span>Purchase History</span>
          @if (authService.isLoggedIn() && orders().length > 0) {
            <span
              class="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full"
            >
              {{ orders().length }}
            </span>
          }
        </a>
      </div>

      <!-- 3. OVERVIEW TAB VIEW -->
      @if (activeTab() === 'overview') {
        <div class="space-y-6">
          @if (!authService.isLoggedIn()) {
            <div
              class="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-900/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div class="space-y-1.5 max-w-xl">
                <span
                  class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider"
                >
                  Sync Google Profile
                </span>
                <h3 class="text-xl font-black">Sign in to view real-time orders & shipments</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                  Authenticate with your Google account to view synced purchase records, save
                  shipping addresses, and track real-time dispatches.
                </p>
              </div>

              <button
                (click)="authService.loginWithGoogle()"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition cursor-pointer shadow-lg whitespace-nowrap"
              >
                Authenticate with Google →
              </button>
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs"
            >
              <span
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block"
              >
                Active Session Cart
              </span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">
                {{ cartService.itemCount() }} {{ cartService.itemCount() === 1 ? 'Item' : 'Items' }}
              </h3>
              <p class="text-xs text-slate-500">
                Products currently saved in your active checkout drawer.
              </p>
              <button
                (click)="cartService.openDrawer()"
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Open Cart Drawer →
              </button>
            </div>

            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs"
            >
              <span
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block"
              >
                Total Orders Synced
              </span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">
                {{ authService.isLoggedIn() ? orders().length : 0 }} Dispatches
              </h3>
              <p class="text-xs text-slate-500">
                {{
                  authService.isLoggedIn()
                    ? 'Live order dispatches fetched directly from Shopify API.'
                    : 'Sign in to fetch your purchase records.'
                }}
              </p>
              <a
                [routerLink]="['/account']"
                [queryParams]="{ tab: 'orders' }"
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-block"
              >
                View Purchase History →
              </a>
            </div>

            <div
              class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-xs"
            >
              <span
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block"
              >
                Logistics Center
              </span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">Track Order</h3>
              <p class="text-xs text-slate-500">
                Inspect carrier updates, waybill status, and delivery progress.
              </p>
              <a
                routerLink="/track-order"
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-block"
              >
                Launch Tracker →
              </a>
            </div>
          </div>
        </div>
      }

      <!-- 4. PURCHASES & DISPATCHES TAB VIEW -->
      @if (activeTab() === 'orders') {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
        >
          <div
            class="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-2"
          >
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                Real Shopify Purchases
              </h3>
              <p class="text-xs text-slate-500">
                Verified order fulfillment records synced live from Shopify Storefront API.
              </p>
            </div>
            <a
              routerLink="/track-order"
              class="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open General Tracker →
            </a>
          </div>

          @if (isLoadingOrders()) {
            <div class="text-center py-12 space-y-3">
              <div
                class="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"
              ></div>
              <p class="text-xs font-bold text-slate-500">
                Syncing live orders from Shopify API...
              </p>
            </div>
          } @else if (!authService.isLoggedIn()) {
            <div class="text-center py-12 space-y-4 max-w-sm mx-auto">
              <span class="text-4xl block">🔒</span>
              <div class="space-y-1">
                <h4 class="text-base font-bold text-slate-900 dark:text-white">Sign In Required</h4>
                <p class="text-xs text-slate-500">
                  Please sign in with Google to view real orders synced to your profile.
                </p>
              </div>
              <button
                (click)="authService.loginWithGoogle()"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <span>Sign In with Google</span>
              </button>
            </div>
          } @else if (orders().length === 0) {
            <div class="text-center py-12 space-y-3">
              <span class="text-4xl block">📦</span>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                No Shopify Orders Found
              </h4>
              <p class="text-xs text-slate-500">
                No purchases have been recorded under {{ userEmail() }} yet.
              </p>
              <a
                routerLink="/products"
                class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Browse Catalog
              </a>
            </div>
          } @else {
            <div class="space-y-4">
              @for (order of orders(); track order.id) {
                <div
                  class="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-500/40 transition"
                >
                  <div
                    class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3"
                  >
                    <div>
                      <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Order {{ order.orderNumber }}
                      </span>
                      <span class="text-xs text-slate-400 block sm:inline sm:ml-2">
                        Placed on {{ order.date }}
                      </span>
                    </div>
                    <span
                      class="text-xs font-bold px-3 py-1 rounded-full w-max"
                      [class]="order.statusClass"
                    >
                      {{ order.fulfillmentStatus }}
                    </span>
                  </div>

                  <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div class="space-y-1 text-xs">
                      <p class="font-bold text-slate-900 dark:text-white">
                        {{ order.itemsSummary }}
                      </p>
                      <p class="text-slate-500 dark:text-slate-400">
                        Total Amount:
                        <span class="font-black text-slate-900 dark:text-white">
                          {{
                            currencyService.formatPrice({
                              amount: order.totalAmount.toString(),
                              currencyCode: order.currencyCode || 'USD',
                            })
                          }}
                        </span>
                      </p>
                    </div>

                    <a
                      [routerLink]="['/track-order']"
                      [queryParams]="{ order: order.orderNumber, email: userEmail() }"
                      class="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition whitespace-nowrap"
                    >
                      <span>Track Shipment</span>
                      <svg
                        class="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class AccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  public authService = inject(AuthService);
  private analytics = inject(AnalyticsService);

  private client = createStorefrontApiClient({
    storeDomain: environment.shopifyDomain,
    apiVersion: environment.apiVersion || '2026-01',
    publicAccessToken: environment.shopifyToken,
  });

  activeTab = signal<TabType>('overview');
  isLoadingOrders = signal<boolean>(false);
  orders = signal<CustomerOrder[]>([]);

  userName = computed(() =>
    this.authService.isLoggedIn()
      ? this.authService.currentUser()?.name || 'Valued Customer'
      : 'Guest Visitor',
  );

  userEmail = computed(() =>
    this.authService.isLoggedIn()
      ? this.authService.currentUser()?.email || ''
      : 'Sign in with Google to sync sessions',
  );

  userInitials = computed(() =>
    this.authService.isLoggedIn() ? this.authService.currentUser()?.initials || 'VC' : 'GV',
  );

  ngOnInit(): void {
    this.analytics.trackPageView('account');
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'] as TabType;
      this.activeTab.set(
        tab && ['overview', 'orders', 'wishlist', 'privacy'].includes(tab) ? tab : 'overview',
      );
    });

    if (isPlatformBrowser(this.platformId)) {
      this.syncRealShopifyOrders();
    }
  }

  /**
   * Queries real Shopify Storefront API orders using active customer session or email
   */
  async syncRealShopifyOrders(): Promise<void> {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('shopify_customer_token')
      : null;

    if (!token && !this.authService.isLoggedIn()) return;

    this.isLoadingOrders.set(true);

    try {
      if (token) {
        await this.fetchOrdersByCustomerToken(token);
      } else {
        // Fallback session lookup for active Google authenticated profile
        const email = this.authService.currentUser()?.email;
        if (email) {
          await this.fetchOrdersByCustomerEmail(email);
        }
      }
    } catch (err) {
      console.error('Failed to sync live Shopify orders:', err);
    } finally {
      this.isLoadingOrders.set(false);
    }
  }

  private async fetchOrdersByCustomerToken(customerAccessToken: string): Promise<void> {
    const query = `
      query getCustomerOrders($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                name
                orderNumber
                processedAt
                fulfillmentStatus
                financialStatus
                totalPrice {
                  amount
                  currencyCode
                }
                lineItems(first: 5) {
                  edges {
                    node {
                      title
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const { data, errors }: any = await this.client.request(query, {
      variables: { customerAccessToken },
    });

    if (errors || !data?.customer?.orders?.edges) {
      return;
    }

    const realMappedOrders: CustomerOrder[] = data.customer.orders.edges.map((edge: any) => {
      const node = edge.node;
      const items = (node.lineItems?.edges || []).map((e: any) => e.node.title);
      const itemsSummary = items.length > 0 ? items.join(', ') : 'Hardware Purchase';
      const itemCount = (node.lineItems?.edges || []).reduce(
        (sum: number, e: any) => sum + (e.node.quantity || 1),
        0,
      );

      let fulfillmentStatus: CustomerOrder['fulfillmentStatus'] = 'Processing';
      let statusClass =
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60';

      if (node.fulfillmentStatus === 'FULFILLED') {
        fulfillmentStatus = 'Delivered';
        statusClass =
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60';
      } else if (node.fulfillmentStatus === 'IN_TRANSIT') {
        fulfillmentStatus = 'In Transit';
        statusClass =
          'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60';
      } else if (node.fulfillmentStatus === 'PARTIALLY_FULFILLED') {
        fulfillmentStatus = 'Dispatched & Tracked';
        statusClass =
          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60';
      }

      return {
        id: node.id,
        orderNumber: node.name || `#KA-${node.orderNumber}`,
        date: new Date(node.processedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        fulfillmentStatus,
        statusClass,
        itemCount,
        totalAmount: parseFloat(node.totalPrice?.amount || '0'),
        currencyCode: node.totalPrice?.currencyCode || 'USD',
        itemsSummary,
      };
    });

    this.orders.set(realMappedOrders);
  }

  private async fetchOrdersByCustomerEmail(email: string): Promise<void> {
    // If token is absent, orders remain empty until full Customer Token exchange is finalized
    this.orders.set([]);
  }
}

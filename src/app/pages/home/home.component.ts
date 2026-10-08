import { Component, OnInit, signal, computed, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyService } from '../../core/services/shopify';
import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { AnalyticsService } from '../../core/services/analytics';

export interface BrandLogo {
  name: string;
  viewBox: string;
  path: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroComponent, ProductCardComponent],
  template: `
    <div class="space-y-16 pb-16 overflow-x-hidden">
      <!-- Hero Section -->
      <app-hero />

      <!-- Trust / Benefits Bar -->
      <section class="max-w-7xl mx-auto px-4 pt-12">
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-xs text-center"
        >
          <div class="space-y-1">
            <span class="text-2xl">🚚</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">
              Global Express Delivery
            </h4>
            <p class="text-sm text-slate-500">
              Tracked shipping on orders over
              {{ currencyService.formatPrice({ amount: 50, currencyCode: 'USD' }) }}
            </p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">🛡️</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">30-Day Money Back</h4>
            <p class="text-sm text-slate-500">Hassle-free return policy</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">🔒</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">Encrypted Checkout</h4>
            <p class="text-sm text-slate-500">Protected via 256-bit SSL</p>
          </div>
          <div class="space-y-1">
            <span class="text-2xl">💬</span>
            <h4 class="font-bold text-slate-900 dark:text-white text-lg">24/7 Dedicated Support</h4>
            <p class="text-sm text-slate-500">Fast email response times</p>
          </div>
        </div>
      </section>

      <!-- Featured Products (With Card Elevation & Hover Lift) -->
      <section id="featured-products" class="max-w-7xl mx-auto px-4">
        <div class="mb-8">
          <span
            class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
          >
            Real-time Catalog
          </span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Featured Drops
          </h2>
          <p class="text-slate-500 text-sm mt-1">
            Swipe or use flanking navigation arrows to explore featured hardware drops.
          </p>
        </div>

        @if (isLoading()) {
          <div class="text-center py-16 text-slate-500">
            <div
              class="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            ></div>
            Syncing catalog...
          </div>
        }

        @if (!isLoading() && products().length > 0) {
          <div class="relative group/row">
            <!-- Left Flanking Arrow -->
            <button
              (click)="scrollFeatured('left')"
              aria-label="Scroll Left"
              class="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover/row:opacity-100 active:scale-95"
            >
              ←
            </button>

            <!-- Horizontal Scroll Container -->
            <div
              #featuredContainer
              (scroll)="onFeaturedScroll($event)"
              class="flex gap-6 overflow-x-auto scroll-smooth pb-6 px-1 pt-2 no-scrollbar snap-x snap-mandatory"
            >
              @for (product of products(); track product.id) {
                <div
                  class="w-72 sm:w-80 shrink-0 snap-start transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl rounded-3xl"
                >
                  <app-product-card
                    [product]="product"
                    (selectProduct)="openProductModal($event)"
                  />
                </div>
              }

              <!-- Infinite Loading Shimmer Skeleton Cards -->
              @if (isLoadingMore()) {
                @for (shimmer of [1, 2]; track shimmer) {
                  <div
                    class="w-72 sm:w-80 shrink-0 snap-start bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between animate-pulse"
                  >
                    <div>
                      <div
                        class="w-full h-48 bg-slate-200 dark:bg-slate-700/60 relative overflow-hidden"
                      >
                        <div
                          class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-slate-600/20 to-transparent animate-shimmer"
                        ></div>
                      </div>
                      <div class="p-4 space-y-2">
                        <div class="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
                        <div class="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div
                      class="p-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center"
                    >
                      <div class="h-6 bg-slate-200 dark:bg-slate-700/60 rounded w-20"></div>
                      <div class="h-8 bg-slate-200 dark:bg-slate-700/60 rounded w-24"></div>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Right Flanking Arrow -->
            <button
              (click)="scrollFeatured('right')"
              aria-label="Scroll Right"
              class="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover/row:opacity-100 active:scale-95"
            >
              →
            </button>
          </div>
        }
      </section>

      <!-- NEW: SPONSORED PRODUCTS SECTION (Connected with Shopify) -->
      @if (!isLoading() && sponsoredProducts().length > 0) {
        <section class="max-w-7xl mx-auto px-4">
          <div
            class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 border border-emerald-800/40 p-8 sm:p-12 shadow-2xl"
          >
            <div
              class="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"
            ></div>
            <div
              class="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-500/15 blur-[100px] rounded-full pointer-events-none"
            ></div>

            <div
              class="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between"
            >
              <div class="lg:w-1/3 space-y-4">
                <span
                  class="inline-block bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest"
                >
                  Sponsored Partner Spotlight
                </span>
                <h2 class="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
                  Featured Hardware Upgrades
                </h2>
                <p class="text-slate-300 text-sm leading-relaxed">
                  Verified high-performance gear with express global shipping and instant M-Pesa or
                  card checkout.
                </p>
                <button
                  (click)="cartService.openDrawer()"
                  class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition cursor-pointer active:scale-95 transform-gpu shadow-lg"
                >
                  View Cart & Express Checkout →
                </button>
              </div>

              <div class="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                @for (product of sponsoredProducts(); track product.id) {
                  <div
                    (click)="openProductModal(product)"
                    class="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 hover:border-emerald-500/80 p-5 rounded-3xl flex gap-4 items-center cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/30 group/sponsor"
                  >
                    <div
                      class="w-24 h-24 bg-white dark:bg-slate-950 rounded-2xl overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center p-1"
                    >
                      @if (getModalImages(product)[0]) {
                        <img
                          [src]="getModalImages(product)[0]"
                          [alt]="product.title"
                          class="w-full h-full object-cover rounded-xl group-hover/sponsor:scale-105 transition-transform duration-500"
                        />
                      }
                    </div>
                    <div class="flex-1 overflow-hidden space-y-1.5">
                      <span
                        class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block"
                      >
                        {{ getBrandName(product) }}
                      </span>
                      <h4
                        class="font-bold text-white text-sm truncate group-hover/sponsor:text-emerald-300 transition-colors"
                      >
                        {{ product.title }}
                      </h4>
                      <p class="text-base font-black text-emerald-400">
                        {{ currencyService.formatPrice(getProductPrice(product)) }}
                      </p>
                      <button
                        (click)="$event.stopPropagation(); addProductToCart(product)"
                        class="text-xs font-bold text-slate-300 hover:text-white underline transition-colors"
                      >
                        Quick Add →
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </section>
      }

      <!-- Top Selling Items Showcase (With Card Elevation & Hover Lift) -->
      <section class="max-w-7xl mx-auto px-4">
        <div
          class="bg-gradient-to-br from-slate-50 via-slate-100/70 to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl transition-colors duration-300"
        >
          <div
            class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4"
          >
            <div>
              <span
                class="inline-block bg-sky-600/10 dark:bg-sky-600/20 text-sky-700 dark:text-sky-300 border border-sky-600/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2"
              >
                🔥 High Demand
              </span>
              <h2 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Top Selling Items
              </h2>
              <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Most ordered hardware & gear based on customer re-order volume.
              </p>
            </div>
            <a
              href="#featured-products"
              class="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 underline transition-colors"
            >
              View Full Collection →
            </a>
          </div>

          <div class="relative group/row">
            <!-- Left Flanking Arrow -->
            <button
              (click)="scrollTopSelling('left')"
              aria-label="Scroll Left"
              class="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover/row:opacity-100 active:scale-95"
            >
              ←
            </button>

            <!-- Horizontal Scroll Container -->
            <div
              #topSellingContainer
              class="flex gap-6 overflow-x-auto scroll-smooth pb-6 px-1 pt-2 no-scrollbar snap-x snap-mandatory"
            >
              @for (product of topSellingProducts(); track product.id; let i = $index) {
                <div
                  (click)="openProductModal(product)"
                  class="w-72 sm:w-80 shrink-0 snap-start bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 transform-gpu hover:-translate-y-2 hover:shadow-2xl hover:border-sky-600/60 shadow-sm cursor-pointer group/card"
                >
                  <div>
                    <div
                      class="relative w-full h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden"
                    >
                      <span
                        class="absolute top-2 left-2 z-10 bg-sky-600 text-slate-100 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
                      >
                        #{{ i + 1 }} Bestseller
                      </span>
                      @if (getModalImages(product)[0]) {
                        <img
                          [src]="getModalImages(product)[0]"
                          [alt]="product.title"
                          class="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        />
                      }
                    </div>

                    <div class="p-4 space-y-1">
                      <h3
                        class="font-bold text-slate-900 dark:text-white text-base truncate group-hover/card:text-emerald-600 dark:group-hover/card:text-emerald-400 transition-colors"
                      >
                        {{ product.title }}
                      </h3>
                      <p
                        class="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed"
                      >
                        {{ product.description }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="p-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between mt-2"
                  >
                    <div>
                      <span class="text-xs text-slate-500 dark:text-slate-400 block">Price</span>
                      <span class="text-lg font-black text-slate-900 dark:text-white">
                        {{ currencyService.formatPrice(getProductPrice(product)) }}
                      </span>
                    </div>
                    <button
                      (click)="$event.stopPropagation(); addProductToCart(product)"
                      class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer active:scale-95 transform-gpu"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Right Flanking Arrow -->
            <button
              (click)="scrollTopSelling('right')"
              aria-label="Scroll Right"
              class="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover/row:opacity-100 active:scale-95"
            >
              →
            </button>
          </div>
        </div>
      </section>

      <!-- REDESIGNED STATIC BRANDS GRID (Removed Infinite Scroll) -->
      <section class="max-w-7xl mx-auto px-4 py-8">
        <div class="border-y border-slate-200/80 dark:border-slate-800/80 py-10 px-4">
          <p
            class="text-center text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-8"
          >
            Verified Hardware Sourcing Partners
          </p>

          <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
            @for (brand of brandLogos; track brand.name) {
              <div
                class="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer p-2"
                [title]="brand.name"
              >
                <svg
                  class="w-28 h-7 fill-current transition-colors duration-300"
                  [attr.viewBox]="brand.viewBox"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path [attr.d]="brand.path" />
                </svg>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Problem → Solution Section -->
      <section class="bg-slate-100 dark:bg-slate-900 py-16">
        <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <span class="text-sm font-bold text-emerald-600 uppercase tracking-widest"
              >The Problem</span
            >
            <h3 class="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">
              Overpriced Hardware with Delayed Shipping.
            </h3>
            <p class="text-slate-600 dark:text-slate-400 text-md leading-relaxed">
              Most hardware resellers inflate prices and ship from overseas warehouses with no
              real-time stock verification, leading to delays and frustration for customers.
            </p>
          </div>
          <div
            class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl shadow-xs space-y-4"
          >
            <span class="text-sm font-bold text-emerald-500 uppercase tracking-widest"
              >Our Solution</span
            >
            <h4 class="text-xl font-bold text-slate-900 dark:text-white">
              Verified Stock, Competitive Pricing, and Express Global Shipping
            </h4>
            <p class="text-slate-600 dark:text-slate-400 text-md leading-relaxed">
              DigiTex integrates directly with verified hardware suppliers, providing real-time
              stock updates, competitive pricing, and express global shipping options to ensure a
              seamless purchasing experience.
            </p>
          </div>
        </div>
      </section>

      <!-- Top Rated Hardware (With Masked Gradient Endings & Card Elevation) -->
      <section class="max-w-7xl mx-auto px-4 overflow-hidden">
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
          Top Rated Hardware
        </h2>

        <!-- Linear Gradient Mask for Edge Fading -->
        <div
          class="relative w-full overflow-hidden group"
          style="mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);"
        >
          <div
            class="flex gap-6 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap py-2"
          >
            @for (product of marqueeProducts(); track $index) {
              <div
                (click)="openProductModal(product)"
                class="w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 flex gap-4 items-center shrink-0 cursor-pointer hover:border-emerald-500 transition-all duration-300 hover:shadow-xl shadow-xs"
              >
                <div
                  class="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shrink-0"
                >
                  @if (getModalImages(product)[0]) {
                    <img
                      [src]="getModalImages(product)[0]"
                      [alt]="product.title"
                      class="w-full h-full object-cover"
                    />
                  }
                </div>
                <div class="flex-1 overflow-hidden">
                  <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">
                    {{ product.title }}
                  </h4>
                  <p class="text-xs font-bold text-emerald-600 mt-1">
                    {{ currencyService.formatPrice(getProductPrice(product)) }}
                  </p>
                  <span class="text-xs text-slate-500 dark:text-slate-400 underline mt-2 block">
                    Quick View →
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- REFINED PROFESSIONAL FAQ SECTION -->
      <section id="faq" class="max-w-4xl mx-auto px-4 pt-4">
        <div class="text-center mb-8">
          <span
            class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
          >
            Customer Care
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p class="text-slate-500 text-sm mt-1">
            Everything you need to know about global dispatch, returns, and order tracking.
          </p>
        </div>

        <div class="space-y-4">
          <details
            class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-md cursor-pointer [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              class="flex justify-between items-center font-bold text-slate-900 dark:text-white text-base sm:text-lg"
            >
              <span>How long does global shipping take?</span>
              <span
                class="text-emerald-600 dark:text-emerald-400 font-black text-xl transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p
              class="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed"
            >
              Standard fulfillment processes orders within 24–48 hours. Express delivery averages
              3–7 business days worldwide depending on destination customs clearance.
            </p>
          </details>

          <details
            class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-md cursor-pointer [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              class="flex justify-between items-center font-bold text-slate-900 dark:text-white text-base sm:text-lg"
            >
              <span>What is your return policy?</span>
              <span
                class="text-emerald-600 dark:text-emerald-400 font-black text-xl transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p
              class="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed"
            >
              We offer a full 30-day return window on all unused hardware items in their original
              packaging. Return shipping labels can be requested directly from support.
            </p>
          </details>

          <details
            class="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-md cursor-pointer [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              class="flex justify-between items-center font-bold text-slate-900 dark:text-white text-base sm:text-lg"
            >
              <span>How do I track my order live?</span>
              <span
                class="text-emerald-600 dark:text-emerald-400 font-black text-xl transition-transform duration-300 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p
              class="text-sm text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 leading-relaxed"
            >
              Once dispatched, a tracking ID is generated automatically and sent via email. You can
              also monitor your live status anytime on our dedicated tracking page.
            </p>
          </details>
        </div>
      </section>
    </div>

    <!-- PRODUCT SHOWCASE MULTI-MODAL (FULLY PRESERVED) -->
    @if (selectedProduct()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
        (click)="closeProductModal()"
      >
        <div
          (click)="$event.stopPropagation()"
          class="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar"
        >
          <!-- Close Button -->
          <button
            (click)="closeProductModal()"
            aria-label="Close modal"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer z-10"
          >
            ✕
          </button>

          <!-- Top Grid: Image Showcase Gallery & Product Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- Left Column: Image Preview Gallery & Wishlist Toggle -->
            <div class="space-y-4">
              <div
                class="relative w-full h-80 bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center"
              >
                @if (activeModalImage()) {
                  <img
                    [src]="activeModalImage()"
                    [alt]="selectedProduct()?.title"
                    class="w-full h-full object-cover transition-all duration-300"
                  />
                } @else {
                  <span class="text-slate-400 text-sm">No Preview Image</span>
                }

                <!-- Wishlist Heart Toggle Button -->
                <button
                  (click)="toggleWishlist()"
                  [class.text-red-500]="isWishlisted()"
                  [class.bg-red-50]="isWishlisted()"
                  class="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md hover:scale-110 transition cursor-pointer text-slate-400"
                  title="Toggle Wishlist"
                >
                  <svg
                    class="w-5 h-5"
                    [attr.fill]="isWishlisted() ? 'currentColor' : 'none'"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <!-- Thumbnails Selector Row -->
              @if (getModalImages(selectedProduct()).length > 1) {
                <div class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  @for (imgUrl of getModalImages(selectedProduct()); track $index) {
                    <button
                      (click)="activeImageIndex.set($index)"
                      [class.ring-2]="activeImageIndex() === $index"
                      class="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0 cursor-pointer ring-emerald-600 transition"
                    >
                      <img
                        [src]="imgUrl"
                        [alt]="'Thumbnail ' + $index"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Details, Brand Badge & Regional Pricing -->
            <div class="space-y-5">
              <div>
                <span
                  class="inline-block bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2"
                >
                  {{ getBrandName(selectedProduct()) }}
                </span>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {{ selectedProduct()?.title }}
                </h3>
              </div>

              <!-- Regional Converted Pricing -->
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black text-slate-900 dark:text-white">
                  {{ currencyService.formatPrice(getProductPrice(selectedProduct())) }}
                </span>
                @if (selectedProduct()?.variants?.edges?.[0]?.node?.compareAtPrice?.amount) {
                  <span class="text-sm text-slate-400 line-through">
                    {{
                      currencyService.formatPrice(
                        selectedProduct()?.variants?.edges?.[0]?.node?.compareAtPrice
                      )
                    }}
                  </span>
                }
                <span
                  class="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60"
                >
                  Verified Stock
                </span>
              </div>

              <p
                class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-32 overflow-y-auto pr-2 no-scrollbar"
              >
                {{ selectedProduct()?.description }}
              </p>

              <!-- In-App Cart Action -->
              <button
                (click)="addProductToCart(selectedProduct())"
                [disabled]="isModalAdding()"
                class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-emerald-600/30 transition text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{{ isModalAdding() ? 'Adding to Cart...' : 'Add to Cart' }}</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>

              <!-- Safe Payment Trust Bar -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  🔒 Guaranteed Safe & Encrypted Checkout
                </span>
                <div
                  class="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span
                    class="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 rounded-md"
                  >
                    💚 M-PESA
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  >
                    💳 Visa / Mastercard
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                  >
                    🛡️ 256-Bit SSL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Grid: Smart Related Products Carousel -->
          <div class="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-bold text-slate-900 dark:text-white">
                Related Items in Catalog
              </h4>
              <span class="text-xs font-medium text-slate-500">Matched by category & brand</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (related of getSmartRelatedProducts(selectedProduct()); track related.id) {
                <div
                  (click)="openProductModal(related)"
                  class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl cursor-pointer hover:border-emerald-500 transition group flex gap-3 items-center"
                >
                  <div
                    class="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shrink-0"
                  >
                    @if (getModalImages(related)[0]) {
                      <img
                        [src]="getModalImages(related)[0]"
                        [alt]="related.title"
                        class="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    }
                  </div>
                  <div class="overflow-hidden">
                    <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {{ related.title }}
                    </h5>
                    <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {{ currencyService.formatPrice(getProductPrice(related)) }}
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes marquee {
        0% {
          transform: translateX(0%);
        }
        100% {
          transform: translateX(-50%);
        }
      }
      .animate-marquee {
        display: flex;
        width: max-content;
        animation: marquee 25s linear infinite;
      }
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 1.5s infinite;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
    `,
  ],
})
export class HomeComponent implements OnInit {
  private shopifyService = inject(ShopifyService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private analytics = inject(AnalyticsService);

  @ViewChild('featuredContainer') featuredContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('topSellingContainer') topSellingContainer!: ElementRef<HTMLDivElement>;

  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  isLoadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);

  // Modal State
  selectedProduct = signal<any | null>(null);
  activeImageIndex = signal<number>(0);
  isModalAdding = signal<boolean>(false);
  isWishlisted = signal<boolean>(false);

  // Brand Logos Data
  public brandLogos: BrandLogo[] = [
    {
      name: 'Apple',
      viewBox: '0 0 170 170',
      path: 'M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.01.12-9.87-1.93-14.58-6.14-3.24-2.88-7.14-7.59-11.72-14.13-7.53-10.74-13.32-22.75-17.37-36.03-4.05-13.28-6.08-25.75-6.08-37.4 0-14.88 3.5-27.17 10.51-36.88 7.01-9.71 15.82-14.67 26.43-14.89 4.7-.11 9.87 1.15 15.5 3.79 5.63 2.64 9.61 3.96 11.95 3.96 2.12 0 6.28-1.38 12.48-4.14 6.2-2.76 11.64-3.96 16.32-3.6 11.62.67 20.89 4.9 27.81 12.7-10.23 6.24-15.23 15.01-15 26.32.23 8.79 3.86 16.14 10.89 22.06 7.03 5.92 15.19 9.17 24.47 9.75-2.3 6.89-5.35 13.91-9.17 21.06zm-27.81-105.9c0 6.69-2.42 13.08-7.26 18.17-4.84 5.09-10.81 8.01-17.91 8.76-.12-.81-.18-1.62-.18-2.43 0-6.69 2.51-13.19 7.53-18.5 5.02-5.31 11.08-8.29 18.18-8.94.12.92.18 1.83.18 2.74z',
    },
    {
      name: 'Samsung',
      viewBox: '0 0 512 120',
      path: 'M62.6 70.8c0 9.8 11 14.5 28.5 17.5 26 4.5 50.1 10.6 50.1 33.1 0 25.8-23 38.6-62.1 38.6-35.6 0-61.1-13-61.1-36.1h32.6c0 10.3 11 15 28.5 15 17.5 0 28.5-4.5 28.5-15 0-9.8-11-13.5-28.5-16.5-26-4.5-50.1-10.6-50.1-33.1 0-25.8 23-37.6 60.1-37.6 34.6 0 58.1 11.5 58.1 34.1H114c0-8.8-9.5-13.5-25.5-13.5-16 0-25.9 4.2-25.9 13.5zm102.5-32.6h33.6l38.1 120h-32.6l-6.5-22h-32.1l-6.5 22h-32.1l38.1-120zm14 77h21l-10.5-37.1-10.5 37.1zm118.9-77h36.1l23.5 73.1 23.5-73.1h36.1v120h-30.1V82.8L370.6 158h-23l-16.5-75.2v75.2h-30.1v-120zm152.1 40c0-9.8-11-14.5-28.5-17.5-26-4.5-50.1-10.6-50.1-33.1 0-25.8 23-38.6 62.1-38.6 35.6 0 61.1 13 61.1 36.1h-32.6c0-10.3-11-15-28.5-15-17.5 0-28.5 4.5-28.5 15 0 9.8 11 13.5 28.5 16.5 26 4.5 50.1 10.6 50.1 33.1 0 25.8-23 37.6-60.1 37.6-34.6 0-58.1-11.5-58.1-34.1h32.6c0 8.8 9.5 13.5 25.5 13.5 16 0 25.9-4.2 25.9-13.5z',
    },
    {
      name: 'Sony',
      viewBox: '0 0 500 100',
      path: 'M102.7 20c-28.3 0-48.4 12.8-48.4 30 0 29.5 59.8 21.6 59.8 38.6 0 6.6-8.7 11.4-23.7 11.4-21.7 0-38.2-10-38.2-22H15c0 30.5 33.8 42 75.2 42 32.5 0 61-12.8 61-33.5 0-31.5-60.2-21-60.2-38.6 0-6.1 8.2-10 19.8-10 18 0 32.1 7 32.1 18.2h36.7C179.6 28 145.8 20 102.7 20zm134.4 0c-45.2 0-71.2 22.8-71.2 50s26 50 71.2 50 71.2-22.8 71.2-50-26-50-71.2-50zm0 76.5c-20.2 0-32-12-32-26.5s11.8-26.5 32-26.5 32 12 32 26.5-11.8 26.5-32 26.5zm115.5-76.5v60L310 20h-35v100h35V60l42.6 60h35V20h-35zm121.2 0l-28.5 45.2L416.8 20h-40l48.5 70.8V120h36.8V90.8l48.5-70.8h-40.8z',
    },
    {
      name: 'Logitech',
      viewBox: '0 0 300 120',
      path: 'M48.2 21.5c-26.6 0-48.2 21.6-48.2 48.2s21.6 48.2 48.2 48.2 48.2-21.6 48.2-48.2S74.8 21.5 48.2 21.5zm0 65.5c-9.5 0-17.3-7.7-17.3-17.3s7.7-17.3 17.3-17.3 17.3 7.7 17.3 17.3-7.8 17.3-17.3 17.3zm78.2-65.5v96.4h28.5V21.5h-28.5zm62.4 28.5c-19.8 0-35.8 16-35.8 35.8s16 35.8 35.8 35.8 35.8-16 35.8-35.8-16-35.8-35.8-35.8zm0 48.7c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9 12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9zm81.4-48.7v12.3h22.6v21.5h-22.6v23.2c0 5.4 3.9 8.2 9.5 8.2h13.1v21.5h-18c-18.7 0-27.5-9.3-27.5-27.2V21.5h22.9z',
    },
    {
      name: 'Asus',
      viewBox: '0 0 500 100',
      path: 'M110.2 20L40.8 100h38.2l12.8-18.2h56.8l12.8 18.2h38.2L128.8 20h-18.6zm8.8 22.8l18.8 26.8H92.6l18.8-26.8zM242.2 20c-35.5 0-59.8 13.8-59.8 32.5 0 31.8 68.2 22.8 68.2 38.5 0 6.8-9.8 11.2-24.8 11.2-22.8 0-41.2-10.2-41.2-22.5h-36.8c0 31.5 35.8 40.2 78 40.2 38.2 0 63.8-13.8 63.8-33.8 0-32.8-68.2-22.8-68.2-38.5 0-6.2 9.2-10.2 22.8-10.2 20.8 0 35.8 8.2 35.8 19.2h36.8C316.8 28.2 284.2 20 242.2 20zm128 0c-35.5 0-59.8 13.8-59.8 32.5 0 31.8 68.2 22.8 68.2 38.5 0 6.8-9.8 11.2-24.8 11.2-22.8 0-41.2-10.2-41.2-22.5h-36.8c0 31.5 35.8 40.2 78 40.2 38.2 0 63.8-13.8 63.8-33.8 0-32.8-68.2-22.8-68.2-38.5 0-6.2 9.2-10.2 22.8-10.2 20.8 0 35.8 8.2 35.8 19.2h36.8C444.8 28.2 412.2 20 370.2 20z',
    },
    {
      name: 'Dell',
      viewBox: '0 0 100 100',
      path: 'M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 92C26.8 92 8 73.2 8 50S26.8 8 50 8s42 18.8 42 42-18.8 42-42 42zm-28-58v32h14c8.8 0 15-5.2 15-16s-6.2-16-15-16H22zm10 24v-16h4c4.4 0 7 2.2 7 8s-2.6 8-7 8h-4zm24-24l-8 32h8l1.8-7.2h8.4l1.8 7.2h8l-8-32h-12zm3.8 17.8l2.2-8.8 2.2 8.8h-4.4zm16.2-17.8v32h18v-8h-10v-24h-8zm16 0v32h18v-8h-10v-24h-8z',
    },
  ];

  topSellingProducts = computed(() => {
    return this.products().slice(0, 4);
  });

  sponsoredProducts = computed(() => {
    return this.products().slice(4, 6);
  });

  activeModalImage = computed(() => {
    const prod = this.selectedProduct();
    if (!prod) return null;
    const images = this.getModalImages(prod);
    return images[this.activeImageIndex()] || images[0] || null;
  });

  async ngOnInit(): Promise<void> {
    this.analytics.trackPageView('home');
    try {
      const data = await this.shopifyService.getProducts(24);
      this.products.set(data || []);
    } catch (err) {
      console.error('Failed to load Shopify products:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  marqueeProducts = () => {
    const current = this.products();
    return [...current, ...current];
  };

  scrollFeatured(direction: 'left' | 'right'): void {
    if (!this.featuredContainer?.nativeElement) return;
    const amount = direction === 'left' ? -340 : 340;
    this.featuredContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }

  scrollTopSelling(direction: 'left' | 'right'): void {
    if (!this.topSellingContainer?.nativeElement) return;
    const amount = direction === 'left' ? -340 : 340;
    this.topSellingContainer.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }

  onFeaturedScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollEndThreshold = target.scrollWidth - target.scrollLeft - target.clientWidth;

    if (scrollEndThreshold < 120 && !this.isLoadingMore() && this.hasMore()) {
      this.isLoadingMore.set(true);

      setTimeout(() => {
        this.isLoadingMore.set(false);
        if (this.products().length > 40) {
          this.hasMore.set(false);
        }
      }, 1200);
    }
  }

  openProductModal(product: any): void {
    this.selectedProduct.set(product);
    this.activeImageIndex.set(0);
    this.isWishlisted.set(false);
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
  }

  toggleWishlist(): void {
    this.isWishlisted.set(!this.isWishlisted());
  }

  getBrandName(product: any): string {
    if (!product) return 'DigiTex';
    if (product.vendor) return product.vendor;

    const title = (product.title || '').toLowerCase();
    if (title.includes('apple') || title.includes('iphone') || title.includes('macbook'))
      return 'Apple';
    if (title.includes('samsung') || title.includes('galaxy')) return 'Samsung';
    if (title.includes('dell') || title.includes('inspiron') || title.includes('vostro'))
      return 'Dell';
    if (
      title.includes('hp') ||
      title.includes('pavilion') ||
      title.includes('envy') ||
      title.includes('omen') ||
      title.includes('omnibook')
    )
      return 'HP';
    if (
      title.includes('sony') ||
      title.includes('playstation') ||
      title.includes('ps5') ||
      title.includes('ps4')
    )
      return 'Sony';
    if (
      title.includes('logitech') ||
      title.includes('gaming') ||
      title.includes('gamer') ||
      title.includes('gaming mouse')
    )
      return 'Logitech';
    if (
      title.includes('asus') ||
      title.includes('zenbook') ||
      title.includes('vivoBook') ||
      title.includes('rog')
    )
      return 'Asus';

    return 'Premium Gear';
  }

  getModalImages(product: any): string[] {
    if (!product?.images?.edges) return [];
    return product.images.edges.map((edge: any) => edge.node.url);
  }

  getProductPrice(product: any): { amount: string; currencyCode: string } | null {
    if (!product) return null;
    return product.variants?.edges?.[0]?.node?.price || product.price || null;
  }

  getSmartRelatedProducts(currentProduct: any): any[] {
    if (!currentProduct) return [];
    const titleLower = (currentProduct.title || '').toLowerCase();

    const terms = [
      'dell',
      'hp',
      'lenovo',
      'apple',
      'samsung',
      'sony',
      'logitech',
      'asus',
      'headset',
      'headphones',
      'laptop',
      'monitor',
      'keyboard',
      'phone',
      'smartphone',
      'charger',
    ];

    const matchedTerm = terms.find((term) => titleLower.includes(term));

    let matches: any[] = [];
    if (matchedTerm) {
      matches = this.products().filter(
        (p) =>
          p.id !== currentProduct.id &&
          ((p.title || '').toLowerCase().includes(matchedTerm) ||
            (p.description || '').toLowerCase().includes(matchedTerm)),
      );
    }

    if (matches.length < 3) {
      const remaining = this.products().filter(
        (p) => p.id !== currentProduct.id && !matches.some((m) => m.id === p.id),
      );
      matches = [...matches, ...remaining];
    }

    return matches.slice(0, 3);
  }

  getVariantId(product: any): string {
    return product?.variants?.edges?.[0]?.node?.id || '';
  }

  async addProductToCart(product: any): Promise<void> {
    const variantId = this.getVariantId(product);
    if (!variantId) return;

    this.isModalAdding.set(true);
    try {
      await this.cartService.addToCart(variantId, 1);
      this.cartService.openDrawer();
      this.closeProductModal();
    } catch (err) {
      console.error('Failed to add product to cart:', err);
    } finally {
      this.isModalAdding.set(false);
    }
  }
}

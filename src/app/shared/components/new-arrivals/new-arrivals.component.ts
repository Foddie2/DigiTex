import { Component, OnInit, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Core Services
import { ShopifyService } from '../../../core/services/shopify';
import { CartService } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';

@Component({
  selector: 'app-new-arrivals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section
      class="py-16 lg:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header & Action Row -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200 dark:border-emerald-900/60"
            >
              ⚡ Direct Drop Release
            </span>
            <h2
              class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              New Arrivals
            </h2>
            <p class="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Freshly verified tech gear and direct-sourced hardware releases added to the catalog
              this week.
            </p>
          </div>

          <a
            routerLink="/products"
            [queryParams]="{ category: 'New_Arrivals' }"
            class="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors group cursor-pointer"
          >
            <span>Browse All Drops</span>
            <span
              class="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1"
            >
              arrow_forward
            </span>
          </a>
        </div>

        <!-- Skeleton Loading Grid -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            @for (i of [1, 2, 3, 4]; track $index) {
              <div
                class="bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 space-y-4 animate-pulse"
              >
                <div class="h-56 bg-slate-200 dark:bg-slate-700/80 rounded-xl w-full"></div>
                <div class="h-4 bg-slate-200 dark:bg-slate-700/80 rounded w-3/4"></div>
                <div class="h-3 bg-slate-200 dark:bg-slate-700/80 rounded w-1/2"></div>
                <div class="h-10 bg-slate-200 dark:bg-slate-700/80 rounded-xl w-full mt-2"></div>
              </div>
            }
          </div>
        }

        <!-- Shopify Products Grid -->
        @if (!isLoading() && products().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            @for (product of products(); track product.id) {
              <div
                class="group relative bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl overflow-hidden hover:shadow-xl hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <!-- Card Top Image Container -->
                <div
                  class="relative h-64 w-full bg-white dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4"
                >
                  <span
                    class="absolute top-3 left-3 z-10 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
                  >
                    NEW DROP
                  </span>

                  @if (getProductImage(product)) {
                    <img
                      [src]="getProductImage(product)"
                      [alt]="product.title || 'Tech Product'"
                      class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  } @else {
                    <div
                      class="text-slate-400 dark:text-slate-600 text-xs font-semibold flex flex-col items-center gap-1"
                    >
                      <span class="material-symbols-outlined text-3xl">memory</span>
                      <span>No Image Preview</span>
                    </div>
                  }
                </div>

                <!-- Product Details -->
                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3
                      class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    >
                      {{ product.title }}
                    </h3>
                    <p
                      class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed"
                    >
                      {{
                        product.description || 'Verified DigiTex high-performance hardware release.'
                      }}
                    </p>
                  </div>

                  <!-- Price & Action Trigger -->
                  <div
                    class="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <span class="text-[10px] uppercase font-semibold text-slate-400 block"
                        >Verified Price</span
                      >
                      <span class="text-lg font-black text-slate-900 dark:text-white">
                        {{ currencyService.formatPrice(getProductPrice(product)) }}
                      </span>
                    </div>

                    <button
                      (click)="addToCart(getVariantId(product))"
                      [disabled]="addingVariantId() === getVariantId(product)"
                      class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                      title="Add product to cart"
                    >
                      @if (addingVariantId() === getVariantId(product)) {
                        <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
                        <span>Adding</span>
                      } @else {
                        <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        <span>Add</span>
                      }
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Empty State -->
        @if (!isLoading() && products().length === 0) {
          <div
            class="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700"
          >
            <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">inventory_2</span>
            <p class="text-slate-600 dark:text-slate-400 font-semibold text-sm">
              No new arrivals found right now. Check back shortly for fresh drops!
            </p>
          </div>
        }
      </div>
    </section>
  `,
})
export class NewArrivalsComponent implements OnInit {
  private shopifyService = inject(ShopifyService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);

  @Output() onCartUpdated = new EventEmitter<void>();

  products = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  addingVariantId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      // Fetch the latest 8 products from Shopify Storefront API
      const fetchedProducts = await this.shopifyService.getProducts(8);
      if (fetchedProducts && fetchedProducts.length > 0) {
        this.products.set(fetchedProducts);
      }
    } catch (err) {
      console.error('Failed to load Shopify new arrivals:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  getProductImage(product: any): string | null {
    return product?.images?.edges?.[0]?.node?.url || product?.images?.[0]?.src || null;
  }

  getProductPrice(product: any): any {
    return product?.variants?.edges?.[0]?.node?.price || product?.variants?.[0]?.price || null;
  }

  getVariantId(product: any): string {
    return product?.variants?.edges?.[0]?.node?.id || product?.variants?.[0]?.id || '';
  }

  async addToCart(variantId: string): Promise<void> {
    if (!variantId) return;
    this.addingVariantId.set(variantId);

    try {
      await this.cartService.addToCart(variantId, 1);
      this.cartService.openDrawer();
      this.onCartUpdated.emit();
    } catch (err) {
      console.error('Failed adding new arrival to cart:', err);
    } finally {
      this.addingVariantId.set(null);
    }
  }
}

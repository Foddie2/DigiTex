import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

// Core Services & Models
import { ShopifyService } from '../../core/services/shopify';
import { CartService } from '../../core/services/cart';
import { CurrencyService } from '../../core/services/currency';
import { Product } from '../../core/models/shopify.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

// Shopify Product Service & Interfaces
import {
  ShopifyProductService,
  ShopifyProduct,
  ShopifyVariant,
} from '../../core/services/shopify-product';

interface BrandCollection {
  brand: string;
  products: Product[];
  isLoadingMore: boolean;
  hasMore: boolean;
}

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <!-- 1. SEO & Filter Header -->
      <div
        class="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <span
            class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
          >
            Verified Hardware & Services Catalog
          </span>
          <h1
            class="text-3xl font-black text-slate-900 dark:text-white capitalize mt-1 tracking-tight"
          >
            {{ pageTitle() }}
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Browse genuine inventory grouped by verified tech brands, hardware drops & edge
            solutions.
          </p>
        </div>

        @if (activeFilter()) {
          <button
            (click)="clearFilter()"
            class="self-start md:self-auto text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-all transform-gpu active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>✕ Clear Filter: "{{ activeFilter() }}"</span>
          </button>
        }
      </div>

      <!-- 2. Loading Skeleton -->
      @if (isLoading()) {
        <div class="space-y-10 animate-pulse">
          @for (i of [1, 2, 3]; track i) {
            <div class="space-y-4">
              <div class="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-48"></div>
              <div class="flex gap-6 overflow-hidden">
                @for (j of [1, 2, 3, 4]; track j) {
                  <div
                    class="w-72 sm:w-80 h-96 bg-slate-200 dark:bg-slate-800/80 rounded-3xl shrink-0"
                  ></div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- 3. Brand Collections with Inline Ad Slots -->
      @if (!isLoading() && brandCollections().length > 0) {
        <div class="space-y-14">
          @for (collection of brandCollections(); track collection.brand; let brandIdx = $index) {
            <section class="space-y-4">
              <!-- Collection Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {{ collection.brand }}
                  </h2>
                  <span
                    class="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60"
                  >
                    {{ collection.products.length }} Items
                  </span>
                </div>
              </div>

              <!-- Horizontal Scroll with Navigation Arrows -->
              <div class="relative group/row">
                <!-- Left Flanking Arrow -->
                <button
                  (click)="scrollContainer(brandIdx, 'left')"
                  aria-label="Scroll left"
                  class="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/row:opacity-100 active:scale-95 transform-gpu"
                >
                  ←
                </button>

                <!-- Scroll Container -->
                <div
                  #brandScrollContainer
                  (scroll)="onHorizontalScroll($event, brandIdx)"
                  class="flex gap-6 overflow-x-auto scroll-smooth pb-6 px-1 no-scrollbar snap-x snap-mandatory"
                >
                  @for (product of collection.products; track product.id; let idx = $index) {
                    <!-- Dynamic Inline Ad Slot -->
                    @if (idx === 1) {
                      <div class="w-72 sm:w-80 shrink-0 snap-start flex">
                        <div
                          class="w-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white border border-emerald-800/50 shadow-lg relative overflow-hidden group/ad transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:shadow-emerald-900/30"
                        >
                          <div
                            class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full group-hover/ad:bg-emerald-500/40 transition-colors duration-500"
                          ></div>
                          <div class="space-y-4 relative z-10">
                            <span
                              class="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/30"
                            >
                              Sponsored Partner
                            </span>
                            <h4 class="text-xl font-black text-white leading-tight">
                              Secure M-Pesa Checkout
                            </h4>
                            <p class="text-xs text-slate-300">
                              Bypass manual typing. Connect your M-Pesa number directly for instant
                              STK push confirmations at checkout.
                            </p>
                          </div>
                          <div class="pt-6 relative z-10">
                            <button
                              (click)="cartService.openDrawer()"
                              class="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3.5 rounded-xl transition cursor-pointer active:scale-95 transform-gpu shadow-md"
                            >
                              Setup Express Payment →
                            </button>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Product Card -->
                    <div
                      class="w-72 sm:w-80 shrink-0 snap-start transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:shadow-2xl rounded-3xl"
                    >
                      <app-product-card
                        [product]="product"
                        (selectProduct)="openProductModal($event)"
                      />
                    </div>
                  }

                  <!-- Endless Scroll Shimmer Effect -->
                  @if (collection.isLoadingMore) {
                    @for (shimmer of [1, 2]; track shimmer) {
                      <div
                        class="w-72 sm:w-80 shrink-0 snap-start bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-4 space-y-4 animate-pulse"
                      >
                        <div
                          class="w-full h-56 bg-slate-200 dark:bg-slate-700/60 rounded-2xl relative overflow-hidden"
                        >
                          <div
                            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-slate-600/20 to-transparent animate-shimmer"
                          ></div>
                        </div>
                        <div class="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
                        <div class="h-3 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
                      </div>
                    }
                  }
                </div>

                <!-- Right Flanking Arrow -->
                <button
                  (click)="scrollContainer(brandIdx, 'right')"
                  aria-label="Scroll right"
                  class="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover/row:opacity-100 active:scale-95 transform-gpu"
                >
                  →
                </button>
              </div>
            </section>
          }
        </div>
      }

      <!-- 4. Empty Search State -->
      @if (!isLoading() && brandCollections().length === 0) {
        <div
          class="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 shadow-sm"
        >
          <span class="text-6xl block">📡</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">
            No items match your selected filter
          </h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            We couldn't find items matching "{{ activeFilter() }}".
          </p>
          <button
            (click)="clearFilter()"
            class="mt-4 inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition cursor-pointer active:scale-95 transform-gpu shadow-md"
          >
            Clear Filters & View Full Catalog
          </button>
        </div>
      }
    </div>

    <!-- 5. MODERN GRAPHICAL PRODUCT MODAL WITH SHOPIFY INTEGRATION -->
    @if (selectedProduct()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-lg animate-fadeIn"
        (click)="closeProductModal()"
      >
        <div
          (click)="$event.stopPropagation()"
          class="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/80 shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar transform-gpu transition-all scale-100"
        >
          <!-- Close Button -->
          <button
            (click)="closeProductModal()"
            class="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer z-10 hover:scale-110 active:scale-95"
          >
            ✕
          </button>

          <!-- Modal Top Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- Left Column: Gallery -->
            <div class="space-y-4">
              <div
                class="relative w-full aspect-square bg-slate-50 dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center group"
              >
                @if (activeModalImage()) {
                  <img
                    [src]="getShopifyEdgeOptimizedImage(activeModalImage(), 800)"
                    [alt]="selectedProduct()?.title || 'Product Preview'"
                    class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                } @else {
                  <div
                    class="text-slate-400 text-xs font-semibold flex flex-col items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-4xl">inventory_2</span>
                    <span>No Preview Image</span>
                  </div>
                }
              </div>

              <!-- Thumbnails -->
              @if (getModalImages(selectedProduct()).length > 1) {
                <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  @for (imgUrl of getModalImages(selectedProduct()); track $index) {
                    <button
                      (click)="activeImageIndex.set($index)"
                      [class.ring-2]="activeImageIndex() === $index"
                      class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 cursor-pointer ring-emerald-600 transition-all transform-gpu hover:-translate-y-1 hover:shadow-md"
                    >
                      <img
                        [src]="getShopifyEdgeOptimizedImage(imgUrl, 150)"
                        alt="Thumbnail"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Details & Purchase CTA -->
            <div class="space-y-6 pt-2">
              <div>
                <span
                  class="inline-block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2"
                >
                  {{ getBrandName(selectedProduct()) }}
                </span>
                <h3
                  class="text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight"
                >
                  {{ selectedProduct()?.title }}
                </h3>
              </div>

              <div class="flex items-baseline gap-4">
                <span class="text-4xl font-black text-slate-900 dark:text-white">
                  {{ currencyService.formatPrice(getModalPrice()) }}
                </span>
                <span
                  class="text-xs font-bold px-3 py-1.5 rounded-lg border"
                  [ngClass]="
                    isCurrentVariantAvailable()
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60'
                      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'
                  "
                >
                  {{ isCurrentVariantAvailable() ? 'Ready to Dispatch' : 'Out of Stock' }}
                </span>
              </div>

              <!-- Live Shopify Product Description -->
              @if (detailedProduct()?.descriptionHtml) {
                <div
                  class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2 no-scrollbar prose dark:prose-invert"
                  [innerHTML]="detailedProduct()?.descriptionHtml"
                ></div>
              } @else {
                <p
                  class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto pr-2 no-scrollbar"
                >
                  {{
                    selectedProduct()?.description ||
                      'Verified DigiTex high-performance hardware release.'
                  }}
                </p>
              }

              <!-- Shopify Variants Selector -->
              @if (detailedProduct()?.variants && detailedProduct()!.variants.length > 1) {
                <div class="space-y-2">
                  <span
                    class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block"
                  >
                    Available Hardware Configurations
                  </span>
                  <div class="flex flex-wrap gap-2">
                    @for (v of detailedProduct()!.variants; track v.id) {
                      <button
                        (click)="selectedVariant.set(v)"
                        [disabled]="!v.availableForSale"
                        [class.ring-2]="selectedVariant()?.id === v.id"
                        [class.ring-emerald-600]="selectedVariant()?.id === v.id"
                        [class.bg-emerald-50]="selectedVariant()?.id === v.id"
                        [class.dark:bg-emerald-950/40]="selectedVariant()?.id === v.id"
                        [class.opacity-40]="!v.availableForSale"
                        class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                      >
                        {{ v.title }}
                      </button>
                    }
                  </div>
                </div>
              }

              <!-- Add to Cart CTA -->
              <button
                (click)="addToCart(selectedProduct())"
                [disabled]="isModalAdding() || !isCurrentVariantAvailable()"
                class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all transform-gpu cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                @if (isModalAdding()) {
                  <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Syncing to Cart...</span>
                } @else if (!isCurrentVariantAvailable()) {
                  <span class="material-symbols-outlined text-[18px]">block</span>
                  <span>Currently Out of Stock</span>
                } @else {
                  <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>Add Item to Cart</span>
                }
              </button>

              <!-- Safe Payment Trust Bar -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span
                  class="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block"
                >
                  🔒 Guaranteed Safe & Encrypted Checkout
                </span>
                <div
                  class="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span
                    class="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-lg font-bold flex items-center gap-1"
                  >
                    💚 M-Pesa
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1"
                  >
                    💳 Visa / Mastercard
                  </span>
                  <span
                    class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1"
                  >
                    🛡️ 256-Bit SSL
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Section: Related Items in Catalog -->
          @if (getRelatedProducts(selectedProduct()).length > 0) {
            <div class="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <h4 class="text-base font-black text-slate-900 dark:text-white">
                  Related Items in Catalog
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Matched by category & brand
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                @for (related of getRelatedProducts(selectedProduct()); track related.id) {
                  <div
                    (click)="openProductModal(related)"
                    class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-3 rounded-2xl cursor-pointer hover:border-emerald-500 transition-all duration-200 transform-gpu hover:-translate-y-1 group/rel flex gap-3 items-center"
                  >
                    <div
                      class="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center"
                    >
                      @if (getModalImages(related)[0]) {
                        <img
                          [src]="getShopifyEdgeOptimizedImage(getModalImages(related)[0], 150)"
                          [alt]="related.title"
                          class="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-300"
                        />
                      } @else {
                        <span class="material-symbols-outlined text-slate-400 text-lg">memory</span>
                      }
                    </div>
                    <div class="overflow-hidden">
                      <h5
                        class="text-xs font-bold text-slate-900 dark:text-white truncate group-hover/rel:text-emerald-600 dark:group-hover/rel:text-emerald-400 transition-colors"
                      >
                        {{ related.title }}
                      </h5>
                      <p class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                        {{ currencyService.formatPrice(getProductPrice(related)) }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    }
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
export class ProductsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shopifyService = inject(ShopifyService);
  private shopifyProductService = inject(ShopifyProductService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);

  @ViewChildren('brandScrollContainer') scrollContainers!: QueryList<ElementRef<HTMLDivElement>>;

  allProducts = signal<Product[]>([]);
  isLoading = signal<boolean>(true);
  pageTitle = signal<string>('All Products');
  activeFilter = signal<string>('');
  brandCollections = signal<BrandCollection[]>([]);

  selectedProduct = signal<Product | null>(null);
  detailedProduct = signal<ShopifyProduct | null>(null);
  selectedVariant = signal<ShopifyVariant | null>(null);
  activeImageIndex = signal<number>(0);
  isModalAdding = signal<boolean>(false);

  activeModalImage = computed(() => {
    const prod = this.selectedProduct();
    if (!prod) return null;
    const images = this.getModalImages(prod);
    return images[this.activeImageIndex()] || images[0] || null;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (params) => {
      const category = params['category'] || null;
      const feature = params['features'] || null;
      const q = params['q'] || null;

      await this.fetchAndProcessProducts(category, feature, q);
    });
  }

  private async fetchAndProcessProducts(
    category: string | null,
    feature: string | null,
    q: string | null,
  ): Promise<void> {
    this.isLoading.set(true);
    try {
      if (this.allProducts().length === 0) {
        const fetched = await this.shopifyService.getProducts(100);
        this.allProducts.set(fetched || []);
      }
      this.applyFilterAndGroup(category, feature, q);
    } catch (err) {
      console.error('Failed to load products catalog:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private applyFilterAndGroup(
    category?: string | null,
    feature?: string | null,
    q?: string | null,
  ): void {
    let filtered = [...this.allProducts()];
    const active = category || feature || q || '';
    this.activeFilter.set(active.replace(/_/g, ' '));

    if (category) {
      const normalizedCat = category.toLowerCase().replace(/_/g, ' ');
      this.pageTitle.set(`Category: ${category.replace(/_/g, ' ')}`);

      filtered = filtered.filter((p: any) => {
        const productType = (p.productType || '').toLowerCase();
        const tags = (p.tags || []).map((t: string) => t.toLowerCase());
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const vendor = (p.vendor || '').toLowerCase();

        return (
          productType.includes(normalizedCat) ||
          tags.some((t: string) => t.includes(normalizedCat)) ||
          title.includes(normalizedCat) ||
          desc.includes(normalizedCat) ||
          vendor.includes(normalizedCat)
        );
      });
    } else if (feature === 'New_Arrivals') {
      this.pageTitle.set('New Arrivals Catalog');
      filtered = [...filtered].reverse();
    } else if (q) {
      this.pageTitle.set(`Search: "${q}"`);
      const query = q.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const vendor = (p.vendor || '').toLowerCase();
        return title.includes(query) || desc.includes(query) || vendor.includes(query);
      });
    } else {
      this.pageTitle.set('All Products');
    }

    const groups: Record<string, Product[]> = {};
    filtered.forEach((product) => {
      const brand = this.getBrandName(product);
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(product);
    });

    const collections: BrandCollection[] = Object.keys(groups).map((brand) => ({
      brand,
      products: groups[brand],
      isLoadingMore: false,
      hasMore: groups[brand].length >= 4,
    }));

    this.brandCollections.set(collections);
  }

  clearFilter(): void {
    this.activeFilter.set('');
    this.applyFilterAndGroup(null, null, null);
  }

  getBrandName(product: any): string {
    if (!product) return 'DigiTex Tech';
    if (product.vendor) return product.vendor;
    const title = (product.title || '').toLowerCase();
    if (title.includes('apple') || title.includes('iphone') || title.includes('macbook'))
      return 'Apple';
    if (title.includes('samsung')) return 'Samsung';
    if (title.includes('dell')) return 'Dell';
    if (title.includes('hp')) return 'HP';
    if (title.includes('lenovo')) return 'Lenovo';
    return 'Premium Gear';
  }

  getShopifyEdgeOptimizedImage(url: string | null, width: number): string {
    if (!url) return '';
    if (url.includes('cdn.shopify.com')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}width=${width}&crop=center`;
    }
    return url;
  }

  getProductPrice(product: any): any {
    if (!product) return null;
    return (
      product?.variants?.edges?.[0]?.node?.price ||
      product?.variants?.[0]?.price ||
      product?.price ||
      null
    );
  }

  getVariantId(product: any): string {
    if (!product) return '';
    return (
      product?.variants?.edges?.[0]?.node?.id || product?.variants?.[0]?.id || product?.id || ''
    );
  }

  getModalImages(product: any): string[] {
    if (!product) return [];
    if (product.images?.edges && Array.isArray(product.images.edges)) {
      return product.images.edges
        .map((edge: any) => edge.node?.url || edge.node?.src)
        .filter(Boolean);
    }
    if (Array.isArray(product.images)) {
      return product.images
        .map((img: any) => (typeof img === 'string' ? img : img.src || img.url))
        .filter(Boolean);
    }
    return [];
  }

  getModalPrice(): any {
    const variant = this.selectedVariant();
    if (variant) return variant.price;
    return this.getProductPrice(this.selectedProduct());
  }

  isCurrentVariantAvailable(): boolean {
    const variant = this.selectedVariant();
    if (variant !== null) return variant.availableForSale;
    const prod = this.selectedProduct() as any;
    if (prod && typeof prod.availableForSale === 'boolean') return prod.availableForSale;
    return true;
  }

  scrollContainer(index: number, direction: 'left' | 'right'): void {
    const containers = this.scrollContainers.toArray();
    if (containers[index]) {
      const el = containers[index].nativeElement;
      const amount = direction === 'left' ? -350 : 350;
      el.scrollBy({ left: amount, behavior: 'smooth' });
    }
  }

  onHorizontalScroll(event: Event, brandIndex: number): void {
    const target = event.target as HTMLElement;
    const scrollEndThreshold = target.scrollWidth - target.scrollLeft - target.clientWidth;

    if (scrollEndThreshold < 100) {
      const current = this.brandCollections();
      const col = current[brandIndex];
      if (col && !col.isLoadingMore && col.hasMore) {
        col.isLoadingMore = true;
        this.brandCollections.set([...current]);
        setTimeout(() => {
          col.isLoadingMore = false;
          col.hasMore = col.products.length < 12;
          this.brandCollections.set([...current]);
        }, 1200);
      }
    }
  }

  async openProductModal(product: Product): Promise<void> {
    this.selectedProduct.set(product);
    this.detailedProduct.set(null);
    this.selectedVariant.set(null);
    this.activeImageIndex.set(0);

    // Background fetch deep live product configs from Shopify via handle
    if (product.handle) {
      const detailed = await this.shopifyProductService.getProductByHandle(product.handle);
      if (detailed) {
        this.detailedProduct.set(detailed);
        if (detailed.variants.length > 0) {
          const firstAvailable =
            detailed.variants.find((v) => v.availableForSale) || detailed.variants[0];
          this.selectedVariant.set(firstAvailable);
        }
      }
    }
  }

  closeProductModal(): void {
    this.selectedProduct.set(null);
    this.detailedProduct.set(null);
    this.selectedVariant.set(null);
  }

  getRelatedProducts(currentProduct: any): Product[] {
    if (!currentProduct) return [];
    const brand = this.getBrandName(currentProduct);
    return this.allProducts()
      .filter((p) => p.id !== currentProduct.id && this.getBrandName(p) === brand)
      .slice(0, 3);
  }

  async addToCart(product: any): Promise<void> {
    const variant = this.selectedVariant();
    const variantId = variant ? variant.id : this.getVariantId(product);
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

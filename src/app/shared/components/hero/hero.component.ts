import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ShopifyService } from '../../../core/services/shopify';
import { CartService } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';

interface HeroSlide {
  tagline: string;
  headline: string;
  highlightText: string;
  description: string;
  product?: any;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="relative overflow-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-16 lg:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200"
    >
      <!-- Ambient Background Glows -->
      <div
        aria-hidden="true"
        class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"
      ></div>
      <div
        aria-hidden="true"
        class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"
      ></div>

      <div
        class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"
      >
        <!-- Left Column: Synchronized Carousel Copy & Dual CTAs -->
        <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
          <!-- Slide Pill & Progress Controls -->
          <div class="flex items-center justify-center lg:justify-start gap-3">
            <div class="flex items-center gap-2 ml-2">
              @for (slide of slides(); track $index) {
                <button
                  (click)="setSlide($index)"
                  [class.w-6]="currentIndex() === $index"
                  [class.bg-emerald-600]="currentIndex() === $index"
                  [class.dark:bg-emerald-500]="currentIndex() === $index"
                  [class.w-2]="currentIndex() !== $index"
                  [class.bg-slate-300]="currentIndex() !== $index"
                  [class.dark:bg-slate-700]="currentIndex() !== $index"
                  class="h-2 rounded-full transition-all duration-300 cursor-pointer"
                  [attr.aria-label]="'Go to slide ' + ($index + 1)"
                ></button>
              }
            </div>
          </div>

          <!-- CSS Grid Overlay Copy Container (Eliminates Text Heights Shaking) -->
          <div class="grid grid-cols-1 grid-rows-1">
            @for (slide of slides(); track $index) {
              <div
                class="col-start-1 row-start-1 space-y-6 transition-all duration-500 ease-in-out flex flex-col justify-center"
                [class.opacity-100]="$index === currentIndex()"
                [class.translate-y-0]="$index === currentIndex()"
                [class.pointer-events-auto]="$index === currentIndex()"
                [class.opacity-0]="$index !== currentIndex()"
                [class.translate-y-1]="$index !== currentIndex()"
                [class.pointer-events-none]="$index !== currentIndex()"
              >
                <!-- Dynamic Headline -->
                <h1
                  class="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight"
                >
                  {{ slide.headline }}
                  <span
                    class="block text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-indigo-500 to-sky-600 dark:from-emerald-400 dark:via-indigo-300 dark:to-sky-400 mt-1"
                  >
                    {{ slide.highlightText }}
                  </span>
                </h1>

                <!-- Dynamic Description -->
                <p
                  class="text-slate-600 dark:text-slate-300 text-md sm:text-lg lg:text-xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  {{ slide.description }}
                </p>
              </div>
            }
          </div>

          <!-- Dual CTAs -->
          <div
            class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <a
              href="#featured-products"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-md"
            >
              <span>Explore more Products</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>

            <!-- <a
              href="#faq"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold px-7 py-4 rounded-xl transition-all duration-200 text-md shadow-sm"
            >
              How It Works
            </a> -->
          </div>

          <!-- Trust Badges -->
          <div
            class="pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0 transition-colors duration-200"
          >
            <div>
              <div
                class="flex items-center justify-center lg:justify-start gap-1 text-amber-500 dark:text-amber-400 text-sm font-bold"
              >
                <span>★</span> 4.9/5
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                2,400+ Verified Buyers
              </p>
            </div>

            <div>
              <div class="text-sm font-bold text-slate-900 dark:text-slate-200">30 Days</div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Risk-Free Guarantee</p>
            </div>

            <div>
              <div class="text-sm font-bold text-slate-900 dark:text-slate-200">
                Direct Delivery
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tracked Express Shipping
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Product Showcase Grid-Stacked Synchronized Cards -->
        <div class="lg:col-span-5 flex justify-center">
          <div class="relative w-full max-w-md">
            <!-- Glow Outline -->
            <div
              aria-hidden="true"
              class="absolute -inset-1 bg-linear-to-r from-emerald-500 to-indigo-500 rounded-3xl blur opacity-25 dark:opacity-30"
            ></div>

            <!-- CSS Grid Overlay Product Card Stack -->
            <div class="grid grid-cols-1 grid-rows-1 w-full">
              @for (slide of slides(); track $index) {
                <div
                  class="col-start-1 row-start-1 transition-all duration-500 ease-in-out transform"
                  [class.opacity-100]="$index === currentIndex()"
                  [class.scale-100]="$index === currentIndex()"
                  [class.pointer-events-auto]="$index === currentIndex()"
                  [class.opacity-0]="$index !== currentIndex()"
                  [class.scale-95]="$index !== currentIndex()"
                  [class.pointer-events-none]="$index !== currentIndex()"
                >
                  <div
                    class="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-200 overflow-hidden"
                  >
                    @if (slide.product) {
                      <div>
                        <!-- Fixed Height Image Container -->
                        <div
                          class="relative h-64 w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden"
                        >
                          @if (getSlideImageUrl(slide.product)) {
                            <img
                              [src]="getSlideImageUrl(slide.product)"
                              [alt]="slide.product?.title || 'Product Image'"
                              class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                              loading="eager"
                            />
                          } @else {
                            <div class="text-slate-400 dark:text-slate-500 text-xs">
                              Shopify Product Preview
                            </div>
                          }

                          <span
                            class="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow z-10"
                          >
                            Top Pick #{{ $index + 1 }}
                          </span>
                        </div>

                        <!-- Card Body Content with Fixed Text Height Boxes -->
                        <div class="p-6 space-y-4">
                          <div>
                            <h3
                              class="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 h-7"
                            >
                              {{ slide.product?.title }}
                            </h3>
                            <p
                              class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-9 mt-1 leading-relaxed"
                            >
                              {{ slide.product?.description }}
                            </p>
                          </div>

                          <!-- Price & In-App Cart Action -->
                          <div
                            class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 transition-colors duration-200"
                          >
                            <div>
                              <span class="text-xs text-slate-500 dark:text-slate-400 block"
                                >Retail Price</span
                              >
                              <span class="text-2xl font-black text-slate-900 dark:text-white">
                                {{
                                  currencyService.formatPrice(
                                    slide.product?.variants?.edges?.[0]?.node?.price
                                  )
                                }}
                              </span>
                            </div>

                            <button
                              (click)="addToCart(getVariantId(slide.product))"
                              [disabled]="isAdding()"
                              class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-3 rounded-lg shadow-md transition cursor-pointer"
                            >
                              {{ isAdding() ? 'Adding...' : 'Add to Cart' }}
                            </button>
                          </div>
                        </div>
                      </div>
                    } @else {
                      <!-- Skeleton Loader -->
                      <div class="space-y-4 animate-pulse p-6">
                        <div class="h-60 bg-slate-200 dark:bg-slate-700/50 rounded-xl w-full"></div>
                        <div class="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-3/4"></div>
                        <div class="h-3 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2"></div>
                        <div
                          class="h-10 bg-slate-200 dark:bg-slate-700/50 rounded w-full mt-4"
                        ></div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent implements OnInit, OnDestroy {
  private shopifyService = inject(ShopifyService);
  public cartService = inject(CartService);
  public currencyService = inject(CurrencyService);
  private platformId = inject(PLATFORM_ID);

  @Output() onCartUpdated = new EventEmitter<void>();

  currentIndex = signal<number>(0);
  isAdding = signal<boolean>(false);
  private intervalId: any = null;

  slides = signal<HeroSlide[]>([
    {
      tagline: 'Smart Products • Everyday Solutions',
      headline: 'Practical Tools Designed to Make Daily Tasks',
      highlightText: 'Easier, Faster & Better.',
      description:
        'Discover a curated selection of electronics and accessories that enhance your home, office, and lifestyle with efficiency and style.',
    },
    {
      tagline: 'Premium Performance • Zero Hassle',
      headline: 'Hardware Engineered For',
      highlightText: 'Uncompromised Efficiency.',
      description:
        'Upgrade your workspace with direct-sourced electronics and high-durability accessories built to perform under pressure.',
    },
    {
      tagline: 'Trending Hardware • Express Shipping',
      headline: 'Curated Electronics Sourced Directly For',
      highlightText: 'Modern Connected Homes.',
      description:
        'Explore our handpicked collection of smart home devices and accessories, designed to seamlessly integrate into your lifestyle and elevate your living space.',
    },
  ]);

  activeSlide = computed(() => this.slides()[this.currentIndex()]);

  async ngOnInit(): Promise<void> {
    try {
      const products = await this.shopifyService.getProducts(3);
      if (products && products.length > 0) {
        this.slides.update((currentSlides) =>
          currentSlides.map((slide, index) => ({
            ...slide,
            product: products[index % products.length],
          })),
        );
      }
    } catch (err) {
      console.error('Failed to load hero shopify products:', err);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.intervalId = setInterval(() => {
      this.currentIndex.update((idx) => (idx + 1) % this.slides().length);
    }, 6000);
  }

  private stopAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setSlide(index: number): void {
    this.currentIndex.set(index);
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  getSlideImageUrl(item: any): string | null {
    return item?.images?.edges?.[0]?.node?.url || null;
  }

  getVariantId(item: any): string {
    return item?.variants?.edges?.[0]?.node?.id || '';
  }

  async addToCart(variantId: string): Promise<void> {
    if (!variantId) return;
    this.isAdding.set(true);
    try {
      await this.cartService.addToCart(variantId, 1);
      this.cartService.openDrawer();
      this.onCartUpdated.emit();
    } catch (err) {
      console.error('Hero add-to-cart failed:', err);
    } finally {
      this.isAdding.set(false);
    }
  }
}

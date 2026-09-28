import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart';
import { CurrencyService } from '../../../core/services/currency';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="selectProduct.emit(product)"
      class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-emerald-500 transition-all duration-300 cursor-pointer shadow-sm group h-full"
    >
      <!-- Flush Product Image Container (No Outer Padding) -->
      <div class="relative w-full h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
        @if (getImageUrl()) {
          <img
            [src]="getImageUrl()"
            [alt]="product.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        }
      </div>

      <!-- Padded Content Container -->
      <div class="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3
            class="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-emerald-600 transition-colors"
          >
            {{ product.title }}
          </h3>
          <p class="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mt-1">
            {{ product.description }}
          </p>
        </div>

        <div
          class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between mt-4"
        >
          <div>
            <span class="text-xs text-slate-400 block">Price</span>
            <span class="text-lg font-black text-slate-900 dark:text-white">
              {{ currencyService.formatPrice(product) }}
            </span>
          </div>
          <button
            (click)="$event.stopPropagation(); addToCart()"
            [disabled]="isAdding"
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {{ isAdding ? 'Adding...' : 'Add to Cart' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: any;
  @Output() selectProduct = new EventEmitter<any>();

  public currencyService = inject(CurrencyService);
  private cartService = inject(CartService);

  isAdding = false;

  getImageUrl(): string | null {
    return this.product?.images?.edges?.[0]?.node?.url || null;
  }

  async addToCart(): Promise<void> {
    const variantId = this.product?.variants?.edges?.[0]?.node?.id || '';
    if (!variantId) return;

    this.isAdding = true;
    try {
      await this.cartService.addToCart(variantId, 1);
      this.cartService.openDrawer();
    } finally {
      this.isAdding = false;
    }
  }
}

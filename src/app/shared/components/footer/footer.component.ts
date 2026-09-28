import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer
      class="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200"
    >
      <!-- Top Newsletter Subscription Bar -->
      <div class="border-b border-slate-200 dark:border-slate-800 py-10">
        <div
          class="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div class="space-y-1 text-center md:text-left">
            <h3
              class="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2"
            >
              <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400"
                >mark_email_unread</span
              >
              <span>Subscribe to Tech Alerts</span>
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Get early notification on inventory drops, tech guides, and exclusive discount codes.
            </p>
          </div>

          <div class="w-full md:w-auto">
            @if (!subscribed()) {
              <form (submit)="onSubscribe($event)" class="flex gap-2 max-w-md w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  class="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 flex-1 min-w-60"
                />
                <button
                  type="submit"
                  class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Subscribe</span>
                  <span class="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            } @else {
              <div
                class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Thank you for subscribing!</span>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <!-- Brand & Social Column -->
          <div class="lg:col-span-2 space-y-4">
            <a
              routerLink="/"
              class="rubik-glitch-regular text-3xl text-slate-900 dark:text-white tracking-wide flex items-center gap-1 group transition-transform duration-200 active:scale-95"
              aria-label="DigiTex E-Commerce Home"
            >
              <span class="text-emerald-600 dark:text-emerald-500">Digi</span>Tex
            </a>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Your destination for high-performance electronics and verified accessories. Synced
              directly via Shopify Storefront APIs for fast global dispatch.
            </p>

            <!-- Social Media Links -->
            <div class="flex items-center gap-3 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition"
                title="Follow on X"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition"
                title="Follow on Instagram"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center transition"
                title="Follow on Facebook"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-2">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <span class="material-symbols-outlined text-[16px]">lock</span>
                <span>256-Bit SSL Encrypted</span>
              </span>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <span class="material-symbols-outlined text-[16px]">local_shipping</span>
                <span>Tracked Express Shipping</span>
              </span>
            </div>
          </div>

          <!-- Catalog Column -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Catalog
            </h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Laptops' }"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Laptops</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Smartphones' }"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Smartphones</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Headphones' }"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Headphones</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Accessories' }"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Accessories</a
                >
              </li>
            </ul>
          </div>

          <!-- Customer Service Column -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Customer Care
            </h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  routerLink="/track-order"
                  class="hover:text-emerald-600 dark:hover:text-white transition font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[16px]">local_shipping</span>
                  <span>Track Order</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/#faq"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Shipping Policy</a
                >
              </li>
              <li>
                <a
                  routerLink="/#faq"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >30-Day Money Back</a
                >
              </li>
              <li>
                <a
                  routerLink="/#faq"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Help Center / FAQ</a
                >
              </li>
            </ul>
          </div>

          <!-- Legal Pages Column -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Legal
            </h4>
            <ul class="space-y-2 text-sm">
              <li>
                <a
                  routerLink="/privacy-policy"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Privacy Policy</a
                >
              </li>
              <li>
                <a
                  routerLink="/terms-of-service"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Terms of Service</a
                >
              </li>
              <li>
                <a
                  routerLink="/cookie-policy"
                  class="hover:text-emerald-600 dark:hover:text-white transition"
                  >Cookie Policy</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 my-10"></div>

        <!-- Bottom Bar -->
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400"
        >
          <p>© {{ currentYear }} DigiTex. All rights reserved. Headless Shopify Integration.</p>

          <div
            class="flex flex-wrap items-center gap-2 font-mono text-slate-600 dark:text-slate-400"
          >
            <span class="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-bold"
              >VISA</span
            >
            <span class="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-bold"
              >MASTERCARD</span
            >
            <span class="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-bold"
              >AMEX</span
            >
            <span class="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-bold"
              >PAYPAL</span
            >
            <span class="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-[10px] font-bold"
              >APPLE PAY</span
            >
            <span
              class="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/20"
              >M-PESA</span
            >
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .rubik-glitch-regular {
        font-family: 'Rubik Glitch', system-ui;
        font-weight: 400;
        font-style: normal;
      }
      .press-start-2p-regular {
        font-family: 'Press Start 2P', system-ui;
        font-weight: 400;
        font-style: normal;
      }
    `,
  ],
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  subscribed = signal<boolean>(false);

  onSubscribe(event: Event): void {
    event.preventDefault();
    this.subscribed.set(true);
  }
}

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer
      class="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300 relative overflow-hidden"
    >
      <!-- Top Newsletter Subscription Bar -->
      <div
        class="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/40 py-8 sm:py-10"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden"
          >
            <!-- Background Emerald Glow Accent -->
            <div
              class="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"
            ></div>

            <div class="space-y-1.5 text-center lg:text-left max-w-xl">
              <span
                class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60"
              >
                <!-- <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> -->
                Exclusive Bytes
              </span>
              <h3
                class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center lg:justify-start gap-2"
              >
                <span>Subscribe to Tech Alerts</span>
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Get early notifications on restock hardware drops, tech guides, and exclusive M-Pesa
                discount codes.
              </p>
            </div>

            <div class="w-full lg:w-auto shrink-0">
              @if (!subscribed()) {
                <form
                  (submit)="onSubscribe($event)"
                  class="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto lg:mx-0 w-full"
                >
                  <div class="relative flex-1">
                    <span
                      class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]"
                    >
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-all shadow-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-all transform-gpu cursor-pointer active:scale-95 flex items-center justify-center gap-2 shrink-0 shadow-md shadow-emerald-600/20"
                  >
                    <span>Join Club</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </form>
              } @else {
                <div
                  class="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <span class="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Welcome to DigiTex Insider! Check your inbox.</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer Columns Grid -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <!-- Brand & Bio Column (Spans full width on mobile, 2 columns on lg) -->
          <div class="col-span-2 md:col-span-4 lg:col-span-2 space-y-5">
            <a
              routerLink="/"
              class="rubik-glitch-regular text-3xl text-slate-900 dark:text-white tracking-wide inline-flex items-center gap-1 group transition-transform duration-200 active:scale-95"
              aria-label="DigiTex E-Commerce Home"
            >
              <span class="text-emerald-600 dark:text-emerald-500">Digi</span>Tex
            </a>

            <p
              class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm"
            >
              Your global destination for high-performance electronics, gaming gear, and mobile
              accessories. Synced live via Shopify Storefront GraphQL APIs for instant dispatch.
            </p>

            <!-- Live Shopify API Status Indicator -->
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Online & Syncing </span>
            </div>

            <!-- Social Media Buttons -->
            <div class="flex items-center gap-2.5 pt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 flex items-center justify-center transform-gpu hover:-translate-y-0.5"
                aria-label="Follow DigiTex on X"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:border-pink-500/50 hover:shadow-md transition-all duration-200 flex items-center justify-center transform-gpu hover:-translate-y-0.5"
                aria-label="Follow DigiTex on Instagram"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/50 hover:shadow-md transition-all duration-200 flex items-center justify-center transform-gpu hover:-translate-y-0.5"
                aria-label="Follow DigiTex on Facebook"
              >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Catalog Column -->
          <div class="col-span-1 space-y-3.5">
            <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Catalog
            </h4>
            <ul class="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Laptops' }"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Laptops & PCs</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Smartphones' }"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Smartphones</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Headphones' }"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Audio & Headphones</a
                >
              </li>
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Accessories' }"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Tech Accessories</a
                >
              </li>
            </ul>
          </div>

          <!-- Customer Service Column -->
          <div class="col-span-1 space-y-3.5">
            <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Customer Care
            </h4>
            <ul class="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  routerLink="/track-order"
                  class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-[16px]">local_shipping</span>
                  <span>Track Order Status</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/#faq"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Shipping Policy</a
                >
              </li>
              <li>
                <a
                  routerLink="/#faq"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >30-Day Guarantee</a
                >
              </li>
              <li>
                <a
                  routerLink="/#faq"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Help Center / FAQ</a
                >
              </li>
            </ul>
          </div>

          <!-- Legal Pages Column -->
          <div class="col-span-2 sm:col-span-1 space-y-3.5">
            <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Legal & Trust
            </h4>
            <ul class="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  routerLink="/privacy-policy"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Privacy Policy</a
                >
              </li>
              <li>
                <a
                  routerLink="/terms-of-service"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Terms of Service</a
                >
              </li>
              <li>
                <a
                  routerLink="/cookie-policy"
                  class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block hover:translate-x-1 transform-gpu duration-200"
                  >Cookie Consent</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800/80 my-8 sm:my-10"></div>

        <!-- Bottom Bar: Copyright & Styled Payment Gateway Badges -->
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center md:text-left"
        >
          <p>
            © {{ currentYear }} DigiTex Store Inc. All rights reserved. Built on Shopify Storefront
            API.
          </p>

          <!-- Payment Badges Pills -->
          <div
            class="flex flex-wrap justify-center items-center gap-2 font-mono text-[10px] font-bold"
          >
            <span
              class="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-500/20 flex items-center gap-1"
            >
              💚 M-PESA
            </span>
            <span
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
            >
              VISA
            </span>
            <span
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
            >
              MASTERCARD
            </span>
            <span
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
            >
              APPLE PAY
            </span>
            <span
              class="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300"
            >
              PAYPAL
            </span>
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span
          class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
        >
          Store Agreement
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          Terms of Service
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Effective Date: September 2026
        </p>
      </div>

      <div class="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section
          class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <strong class="text-base text-slate-900 dark:text-white block">1. Agreement Terms</strong>
          <p>
            By accessing or placing orders through TechBytes Store, you agree to adhere to these
            Terms of Service. All transactions are backed by official Shopify Storefront
            infrastructure.
          </p>
        </section>

        <section
          class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <strong class="text-base text-slate-900 dark:text-white block"
            >2. Inventory & Order Processing</strong
          >
          <p>
            Product descriptions, live stock quantities, and prices are synced directly from our
            inventory system. We reserve the right to cancel orders if stock mismatches occur or
            payment flags indicate suspicious activity.
          </p>
        </section>

        <section
          class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <strong class="text-base text-slate-900 dark:text-white block"
            >3. Returns & Refunds</strong
          >
          <p>
            Physical items qualify for a full refund or exchange within 30 days of delivery provided
            they remain undamaged in original packaging. Return logistics details can be requested
            via customer support.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class TermsOfServiceComponent {}

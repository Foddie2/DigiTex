import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span
          class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
        >
          Legal Compliance
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          Privacy Policy
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Effective Date: September 2026 • Last Updated: Real-time Shopify Synced
        </p>
      </div>

      <div class="space-y-6 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        <section
          class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <strong class="text-base text-slate-900 dark:text-white block">1. Overview</strong>
          <p>
            TechBytes Store ("we", "our", or "us") operates a headless e-commerce storefront powered
            by Shopify Storefront APIs. This Privacy Policy details how we collect, store, process,
            and protect your personal data when browsing or ordering hardware items.
          </p>
        </section>

        <section
          class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <strong class="text-base text-slate-900 dark:text-white block">2. Data We Collect</strong>
          <ul class="list-disc pl-5 space-y-2">
            <li>
              <strong>Order Fulfillment Data:</strong> Name, shipping address, phone number, and
              email address collected during checkout.
            </li>
            <li>
              <strong>Technical Identifiers:</strong> Anonymous browser session identifiers stored
              locally to maintain cart items and dark mode preferences.
            </li>
            <li>
              <strong>Payment Information:</strong> Financial credentials are transmitted directly
              over 256-bit SSL encryption to PCI-compliant Shopify payment gateways. We never store
              raw card details.
            </li>
          </ul>
        </section>

        <section
          class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <strong class="text-base text-slate-900 dark:text-white block"
            >3. Data Sharing & Fulfillment</strong
          >
          <p>
            Your information is shared exclusively with necessary operational partners including
            logistics providers for physical order shipping, Shopify for cart management, and
            automated tracking update services.
          </p>
        </section>
      </div>
    </div>
  `,
})
export class PrivacyPolicyComponent {}

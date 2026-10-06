import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopifyPolicyService, ShopifyPolicy } from '../../core/services/shopify-policy.service';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <!-- Header -->
      <div>
        <span
          class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest"
        >
          Store Agreement
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
          {{ policy()?.title || 'Terms of Service' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Official store policy synced directly from DigiTex Shopify platform.
        </p>
      </div>

      <!-- Loading State (Skeleton UI) -->
      @if (isLoading()) {
        <div class="space-y-6 animate-pulse">
          <div class="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div class="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div class="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      }

      <!-- Dynamic Shopify Content -->
      @if (!isLoading() && policy()) {
        <div
          class="shopify-policy-content bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm leading-relaxed shadow-sm"
          [innerHTML]="policy()?.body"
        ></div>
      }

      <!-- Fallback / Error State -->
      @if (!isLoading() && !policy()) {
        <div
          class="bg-amber-50 dark:bg-amber-950/40 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm"
        >
          <p class="font-semibold">Unable to load store policy.</p>
          <p class="mt-1">
            Please ensure Terms of Service are published in Shopify Admin under Settings → Policies.
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      ::ng-deep .shopify-policy-content h2,
      ::ng-deep .shopify-policy-content h3 {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--tw-prose-headings, inherit);
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
      }
      ::ng-deep .shopify-policy-content p {
        margin-bottom: 1rem;
      }
      ::ng-deep .shopify-policy-content ul,
      ::ng-deep .shopify-policy-content ol {
        padding-left: 1.25rem;
        margin-bottom: 1rem;
        list-style-type: disc;
      }
      ::ng-deep .shopify-policy-content a {
        color: #059669;
        text-decoration: underline;
      }
    `,
  ],
})
export class TermsOfServiceComponent implements OnInit {
  private policyService = inject(ShopifyPolicyService);

  policy = signal<ShopifyPolicy | null>(null);
  isLoading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    const data = await this.policyService.getTermsOfService();
    this.policy.set(data);
    this.isLoading.set(false);
  }
}

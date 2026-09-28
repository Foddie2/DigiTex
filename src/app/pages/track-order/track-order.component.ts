import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div class="text-center space-y-2">
        <span class="text-xs font-black text-emerald-600 uppercase tracking-widest"
          >Logistics Hub</span
        >
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Track Order Dispatch
        </h1>
        <p class="text-xs text-slate-500">Enter your order reference and email address below.</p>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4"
      >
        <form (ngSubmit)="onTrackOrder()" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            [(ngModel)]="orderNumber"
            name="orderNumber"
            required
            placeholder="Order Number (e.g. #KA-1094)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm"
          />
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            required
            placeholder="Email Address"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm"
          />
          <button
            type="submit"
            [disabled]="isLoading()"
            class="sm:col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs cursor-pointer"
          >
            {{ isLoading() ? 'Searching Waybill Record...' : 'Track Package Status' }}
          </button>
        </form>
      </div>

      @if (orderResult()) {
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6"
        >
          <div
            class="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4"
          >
            <div>
              <h3 class="text-xl font-black text-slate-900 dark:text-white">
                Order {{ orderResult().orderNumber }}
              </h3>
              <p class="text-xs text-slate-500">
                Carrier: {{ orderResult().carrier }} — {{ orderResult().trackingNumber }}
              </p>
            </div>
            <span
              class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"
            >
              {{ orderResult().status }}
            </span>
          </div>

          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase text-slate-400">Tracking Progress</h4>
            @for (step of orderResult().timeline; track step.title) {
              <div class="flex items-start gap-3">
                <div
                  [class.bg-emerald-600]="step.completed"
                  class="w-4 h-4 rounded-full bg-slate-200 text-white text-[10px] flex items-center justify-center font-bold"
                >
                  ✓
                </div>
                <div>
                  <h5 class="text-xs font-bold text-slate-900 dark:text-white">{{ step.title }}</h5>
                  <p class="text-[11px] text-slate-500">{{ step.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class TrackOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);

  orderNumber = '';
  email = '';
  isLoading = signal<boolean>(false);
  orderResult = signal<any | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['order']) {
        this.orderNumber = params['order'];
        this.onTrackOrder();
      }
    });
  }

  onTrackOrder(): void {
    if (!this.orderNumber) return;
    this.isLoading.set(true);

    setTimeout(() => {
      this.orderResult.set({
        orderNumber: this.orderNumber.toUpperCase(),
        carrier: 'Wells Fargo / DHL Express',
        trackingNumber: 'WAYBILL-984021',
        status: 'In Transit',
        timeline: [
          {
            title: 'Order Processed & Paid',
            description: 'Verified via Shopify Checkout',
            completed: true,
          },
          {
            title: 'Dispatched from Hub',
            description: 'Package handed off to courier',
            completed: true,
          },
          {
            title: 'Out for Delivery',
            description: 'En route to local destination',
            completed: false,
          },
        ],
      });
      this.isLoading.set(false);
    }, 600);
  }
}

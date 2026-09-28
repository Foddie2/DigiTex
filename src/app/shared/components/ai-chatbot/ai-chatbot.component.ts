import { Component, inject, ElementRef, ViewChild, effect, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AiChatbotService, ChatMessage, ChatProduct } from '../../../core/services/ai-chatbot';
import { CartService } from '../../../core/services/cart';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50">
      @if (!aiService.isOpen()) {
        <button
          (click)="aiService.toggleChat()"
          class="relative bg-linear-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform-gpu hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
          aria-label="Open AI Shopping Assistant"
        >
          <span class="text-xl">✨</span>
          <span
            class="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-2"
          >
            Ask DigiTex AI
          </span>
          <!-- <span
            class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"
          ></span> -->
        </button>
      } @else {
        <div
          class="w-[90vw] sm:w-96 h-140 max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn"
        >
          <div
            class="p-4 bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-900/40"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/30 text-white flex items-center justify-center font-bold text-sm"
              >
                ✨
              </div>
              <div>
                <h3 class="text-xs font-black tracking-wide">Byte — Tech Concierge</h3>
                <p class="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online & Syncing
                  Storefront
                </p>
              </div>
            </div>
            <button
              (click)="aiService.toggleChat()"
              class="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div #scrollContainer class="flex-1 overflow-y-auto p-4 space-y-4 text-xs no-scrollbar">
            @for (msg of aiService.messages(); track msg.id) {
              <div [class.justify-end]="msg.sender === 'user'" class="flex items-start gap-2.5">
                @if (msg.sender === 'ai') {
                  <div
                    class="w-6 h-6 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                  >
                    ✨
                  </div>
                }

                <div
                  [class.bg-emerald-600]="msg.sender === 'user'"
                  [class.text-white]="msg.sender === 'user'"
                  [class.bg-slate-100]="msg.sender === 'ai'"
                  [class.dark:bg-slate-800]="msg.sender === 'ai'"
                  [class.text-slate-800]="msg.sender === 'ai'"
                  [class.dark:text-slate-200]="msg.sender === 'ai'"
                  class="max-w-[84%] rounded-2xl p-3.5 space-y-2.5 shadow-xs"
                >
                  <p class="leading-relaxed whitespace-pre-line">{{ msg.text }}</p>

                  @if (msg.products && msg.products.length > 0) {
                    <div
                      class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60"
                    >
                      @for (p of msg.products; track p.variantId) {
                        <div
                          class="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex gap-2.5 items-center"
                        >
                          <img
                            [src]="p.imageUrl"
                            [alt]="p.title"
                            class="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          />
                          <div class="flex-1 min-w-0">
                            <h4
                              class="font-bold text-slate-900 dark:text-white truncate text-[11px]"
                            >
                              {{ p.title }}
                            </h4>
                            <span
                              class="font-extrabold text-emerald-600 dark:text-emerald-400 text-[10px] block"
                            >
                              {{ p.price }}
                            </span>
                          </div>
                          <button
                            (click)="addQuickProduct(p.variantId)"
                            class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer active:scale-95 transition"
                          >
                            + Cart
                          </button>
                        </div>
                      }
                    </div>
                  }

                  @if (msg.leadCapture) {
                    <div
                      class="bg-linear-to-r from-emerald-900/40 to-indigo-900/40 p-2.5 rounded-xl border border-emerald-500/30 space-y-2 mt-2"
                    >
                      <p class="text-[10px] font-bold text-emerald-300">
                        Unlock 10% Off + M-Pesa Express Voucher:
                      </p>
                      <div class="flex gap-1.5">
                        <input
                          type="email"
                          [(ngModel)]="leadEmail"
                          placeholder="Your email address"
                          class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2.5 py-1.5 rounded-lg text-[10px] w-full outline-none border border-slate-300 dark:border-slate-700"
                        />
                        <button
                          (click)="submitLead()"
                          class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  }

                  <span class="text-[9px] text-slate-400 block text-right font-mono">{{
                    msg.timestamp
                  }}</span>
                </div>
              </div>
            }

            @if (aiService.isThinking()) {
              <div
                class="flex items-center gap-2 text-slate-400 text-[11px] font-bold animate-pulse"
              >
                <span class="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
                Byte is thinking...
              </div>
            }
          </div>

          <div
            class="px-3 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar"
          >
            <button
              (click)="sendQuickPrompt('How do I track my order?')"
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 hover:border-emerald-500 cursor-pointer"
            >
              📦 Track Order
            </button>
            <button
              (click)="sendQuickPrompt('Recommend 100W GaN chargers')"
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 hover:border-emerald-500 cursor-pointer"
            >
              ⚡ GaN Chargers
            </button>
            <button
              (click)="sendQuickPrompt('How does M-Pesa express checkout work?')"
              class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0 hover:border-emerald-500 cursor-pointer"
            >
              📱 M-Pesa Help
            </button>
          </div>

          <form
            (submit)="sendMessage($event)"
            class="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              [(ngModel)]="inputText"
              name="chatInput"
              placeholder="Ask about hardware, delivery, or checkout..."
              class="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3.5 py-2 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              [disabled]="!inputText.trim() || aiService.isThinking()"
              class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold p-2.5 rounded-xl text-xs cursor-pointer shadow-md transition"
            >
              ➔
            </button>
          </form>
        </div>
      }
    </div>
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
    `,
  ],
})
export class AiChatbotComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  public aiService = inject(AiChatbotService);
  public cartService = inject(CartService);
  public authService = inject(AuthService);

  inputText = '';
  leadEmail = '';

  constructor() {
    effect(() => {
      const messagesCount = this.aiService.messages().length;
      const isOpen = this.aiService.isOpen();

      if (isPlatformBrowser(this.platformId) && isOpen && messagesCount > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  sendQuickPrompt(promptText: string): void {
    this.inputText = promptText;
    this.sendMessage();
  }

  async sendMessage(event?: Event): Promise<void> {
    if (event) event.preventDefault();

    const prompt = this.inputText.trim();
    if (!prompt || this.aiService.isThinking()) return;

    this.inputText = '';

    const userContext = {
      userName: this.authService.currentUser()?.name || 'Customer',
      userEmail: this.authService.currentUser()?.email || '',
      isLoggedIn: this.authService.isLoggedIn(),
      cartCount: this.cartService.itemCount(),
    };

    await this.aiService.sendMessage(prompt, userContext);
  }

  async addQuickProduct(variantId: string): Promise<void> {
    await this.cartService.addToCart(variantId, 1);
    this.cartService.openDrawer();
  }

  submitLead(): void {
    if (!this.leadEmail.trim()) return;

    this.aiService.messages.update((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: `🎉 Voucher code "DIGITEX10" activated for ${this.leadEmail}! Enter it at checkout for 10% off.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    this.leadEmail = '';
  }

  private scrollToBottom(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}

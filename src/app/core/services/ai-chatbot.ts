import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from './analytics';

export interface ChatProduct {
  variantId: string;
  title: string;
  price: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  products?: ChatProduct[];
  leadCapture?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AiChatbotService {
  private platformId = inject(PLATFORM_ID);
  private analytics = inject(AnalyticsService);

  isOpen = signal<boolean>(false);
  isThinking = signal<boolean>(false);
  hasBeenNudged = signal<boolean>(false);

  messages = signal<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hey there! Byte here 👋 Need help picking a problem-solving gadget or tracking an order?',
      timestamp: this.getFormattedTime(),
    },
  ]);

  toggleChat(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.analytics.trackChatInteraction('opened');
    }
  }

  triggerProactiveNudge(messageText: string): void {
    if (this.hasBeenNudged()) return;
    this.hasBeenNudged.set(true);

    this.messages.update((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: messageText,
        timestamp: this.getFormattedTime(),
        leadCapture: true,
      },
    ]);
    this.isOpen.set(true);
  }

  async sendMessage(
    userText: string,
    userContext: {
      userName?: string;
      userEmail?: string;
      currency?: 'USD' | 'EUR' | 'KES' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF' | 'CNY' | 'INR';
      country?: string;
      city?: string;
      isLoggedIn?: boolean;
      cartCount?: number;
    } = {},
  ): Promise<void> {
    const trimmedText = userText.trim();
    if (!trimmedText || this.isThinking()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedText,
      timestamp: this.getFormattedTime(),
    };
    this.analytics.trackChatInteraction('message_sent', trimmedText.slice(0, 30));

    this.messages.update((prev) => [...prev, userMsg]);
    this.isThinking.set(true);

    let fullResponseText = '';
    let responseProducts: ChatProduct[] = [];

    try {
      if (isPlatformBrowser(this.platformId)) {
        const cleanHistory = this.messages()
          .filter((m) => m.id !== '1' && m.id !== userMsg.id && m.text.trim().length > 0)
          .map((m) => ({ sender: m.sender, text: m.text }));

        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: trimmedText,
            history: cleanHistory.slice(-6),
            userContext,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          fullResponseText = data.text || '';
          responseProducts = data.products || [];
        } else {
          console.error('Serverless Function Notice:', data);
          fullResponseText =
            data.text ||
            'My connection stuttered for a moment! What gear or questions were you looking into?';
        }
      }
    } catch (err) {
      console.error('Network Fetch Error:', err);
      fullResponseText =
        'My connection stuttered for a moment! What gear or questions were you looking into?';
    } finally {
      this.isThinking.set(false);
    }

    if (fullResponseText) {
      await this.streamToSignal(fullResponseText, responseProducts);
    }
  }

  private async streamToSignal(fullText: string, products?: ChatProduct[]): Promise<void> {
    const msgId = (Date.now() + 1).toString();
    const timestamp = this.getFormattedTime();

    this.messages.update((prev) => [...prev, { id: msgId, sender: 'ai', text: '', timestamp }]);

    if (!isPlatformBrowser(this.platformId)) {
      this.messages.update((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, text: fullText, products } : m)),
      );
      return;
    }

    let charIndex = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        charIndex += Math.floor(Math.random() * 12) + 18;
        const textChunk = fullText.slice(0, charIndex);

        this.messages.update((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, text: textChunk } : m)),
        );

        if (charIndex >= fullText.length) {
          clearInterval(interval);
          this.messages.update((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, text: fullText, products } : m)),
          );
          resolve();
        }
      }, 14);
    });
  }
  //
  openWithPrompt(promptText: string): void {
    this.isOpen.set(true);
    this.sendMessage(promptText);
  }

  private getFormattedTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

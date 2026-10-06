import { Injectable } from '@angular/core';

export interface ShopifyPolicy {
  title: string;
  body: string;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShopifyPolicyService {
  private readonly shopifyDomain = 'techbytesstore.myshopify.com';
  // Use your Storefront API Access Token from Shopify Admin
  private readonly storefrontAccessToken = 'ca62d02cc6eae47b692ef2bb7fab020e';
  private readonly apiVersion = '2026-01';

  async getTermsOfService(): Promise<ShopifyPolicy | null> {
    return this.fetchPolicy('termsOfService');
  }

  async getPrivacyPolicy(): Promise<ShopifyPolicy | null> {
    return this.fetchPolicy('privacyPolicy');
  }

  private async fetchPolicy(
    policyKey: 'termsOfService' | 'privacyPolicy',
  ): Promise<ShopifyPolicy | null> {
    const query = `
      query Get${policyKey.charAt(0).toUpperCase() + policyKey.slice(1)} {
        shop {
          ${policyKey} {
            title
            body
            url
          }
        }
      }
    `;

    try {
      const response = await fetch(
        `https://${this.shopifyDomain}/api/${this.apiVersion}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
          },
          body: JSON.stringify({ query }),
        },
      );

      const json = await response.json();
      if (json.errors) {
        console.error(`❌ Shopify GraphQL Errors (${policyKey}):`, json.errors);
      }

      return json?.data?.shop?.[policyKey] || null;
    } catch (error) {
      console.error(`❌ Fetch Error (${policyKey}):`, error);
      return null;
    }
  }
}

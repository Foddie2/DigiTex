import { Injectable } from '@angular/core';

export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  currencyCode: string;
  availableForSale: boolean;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  availableForSale: boolean;
  images: { url: string; altText: string }[];
  variants: ShopifyVariant[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ShopifyProductService {
  private readonly shopifyDomain = 'techbytesstore.myshopify.com';
  private readonly storefrontAccessToken = 'YOUR_SHOPIFY_STOREFRONT_TOKEN';
  private readonly apiVersion = '2026-01';

  async getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          descriptionHtml
          availableForSale
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 5) {
            edges { node { url altText } }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price { amount currencyCode }
              }
            }
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
          body: JSON.stringify({ query, variables: { handle } }),
        },
      );

      const json = await response.json();
      const productNode = json?.data?.product;

      if (!productNode) return null;

      // Flatten Shopify's GraphQL edge/node structure for easier use in Angular
      return {
        id: productNode.id,
        handle: productNode.handle,
        title: productNode.title,
        descriptionHtml: productNode.descriptionHtml,
        availableForSale: productNode.availableForSale,
        priceRange: productNode.priceRange,
        images: productNode.images.edges.map((e: any) => e.node),
        variants: productNode.variants.edges.map((e: any) => ({
          id: e.node.id,
          title: e.node.title,
          availableForSale: e.node.availableForSale,
          price: e.node.price.amount,
          currencyCode: e.node.price.currencyCode,
        })),
      };
    } catch (error) {
      console.error('Error fetching Shopify product:', error);
      return null;
    }
  }
}

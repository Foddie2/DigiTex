import { Injectable, inject } from '@angular/core';

export interface TrackingInfo {
  number: string;
  url: string;
  company: string;
}

export interface LineItem {
  id: string;
  title: string;
  quantity: number;
  variantId: string;
  price: { amount: string; currencyCode: string };
  image?: { url: string; altText: string };
}

export interface ShopifyOrder {
  id: string;
  name: string; // e.g. #1001
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  statusUrl: string;
  totalPrice: { amount: string; currencyCode: string };
  trackingInfo: TrackingInfo[];
  lineItems: LineItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ShopifyOrderService {
  private readonly shopifyDomain = 'techbytesstore.myshopify.com';
  private readonly storefrontAccessToken = 'YOUR_SHOPIFY_STOREFRONT_TOKEN';
  private readonly apiVersion = '2026-01';

  /**
   * Fetches real customer orders from Shopify using customerAccessToken
   */
  async getCustomerOrders(customerAccessToken: string): Promise<ShopifyOrder[]> {
    const query = `
      query GetCustomerOrders($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
                id
                name
                orderNumber
                processedAt
                financialStatus
                fulfillmentStatus
                statusUrl
                totalPrice {
                  amount
                  currencyCode
                }
                successfulFulfillments(first: 5) {
                  trackingInfo {
                    number
                    url
                    company
                  }
                }
                lineItems(first: 20) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        id
                        price {
                          amount
                          currencyCode
                        }
                        image {
                          url
                          altText
                        }
                      }
                    }
                  }
                }
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
          body: JSON.stringify({ query, variables: { customerAccessToken } }),
        },
      );

      const json = await response.json();
      const orderNodes = json?.data?.customer?.orders?.edges || [];

      return orderNodes.map((edge: any) => {
        const node = edge.node;

        // Extract carrier tracking links
        const trackingInfo: TrackingInfo[] = (node.successfulFulfillments || []).flatMap(
          (f: any) => f.trackingInfo || [],
        );

        // Extract line items
        const lineItems: LineItem[] = (node.lineItems?.edges || []).map((itemEdge: any) => ({
          id: itemEdge.node.variant?.id || '',
          title: itemEdge.node.title,
          quantity: itemEdge.node.quantity,
          variantId: itemEdge.node.variant?.id || '',
          price: itemEdge.node.variant?.price || { amount: '0', currencyCode: 'USD' },
          image: itemEdge.node.variant?.image,
        }));

        return {
          id: node.id,
          name: node.name,
          orderNumber: node.orderNumber,
          processedAt: node.processedAt,
          financialStatus: node.financialStatus,
          fulfillmentStatus: node.fulfillmentStatus,
          statusUrl: node.statusUrl,
          totalPrice: node.totalPrice,
          trackingInfo,
          lineItems,
        };
      });
    } catch (error) {
      console.error('Error fetching customer orders from Shopify:', error);
      return [];
    }
  }
}

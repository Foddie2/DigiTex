import { TestBed } from '@angular/core/testing';

import { ShopifyProduct } from './shopify-product';

describe('ShopifyProduct', () => {
  let service: ShopifyProduct;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopifyProduct);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

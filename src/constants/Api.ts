export const Endpoints = {
  products: '/products',
  productByBarcode: (barcode: string) => `/products/${barcode}`,
  purchases: '/purchases',
  suppliers: '/suppliers',
} as const;

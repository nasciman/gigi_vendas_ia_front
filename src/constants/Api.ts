export const API_HOST = 'http://192.168.1.100:8080';

export const Endpoints = {
  products: '/products',
  productByBarcode: (barcode: string) => `/products/${barcode}`,
  purchases: '/purchases',
  suppliers: '/suppliers',
} as const;

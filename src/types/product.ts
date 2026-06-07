export interface ProductDetail {
  barcode: string;
  name: string;
  photoPath: string | null;
  salePrice: number;
  lastPurchasePrice: number | null;
  lastSupplierName?: string | null;
}

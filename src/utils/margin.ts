export function calculateSalePrice(cost: number, marginPercent: number): number {
  if (cost <= 0) return 0;
  return cost * (1 + marginPercent / 100);
}

export function calculateMargin(cost: number, salePrice: number): number {
  if (cost <= 0) return 0;
  return ((salePrice - cost) / cost) * 100;
}

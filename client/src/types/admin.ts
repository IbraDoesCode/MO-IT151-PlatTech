export interface AdminKPI {
  totalAssetValue: number;
  totalUniqueProducts: number;
  totalStock: number;
  stockBreakdown: {
    inStock: number;
    lowStock: number;
    noStock: number;
  };
  statusBreakdown: {
    active: number;
    inactive: number;
    discontinued: number;
  };
}

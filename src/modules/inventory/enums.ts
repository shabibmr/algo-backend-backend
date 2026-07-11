export const SkuType = {
  VARIANT: 1,
  BUNDLE: 2,
  ALT: 3,
} as const;

export type SkuType = (typeof SkuType)[keyof typeof SkuType];

export const PriceListEntryType = {
  CUSTOM: 0,
  STD: 1,
  MRP: 2,
} as const;

export type PriceListEntryType = (typeof PriceListEntryType)[keyof typeof PriceListEntryType];

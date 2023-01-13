export const UNION_RAW_DATA_DEX_AG_ONLY = `with 
      raw_data as (
        SELECT *, 'ocean' as name
        FROM ocean
        UNION ALL 
        SELECT *, 'oneinch' as name
        FROM oneinch
        UNION ALL
        SELECT *, 'zeroex' as name
        FROM zeroex
        UNION ALL
        SELECT *, 'paraswap' as name
        FROM paraswap
        ),`;
export const UNION_RAW_DATA = `with 
      raw_data as (
        SELECT *, 'ocean' as name
        FROM ocean
        UNION ALL 
        SELECT *, 'oneinch' as name
        FROM oneinch
        UNION ALL
        SELECT *, 'zeroex' as name
        FROM zeroex
        UNION ALL
        SELECT *, 'paraswap' as name
        FROM paraswap
        UNION ALL
        SELECT *, 'cowswap' as name
        FROM cowswap
        ),`;
export const COLORS = [
  "#345C7D",
  "#F7B094",
  "#F5717F",
  "#F7B094",
  "#6C5B7A",
];

import { UNION_RAW_DATA_DEX_AG_ONLY } from "./shared.js";
export function display_histogram_price_differences(db) {
  const rows = db.query(
    UNION_RAW_DATA_DEX_AG_ONLY +
      `
      raw_data_filtered as (
      select * from raw_data where executed_buy_amount != 0
      ),
      winners_difference as (
       select uid, max(executed_buy_amount), min(executed_buy_amount),  (max(executed_buy_amount) - min(executed_buy_amount)) * 1.0/ max(executed_buy_amount) as price_improvement_over_second_best 
       from (
       select uid, 
       executed_buy_amount, name,
       rank() over( partition by uid order by executed_buy_amount DESC ) as rank
       from raw_data_filtered ORDER BY uid ) where rank < 3 group by uid
      )
      select * from (
      select 
      '[0,0.0001]' as category, count(*) from winners_difference where price_improvement_over_second_best < 0.0001
      UNION
      select '[0.0001,0.001]' as category, count(*) from winners_difference where price_improvement_over_second_best > 0.0001 and price_improvement_over_second_best < 0.001
      UNION
      select '[0.001,0.01]' as category, count(*) from winners_difference where price_improvement_over_second_best > 0.001 and price_improvement_over_second_best < 0.01
      UNION
      select '[0.01,1]' as category, count(*) from winners_difference where price_improvement_over_second_best > 0.01 
      )`,
    [],
  );
  console.log(
    "Histogram of price differences between best and second best solution (without gas consideration, for dex-ags only): aggregated by the trading outcomes",
  );
  console.log(rows);
  const x_val = [];
  const labels = [];
  for (let i = 0; i < rows.length; i++) {
    x_val.push(rows[i][1]);
    labels.push(rows[i][0]);
  }
  console.log(x_val);
  console.log(labels);
}

import { UNION_RAW_DATA } from "./shared.js";
export function display_histogram_winners(db) {
  const rows = db.query(
    UNION_RAW_DATA +
      `
      raw_data_filtered as (
      select * from raw_data where executed_buy_amount != 0 or name='cowswap'
      ),
      result_count as (
      select uid, count(*) as number_of_results from raw_data_filtered group by uid
      ),
      ranked_by_ouput as(
      select rf.uid, output_value_usd, name, gas_cost_usd,
       rank() over( partition by rf.uid order by output_value_usd DESC ) as rank
       from raw_data_filtered rf left join result_count rc on rc.uid = rf.uid where rc.number_of_results > 2
      ),
      winner_count as (
       select name, count(*) from ranked_by_ouput where name='cowswap' and rank=1 
       UNION
       select name, count(*) from ranked_by_ouput where name='oneinch' and rank=1
       UNION
       select name, count(*) from ranked_by_ouput where name='zeroex' and rank=1
       UNION
       select name, count(*) from ranked_by_ouput where name='ocean' and rank=1
       UNION
      select name, count(*) from ranked_by_ouput where name='paraswap' and rank=1
       )
      select * from winner_count 
      `,
    [],
  );
  console.log(
    "Histogram of competition win per exchange (on bang for buck, considering gas costs):",
  );
  const x_val = [];
  const labels = [];
  for (let i = 0; i < rows.length; i++) {
    x_val.push(rows[i][1]);
    labels.push(rows[i][0]);
  }
  console.log(x_val);
  console.log(labels);
}

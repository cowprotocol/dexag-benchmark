import { UNION_RAW_DATA_LOW_GAS, UNION_RAW_DATA_HIGH_GAS } from "./shared.js";
export function display_histogram_winners_diff_to_cowswap(db) {
  const query = `
      raw_data_filtered as (
      select * from raw_data where executed_buy_amount != 0 or name='cowswap'
      ),
      ranked_by_ouput as(
      select uid, output_value_usd, name,

       rank() over( partition by uid order by output_value_usd DESC ) as rank
       from raw_data_filtered
      ),
      winner as (
      select * from ranked_by_ouput where rank=1
      ),
      difference_to_cowswap as(
      select ro.uid, w.output_value_usd - ro.output_value_usd as diff from ranked_by_ouput ro left join winner w on ro.uid = w.uid 
      where ro.name='cowswap'
      ),
      winner_count as (
       select '[0,0]' as category, count(*) from difference_to_cowswap where diff=0
       UNION
       select '[0,0.001]' as category, count(*) from difference_to_cowswap where diff < 0.001 and diff >0
       UNION
       select '[0.001,0.01]' as category, count(*) from difference_to_cowswap where diff > 0.001 and diff < 0.01
       UNION
       select '[0.01,0.1]' as category, count(*) from difference_to_cowswap where diff > 0.01 and diff < 0.1
       UNION
       select '[0.1,1]' as category, count(*) from difference_to_cowswap where diff > 0.1 and diff < 1
       UNION
       select '[1,2]' as category, count(*) from difference_to_cowswap where diff >1 and diff < 2
       UNION
       select '[2,4]' as category, count(*) from difference_to_cowswap where diff >2 and diff < 4
       UNION
       select '[4,10]' as category, count(*) from difference_to_cowswap where diff >4 and diff < 10
       UNION
       select '[10,10000]' as category, count(*) from difference_to_cowswap where diff >10 
       )
      select * from winner_count
`;
  let rows = db.query(
    UNION_RAW_DATA_LOW_GAS+ query,
    [],
  );
  console.log(
    "Histogram of output difference between cowswap and best solution in [usd] (on bang for the buck considering gas costs, in low gas cost env):",
  );
  console.log(rows);
  let x_val = [];
  let labels = [];
  for (let i = 0; i < rows.length; i++) {
    x_val.push(rows[i][1]);
    labels.push(rows[i][0]);
  }
  console.log(x_val);
  console.log(labels);
  rows = db.query(
    UNION_RAW_DATA_HIGH_GAS + query,
    [],
  );
  console.log(
    "Histogram of output difference between cowswap and best solution in [usd] (on bang for the buck considering gas costs, in high gas cost env):",
  );
  console.log(rows);
  x_val = [];
  labels = [];
  for (let i = 0; i < rows.length; i++) {
    x_val.push(rows[i][1]);
    labels.push(rows[i][0]);
  }
  console.log(x_val);
  console.log(labels);
}

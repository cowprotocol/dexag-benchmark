import { UNION_RAW_DATA_DEX_AG_ONLY } from "./shared.js";
export function display_histogram_shared_solutions(db) {
  const rows = db.query(
    UNION_RAW_DATA_DEX_AG_ONLY +
      `
      raw_data_filtered as (
      select * from raw_data where executed_buy_amount != 0
      ),
      winner_table as (
       select uid, max(executed_buy_amount) as winning_buy_amount from raw_data_filtered group by uid
      ),
      raw_data_filtered_with_winning_bid as (
        select rd.uid, * from raw_data_filtered rd left join winner_table on rd.uid = winner_table.uid where rd.executed_buy_amount = winning_buy_amount order by 1
      ),
      winning_party_count as (
      select uid, count(*) as num_winners from raw_data_filtered_with_winning_bid group by 1
      ),
      solution_count as (
      select uid, count(*) overall_count from raw_data_filtered group by uid
      ),
      results as (
      select sc.uid, num_winners from solution_count sc left outer join winning_party_count on sc.uid = winning_party_count.uid  where overall_count > 2
      )
      select num_winners, count(*) from results group by num_winners
      `,
    [],
  );
  console.log(
    "Histogram of shared best solution between dex-ags(wihout gas cost considerations): The following histogram shows how frequently the best solution was provided by 1 dex-ag, 2 dex-ags,...",
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

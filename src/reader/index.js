import { DB } from "https://deno.land/x/sqlite@v3.4.1/mod.ts";
import { delay } from "https://deno.land/std@0.153.0/async/delay.ts";
import { display_histogram_shared_solutions } from "./best_solution_shared.js";
import { UNION_RAW_DATA } from "./shared.js";
import { display_histogram_price_differences } from "./histogram_price_differences.js";
import { display_histogram_winners } from "./histogram_bang_for_buck.js";
import { display_histogram_winners_diff_to_cowswap } from "./histogram_diff_to_cowswap.js";
import { display_histogram_winners_diff_to_cowswap_fee } from "./histogram_diff_to_cowswap_fee.js";
const POLL_INTERVAL = 5000; // ms

const db = new DB("orders.db");

function display_raw_data_results() {
  const rows = db.query(
    UNION_RAW_DATA +
      `
      raw_data_filtered as (
      select uid, group_concat(executed_buy_amount), group_concat(output_value_usd), group_concat(name) from (select uid, executed_buy_amount, output_value_usd, name from raw_data where (executed_buy_amount!=0 or name='cowswap') ORDER BY uid, output_value_usd DESC ) group by uid
      )
      select * from raw_data_filtered
      `,
    [],
  );
  console.debug("executed_buy_amount per uid per exchange");
  for (const row of rows) {
    console.log("row", row);
    console.log("the following uid", row[0]);
    console.log("had the following execution amounts", row[1]);
    console.log("in dollar terms this is", row[2]);
    console.log("by these exchanges", row[3]);
  }
}

while (true) {
  display_raw_data_results(db);
  display_histogram_winners(db);
  display_histogram_shared_solutions(db);
  display_histogram_price_differences(db);
  display_histogram_winners_diff_to_cowswap(db);
  display_histogram_winners_diff_to_cowswap_fee(db);
  await delay(POLL_INTERVAL);
}

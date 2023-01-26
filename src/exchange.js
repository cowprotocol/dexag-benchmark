import * as log from "https://deno.land/std@0.153.0/log/mod.ts";
import { ethers } from "https://cdn.ethers.io/lib/ethers-5.6.esm.min.js";
import Trader from "../contracts/Trader.json" assert { type: "json" };

export class Exchange {
  constructor(name, db, provider, swap, options = {}) {
    this.name = name;
    this.provider = provider;
    this.swap = swap;
    this.db = db;
    this.trader = new ethers.utils.Interface(Trader.abi);
    this.options = {
      sync: true,
      freshStart: true,
      ...options,
    };
    if (this.options.freshStart) {
      db.query(`drop table if exists ${this.name}`);
    }
    this.db.query(`
      CREATE TABLE IF NOT EXISTS ${this.name} (
        uid TEXT PRIMARY KEY,
        sell_amount TEXT,
        buy_amount TEXT,
        executed_sell_amount TEXT,
        executed_buy_amount TEXT,
        exchange TEXT,
        data TEXT,
        output_value_usd TEXT,
        gas_cost_usd TEXT
      )
    `);
  }

  async trySwap(order, gasPrice, ethPrice, sellTokenPrice) {
    try {
      return await this.swap(order, gasPrice, ethPrice, sellTokenPrice);
    } catch (err) {
      log.warning(`${this.name} failed to get swap: ${err}`);
      return null;
    }
  }

  async simulateTrade(order, swap, block_number, gasPrice, ethPrice) {
    if (!swap) {
      return {
        uid: order.uid,
        sellAmount: ethers.constants.Zero,
        buyAmount: ethers.constants.Zero,
        outputValueputValuexecutedSellAmount: ethers.constants.Zero,
        executedBuyAmount: ethers.constants.Zero,
        exchange: ethers.constants.AddressZero,
        data: "0x",
      };
    }
    if (this.name == "cowswap") {
      // coswap trade intentions can not be simulated
      return {
        uid: order.uid,
        sellAmount: swap.sellAmount,
        buyAmount: swap.buyAmount,
        executedSellAmount: ethers.constants.Zero,
        executedBuyAmount: ethers.constants.Zero,
        exchange: ethers.constants.AddressZero,
        data: "0x",
        gasCost: swap.feeUsd,
      };
    }

    const data = this.trader.encodeFunctionData("trade", [
      order.sellToken,
      order.buyToken,
      swap.spender,
      swap.exchange,
      swap.data,
    ]);
    const eth_call_promise = this.provider
      .send("eth_call", [
        {
          from: order.owner,
          to: order.owner,
          data: data,
        },
        block_number,
        {
          [order.owner]: {
            code: `0x${Trader["bin-runtime"]}`,
          },
        },
      ])
      .catch((err) => {
        if (`${err.body}`.indexOf("execution reverted") >= 0) {
          log.warning(`${this.name} trade reverted`);
          return this.trader.encodeFunctionResult("trade", [0, 0, 0]);
        } else {
          throw err;
        }
      });

    const eth_call_result = await eth_call_promise;

    const [executedSellAmount, executedBuyAmount, gasUsed] = this.trader
      .decodeFunctionResult("trade", eth_call_result);
    const txInitiationGasAmount = ethers.BigNumber.from("21000");
    const gasCostJumpIntoExchangeContract = ethers.BigNumber.from("2100");
    console.log(gasUsed.toString())

    const realGasUsed = gasUsed.add(txInitiationGasAmount.sub(
      gasCostJumpIntoExchangeContract));

    console.log(realGasUsed.toString())
    console.log( swap.exchange, "simulation gas costs", (realGasUsed * gasPrice) / ethPrice );
    console.log(swap.exchange, "provided gas costs", swap.feeUsd );
    return {
      uid: order.uid,
      sellAmount: swap.sellAmount,
      buyAmount: swap.buyAmount,
      executedSellAmount,
      executedBuyAmount,
      exchange: swap.exchange,
      data: swap.data,
      gasCost: (realGasUsed * gasPrice) / ethPrice,
    };
  }

  storeTrade(trade, outPutValueInDollar, feeUsd) {
    this.db.query(
      `
        INSERT OR IGNORE INTO ${this.name}
          (uid, sell_amount, buy_amount, executed_sell_amount, executed_buy_amount, exchange, data, gas_cost_usd, output_value_usd)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        trade.uid,
        trade.sellAmount.toString(),
        trade.buyAmount.toString(),
        trade.executedSellAmount.toString(),
        trade.executedBuyAmount.toString(),
        trade.exchange,
        trade.data,
        feeUsd,
        outPutValueInDollar,
      ],
    );
  }

  async processOrder(
    order,
    gasPrice,
    block_number,
    etherPrice,
    buyTokenPrice,
    sellTokenPrice,
  ) {
    const swap = await this.trySwap(
      order,
      gasPrice,
      etherPrice,
      sellTokenPrice,
    );
    if (swap != null) {
      const feeUsd = swap.feeUsd;
      const trade = await this.simulateTrade(
        order,
        swap,
        block_number,
        gasPrice,
        etherPrice,
      );
      let outPutValue = 0;
      if (this.name == "cowswap") {
        outPutValue = trade.buyAmount / buyTokenPrice;
      } else {
        outPutValue = trade.executedBuyAmount / buyTokenPrice - feeUsd;
      }
      this.storeTrade(trade, outPutValue, feeUsd);

      log.debug(`${this.name} processed ${order.uid}`);
    }
  }
}
, DEXag Trader

This repo contains a daemon that monitors the CoW Protocol orderbook and, for
each new order, simulates trading the order amounts on various DEX aggregators.
The simulation records both the expected traded amounts as well as the actual
executed amounts.

## Simulation Details

Simulation is done with an `eth_call` with state overrides. This allows
simulations to work even for traders that haven't approved the required
contracts.

## How to run it:

1. Install deno

2. Copy .env.example to .env and fill out the variables. If you wanna connect to
   the database on cowswaps AWS account, use the credentials from
   [1password](https://start.1password.com/open/i?a=6DWD777JFFEZZLYS6J4DUURYLE&v=weisopuq6vd4jkgfi443z2fe64&i=r7tfzgrrsv37l4b2etdco7ku2u&h=cowserviceslda.1password.com).

```
cd data-collector
export $(grep -v '^#' ../.env | xargs)
```

2. Run:

```
make run
```

3. for linting and formating, you can run:

```
deno lint
deno fmt
```

## How to run it in docker:

```
docker build --tag benchmark-tool -f ./Dockerfile .
docker run -ti --env-file ../.env benchmark-tool
```

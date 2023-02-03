
Note this sub-repo is only a temporary repo. It might have to be managed in another repo of all the dashly deployments for cowswap

In order to serve the data, run:
1. create your own .env file by copying .env.example. If you wanna access the data stored in our pod, use the env variables from  [1password](https://start.1password.com/open/i?a=6DWD777JFFEZZLYS6J4DUURYLE&v=weisopuq6vd4jkgfi443z2fe64&i=r7tfzgrrsv37l4b2etdco7ku2u&h=cowserviceslda.1password.com). 

2. run the following commands
```
source ../.env
docker build -f Dockerfile.dev -t docker-dashboard .
docker run --env-file ../.env -p 8050:8050 -v "$(pwd)"/app:/app --rm docker-dashboard
```
and then visit your local browser:
`http://localhost:8050`

and for the production setup:
```
source ../.env
docker build -f Dockerfile -t docker-dashboard-prod .
docker run --env-file ../.env -p 8050:8050 --rm docker-dashboard-prod
```


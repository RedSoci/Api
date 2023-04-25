# RedSoci API
offer acess to server to server communication and user to server communication.

# Development usage
To build all containers use:
``` bash
sudo docker compose --profile dev --profile test create
```
Case you want to make test in your local machine, start docker compose with no profile e put in **.env**:
``` env
DB_HOST="localhost"
```
by default host is **db** in docker

to active developer mode use:
``` bash
sudo docker compose --profile dev up
```
to start watching using nodemon.
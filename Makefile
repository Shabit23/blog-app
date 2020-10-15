#Production 
start:
	docker container start db blog-app
build:
	./boot.sh
stop:
	docker container stop blog-app db
destroy: stop
	docker network rm blog-app-network
	docker container rm blog-app db
	docker image rm blog-app

#Development
dev-start:
	docker-compose up --detach
dev-build:
	docker-compose up --detach --build;
dev-shell:
	docker-compose exec app bash
dev-stop:
	docker-compose stop
dev-destroy:
	docker-compose down --volume
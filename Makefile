start:
	DEBUG="application:*" npx nodemon --watch .  --ext '.js' --exec NODE_ENV=development npx gulp server

test:
	npm test

lint:
	npx eslint .

.PHONY: test

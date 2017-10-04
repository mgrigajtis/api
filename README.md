Express & ES6 REST API Boilerplate with basic authentication using JWT and PostgreSQL
==================================

This is a straightforward boilerplate for building REST APIs with ES6 and Express using JWT and PostgreSQL.
This is based off of @developit's Express & ES6 API Boilerplate

- ES6 support via [babel](https://babeljs.io)
- REST resources as middleware via [resource-router-middleware](https://github.com/developit/resource-router-middleware)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)

Getting Started
---------------

```sh
# clone it
git clone git@github.com:mgrigajtis/api.git
cd api

# Make it your own
rm -rf .git && git init && npm init

# Install dependencies
npm install

# Start development live-reload server
PORT=8080 npm run dev

# Test it
[localhost](http://localhost:8080/api)

# Start production server:
PORT=8080 npm start
```
Docker Support
------
```sh
cd api

# Build your docker
docker build -t es6/api-service .
#            ^      ^           ^
#          tag  tag name      Dockerfile location

# run your docker
docker run -p 8080:8080 es6/api-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```

Docker Demo
-------------------------
It's supposed to be pretty easy to take your Docker to your favourite cloud service, 
here's a demo of what's our Dockerized bolierplate is like: 
[https://docker-deployment-yudfxfiaja.now.sh/api](https://docker-deployment-yudfxfiaja.now.sh/api)

License
-------

MIT

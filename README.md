# node-mongo-signup-verification-api

## Introduction
Using  Node.js, Express & MongoDB  created a Back-End Application for accounts auth functions - that responsible for log in and sign up and reseting password and using the jwt token authentication with refresh token for doing the basic accounts functions like updating accounts and deleting 
 the first user is registerd in the database  set to the admin role and the others will be only users and after that the admin can change the roles of the users.
 a documentaion added to the route localhost:5000/api/auth/docs using swagger
the main server side work on local url localhost:5000/api/auth


## Built using
#### Back-end
- [Node.js](https://nodejs.org/en/) - Runtime environment for JS
- [Express.js](https://expressjs.com/) - Node.js framework, makes process of building APIs easier & faster
- [MongoDB](https://www.mongodb.com/) - Database to store document-based data
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling for Node.js
- [JSON Web Token](https://jwt.io/) - A standard to secure/authenticate HTTP requests
- [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) - For hashing passwords
- [crypto](https://www.npmjs.com/package/crypto-js)- to generate refresh tokens
- [Dotenv](https://www.npmjs.com/package/dotenv) - To load environment variables from a .env file
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) - to fetch a refresh token from cookies
- [joi](https://www.npmjs.com/package/joi/v/6.6.0) - for basic request validations
- [nodemailer](https://www.npmjs.com/package/nodemailer) - for sending verifacation emails using SMTP
- [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express) -a living documentation for your API hosted from your API server via a route
- [yamljs](https://www.npmjs.com/package/yamljs)-Standalone JavaScript YAML 1.2 Parser & Encoder. Works under node.js and all major browsers. Also brings command line YAML/JSON conversion tools.

## Features
- Authentication (login/register with email-password)
- refresh token 
- revoke token
- update account
- forget password
- reset password
- delete accounts
- get all users only for admins
- a living documetaions for api 
## Usage
Setup:
- replace the config-example.env with your config.env file
- run ```npm i && npm run server```  to start the app

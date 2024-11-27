const express = require("express");
require("dotenv").config();
const dbConnect = require('./config/dbconnect');
const initRoutes = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const YAML = require('yaml');
// const fs = require("fs");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        description: 'This is the rest api document for Happy-Tour system',
        version: '1.0.0',
      },
    },
    apis: ['./openapi/*.yaml'], // files containing annotations as above
  };
  
const openapiSpecification = swaggerJsdoc(options);

const app = express();

app.use(cookieParser());

const port = process.env.PORT || 8888;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.LOCAL_URL,
  methods: ['POST', 'PUT', 'GET', 'DELETE'],
  credentials: true
}));

dbConnect();

// Read file YAML
// const file  = fs.readFileSync('./happytour-swagger.yaml', 'utf8');
// const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

initRoutes(app);

app.listen(port, () => {
    console.log('Server is running on the port: ' + port);
});


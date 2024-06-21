const express = require("express");
require("dotenv").config();
const dbConnect = require('./config/dbconnect');
const initRoutes = require('./routes');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 8888;
app.use(express.json());
app.use(cors());
app.get('/test', (req, res) => {
    res.json({ message: 'CORS is working!' });
});
app.use(express.urlencoded({ extended: true }));
dbConnect();
initRoutes(app);

app.use('/', (req, res) => {
    res.send("server on")
});

app.listen(port, () => {
    console.log('Server is running on the port: ' + port);
});

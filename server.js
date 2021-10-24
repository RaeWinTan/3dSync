
const express = require("express");
const app = express();


app.use('/', express.static(__dirname+'/3dstuff'));

app.listen('5000');

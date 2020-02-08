'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const util = require('util');
const path = require('path');
const fs = require('fs');

let network = require('./fabric/network.js');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const configPath = path.join(process.cwd(), './config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

//use this identity to query
const appAdmin = config.appAdmin;


app.post('/createDoctor', async (req, res) => {
    console.log('req.body: ');
    console.log(req.body);
    let doctorID = req.body.doctorID;
  
    //first create the identity for the voter and add to wallet
    let response = await network.registerDoctor(doctorID, req.body.firstName, req.body.lastName);
    console.log('response from registerDoctor: ');
    console.log(response);
    if (response.error) {
      res.send(response.error);
    } else {
      console.log('req.body.doctorID');
      console.log(req.body.doctorID);
      let networkObj = await network.connectToNetwork(doctorID);
      
  
      if (networkObj.error) {
        res.send(networkObj.error);
      }
      req.body = JSON.stringify(req.body);
      let args = req.body;

      //connect to network and update the state with doctorID  
      let invokeResponse = await network.invoke(networkObj, false, 'createDoctor', args);
      
      if (invokeResponse.error) {
        res.send(invokeResponse.error);
      } else {
        console.log('after network.invoke ');
        let parsedResponse = JSON.parse(invokeResponse);
        parsedResponse += '. Use doctorID to login above.';
        res.send(parsedResponse);
    }
}
});

app.post('/createEhr',(req,res)=>{

})

app.listen(8000,()=>{
  console.log('listening at port 8000');
});
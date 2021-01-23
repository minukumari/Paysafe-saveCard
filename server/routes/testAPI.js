var express = require('express');
var router = express.Router();
var {
  Customer
} = require("../model/customer");
var config = require("./config.json");
var axios = require("axios");
var mongoose = require('mongoose');

var MONGODB_URI = 'mongodb+srv://****:*******@cluster0.diavv.mongodb.net/paysafe?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/paysafe', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Mngodb error'));



router.post('/payment', function(req, res, next) {
  var newCustomer = new Customer({
    merchantCustomerId:req.body.merchantCustomerId,
    merchantRefNum: req.body.merchantRefNum,
    paymentHandleToken: req.body.paymentHandleToken,
    custId: req.body.custId,
    amount: req.body.amount,
    transactionType: req.body.transactionType,
    currency: req.body.currency
  });

  newCustomer.save().then((doc) => {
    console.log(doc);
    var pay = {
        amount: req.body.amount,
        currencyCode: req.body.currencyCode,
        merchantRefNum: req.body.merchantRefNum,
        paymentHandleToken: req.body.paymentHandleToken,
    }
    const headers = {
          "Content-Type": `application/json;`,
          Authorization: `Basic ${config.credentials.private.base64}`,
          Simulator: "EXTERNAL"
          //"Access-Control-Allow-Origin": "*",
        };
        axios.post("https://api.test.paysafe.com/paymenthub/v1/payments", pay, {
            headers: headers
          }).then((result) =>{
            //console.log(result.data)
           res.send(result.data)},
           (err)=> {
            //console.log(err)
          res.send(err.response);
    })
    //res.send(doc);
  }, (err) => {
    console.log(err);
    res.status(400).send(err);
  })

  //console.log(req.body);
  //res.send('API is working properly');
});


router.post('/verify', function(req, res, next) {

  var merchantCustomerId = req.body.merchantCustomerId;
  //var name = req.body.name;
  Customer.findOne({
      merchantCustomerId: merchantCustomerId
    })
    .then(async (obj) => {
      //console.log(obj);
      //data = Object.assign({}, obj);
      if (!obj) {
        console.log("ssd")
        console.log("createCustomer");
        const headers = {
          "Content-Type": `application/json;`,
          Authorization: `Basic ${config.credentials.private.base64}`,
          Simulator: "EXTERNAL",
        };
        axios.post("https://api.test.paysafe.com/paymenthub/v1/customers", req.body, {
            headers: headers
          })

          .then(async (result) => {
              console.log(result.data)
              let createTokenPromise = new Promise(function(resolve, reject) {
                axios.post(`https://api.test.paysafe.com/paymenthub/v1/customers/${result.data.id}/singleusecustomertokens`, req.body, {
                    headers: headers
                  })
                  .then((res) => {
                    resolve(res.data)
                  })
              })
              let createToken = await createTokenPromise;
              console.log("createToken");
              console.log(createToken);
              res.send({
                token: createToken.singleUseCustomerToken,
                id: createToken.customerId
              });
            },
            (err) => {
              console.log("Error in Create Customer")
              return err;
            });

      } else {
          console.log(obj.custId)
          const headers = {
          "Content-Type": `application/json;`,
          Authorization: `Basic ${config.credentials.private.base64}`,
          Simulator: "EXTERNAL",
        };
              let createTokenPromise = new Promise(function(resolve, reject) {
                axios.post(`https://api.test.paysafe.com/paymenthub/v1/customers/${obj.custId}/singleusecustomertokens`, req.body, {
                    headers: headers
                  })
                  .then((res) => {
                    resolve(res.data)
                  })
              })
              let createToken = await createTokenPromise;
              console.log("createToken");
              console.log(createToken);
              res.send({
                token: createToken.singleUseCustomerToken,
                id: obj.custId
              });
      }
    }, (err) => {
      res.status(400).send("DB is down");
    })
});


module.exports = router;
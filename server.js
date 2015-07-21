var braintree =  require('braintree'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: '2vqc8r25rszbcmz7',
  publicKey: 'gbqdzhtgmkd9cprp',
  privateKey: '181f76d52507f3c639e7073783005d80'
});

var genreate_client_token = function(req, res){
  console.log("GENERATEING TOKEN");
  gateway.clientToken.generate({}, function(err, response) {
    res.end(response.clientToken);
  });
};

var get_payment_nonce = function(req){
  // console.log('BODY', req.body);
  return req.body.payment_method_nonce;
};

var making_transaction = function(req, res){
  var nonce = get_payment_nonce(req);
  console.log(nonce);
  if (nonce !== null) {
    console.log('START TRANSACTION');
    gateway.transaction.sale({
      amount: '2.00',
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true
      }
    },
    function(err, result){
      console.log("IN RESULT");
      console.log(result);
      res.end(JSON.stringify(result));
    });
  }
};

var get_other = function(req, res) {
  var fPath = path.normalize(path.join(__dirname, req.url));
  var stat = null;

  if (fs.existsSync(fPath)) {
    res.writeHead('200', {
      'Content-Type': 'text/html',
    });

    var readStream = fs.createReadStream(fPath);
    readStream.pipe(res);
  } else {
    res.end('Uhoh! 404');
  }
};

app.use(bodyParser.json({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/client_token', function(req, res){
  genreate_client_token(req, res);
});

app.post('/payment', function(req, res){
  making_transaction(req, res);
})

app.use(function(req, res){
  get_other(req, res);
})

http.listen(8888, function(){
  console.log('server is on 8888');
});

process.on('uncaughtException', function(err){
  // console.log(err);
  app.listen(8888);
});

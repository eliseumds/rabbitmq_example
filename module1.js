var amqp = require('amqp')
    connection = amqp.createConnection(),
    callbacks = {};

var queueName = 'front';

connection.on('ready', function() {
  connection.queue(queueName, { passive: true }, function(q){
      q.bind('#');
      q.subscribe({ ack: true, prefetchCount: 100 }, processMessage);
  });
});

var express = require('express'),
    app = express(),
    port = process.argv[2] || 8888;

app.use(express.bodyParser({
    keepExtensions: true
}));
app.use(express.methodOverride());
app.use(app.router);

app.listen(port);
console.log('Server running at port', port);

// ----
 
function login(msg, callback) {
    msg.id = String(Math.random());
    msg.responseQueue = queueName;
    connection.publish('account', new Buffer(JSON.stringify(msg)));
    callbacks[msg.id] = callback;
}
 
app.get('/login', function(req, res) {
    var msg = { email: req.query.email, password: req.query.password };
    
    login(msg, function(logged) {
        if (logged) {
            res.json({ logou: 'sim' });
        } else {
            res.json({ logou: 'nao' });
        }
    });
});
 
function processMessage(message, headers, deliveryInfo, originalMessage) {
    var msg = JSON.parse(message.data.toString());
    callbacks[msg.id](msg.result);
    originalMessage.acknowledge();
}

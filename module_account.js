var amqp = require('amqp')
    connection = amqp.createConnection(); // localhost

connection.on('ready', function() {
  connection.queue('account', { passive: true }, function(q){
      q.bind('#');
      q.subscribe({ ack: true, prefetchCount: 100 }, processMessage);
  });
});

function login(email, password) {
    if (email === 'admin@admin.com' && password == 'admin') {
        return true;
    }

    return false;
}

function processMessage(message, headers, deliveryInfo, originalMessage) {
    var msg = JSON.parse(message.data.toString()),
        response = { id: msg.id };

    console.log('[Received] ', msg);

    response.result = login(msg.email, msg.password);
    originalMessage.acknowledge();
    connection.publish(msg.responseQueue, new Buffer(JSON.stringify(response)));

    console.log('[Sent:' + msg.responseQueue + ']', JSON.stringify(response));
}

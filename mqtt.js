var mqtt = require('mqtt');

var client = mqtt.connect(
	'mqtts://localhost:8883',
	{
		rejectUnauthorized: false
	}
);

client.on('connect', function() {
	console.log('connected');
	client.publish('application/1/device/1/event/up', JSON.stringify({ pippo: 'pluto' }));
	client.publish('application/2/device/3339343752356A14/event/up', JSON.stringify({ msg: 'come da test' }));
	console.log('message sent');
	client.end();
});

"use strict";

// Tell JSHint about EventSource
/*global
 	EventSource
 */

var Emitter = require('irrelon-emitter'),
	emitter;

var Client = function () {

};

emitter = new Emitter(Client);

Client.prototype.connect = function (server, callback) {
	var self = this,
		source = new EventSource(server + '/_sse');

	source.addEventListener('open', function (e) {
		self.emit('open', e);
	}, false);

	source.addEventListener('error', function (e) {
		//if (source.readyState === 2) {
			// The connection is dead, remove the connection

		//}

		self.emit('error', e);
	}, false);

	source.addEventListener('message', function(e) {
		var data = JSON.parse(e.data);
		self.emit('data', e.type, data);
	}, false);

	if (callback) {
		source.addEventListener('connected', function (e) {
			callback(false);
		}, false);
	}
};

module.exports = Client;
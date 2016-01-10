"use strict";

// Tell JSHint about EventSource
/*global
 	EventSource
 */

var Emitter = require('irrelon-emitter'),
	connection,
	emitter;

var Client = function () {

};

emitter = new Emitter(Client);

Client.prototype.connect = function (server, authKey, authVal, callback) {
	var self = this,
		authString;

	authString = authKey ? '?' + authKey + '=' + authVal : '';
	connection = new EventSource(server + '/_sse' + authString);

	connection.addEventListener('open', function (e) {
		self.emit('open', e);
	}, false);

	connection.addEventListener('error', function (e) {
		//if (connection.readyState === 2) {
			// The connection is dead, remove the connection

		//}

		self.emit('error', e);
	}, false);

	connection.addEventListener('message', function(e) {
		var data = JSON.parse(e.data);
		self.emit('data', data.cmd, data.data);
		self.emit(data.cmd, data.data);
	}, false);

	if (callback) {
		connection.addEventListener('connected', function (e) {
			callback(false);
		}, false);
	}
};

Client.prototype.disconnect = function (callback) {
	var self = this;

	if (connection) {
		connection.addEventListener('close', function (e) {
			self.emit('close', e);

			if (callback) { callback(false, e); }
		}, false);

		connection.close();
		connection = undefined;
	}
};

module.exports = Client;
"use strict";

var express = require('express'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	//async = require('async'),
	app = express(),
	resArr = [],
	messageId = 0;

app.use(cors({origin: true}));
app.use(bodyParser.json());

// Allow preflight cors
app.options('*', cors({origin: true}));

var Server = function () {
	this.init.apply(this, arguments);
};

Server.prototype.init = function () {
	var self = this;

	// Define the default routes (catchall that resolves to collections etc)
	self._defineRoutes();
	self.hasPermission(function () {
		return false;
	});
};

Server.prototype.hasPermission = function (val) {
	if (val !== undefined) {
		this._hasPermission = val;
		return this;
	}

	return this._hasPermission;
};

/**
 * Starts the rest server listening for requests against the ip and
 * port number specified.
 * @param {String} host The IP address to listen on, set to 0.0.0.0 to
 * listen on all interfaces.
 * @param {String} port The port to listen on.
 * @param {Function=} callback The method to call when the server has
 * started (or failed to start).
 * @returns {Server}
 */
Server.prototype.listen = function (host, port, callback) {
	var server;

	// Start listener
	if (!server) {
		server = app.listen(port, host, function (err) {
			if (!err) {
				console.log('SSE server listening at http://%s:%s', host, port);

				if (callback) {
					callback(false, server);
				}
			} else {
				console.log('Listen error', err);
				callback(err);
			}
		});
	} else {
		// Server already running
		if (callback) {
			callback(false, server);
		}
	}

	return this;
};

Server.prototype._defineRoutes = function () {
	var self = this;

	app.get('/', function (req, res) {
		res.send({
			server: 'Irrelon SSE Server'
		});
	});

	// Handle sync routes
	app.get('/_sse', function (req, res) {
		if (self._hasPermission(req)) {
			resArr.push(res);

			// Let request last as long as possible
			req.socket.setTimeout(0x7FFFFFFF);

			// Send headers for event-stream connection
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive'
			});

			res.write('\n');

			self.sendToRes(res, 'connected', {});

			req.on("close", function () {
				// Get index of resource
				var index = resArr.indexOf(res);

				if (index > -1) {
					resArr.splice(index, 1);
				}
			});
		} else {
			res.status(403).send('Authentication failed');
		}
	});
};

Server.prototype.send = function (eventName, data) {
	var res,
		i;

	messageId++;

	for (i = 0; i < resArr.length; i++) {
		res = resArr[i];

		this.sendToRes(res, eventName, data);
	}
};

Server.prototype.sendToRes = function (res, eventName, data) {
	//res.write('event: ' + eventName + '\n');
	res.write('id: ' + messageId + '\n');
	res.write("data: " + JSON.stringify({cmd: eventName, data: data}) + '\n\n');
};

module.exports = Server;
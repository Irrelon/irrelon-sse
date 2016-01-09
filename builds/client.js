var Client = require('../lib/Client');

if (typeof window !== 'undefined') {
	window.IrrelonSSE = Client;
}

module.exports = Client;
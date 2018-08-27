const net = jest.genMockFromModule('net');

global.writeNetResult = true;

net.createConnection = function(opt, callback) {
    setTimeout(callback, 10);
    return {
        on: function(name, action) {
            if (name === 'end') {
                global.closeNet = action;
            }
        },
        write: function(message, encoding, callback) {
            if (global.onNetMessage) global.onNetMessage(message);
            return global.writeNetResult;
        },
        close: function(cb) {
            if (cb) cb();
        }
    }
}

module.exports = net;
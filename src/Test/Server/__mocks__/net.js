const net = jest.genMockFromModule('net');

net.createConnection = function(opt, callback) {
    setTimeout(callback, 10);
    return {
        on: function(name, action) {
            if (name === 'close') {
                action();
            }
        },
        write: function(message, encoding, callback) {
            if (global.onNetMessage) global.onNetMessage(message);
            return true;
        },
        close: function(cb) {
            if (cb) cb();
        }
    }
}

module.exports = net;
const cluster = jest.genMockFromModule('cluster');

Object.defineProperty(cluster, 'isMaster', {
    get: function() {
        return global.isMaster
    }
});

cluster.fork = () => {
    if (global.onFork) global.onFork();
};

module.exports = cluster;
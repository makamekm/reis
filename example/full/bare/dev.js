const bs = require('browser-sync').create();

bs.init({
    files: ['./dev/public/*.js', './dev/public/*.css'],
    proxy: {
        target: "localhost:3000",
        ws: true
    },
    port: 3001,
    ui: {
        port: 3002
    },
    open: false,
    reloadOnRestart: true,
})
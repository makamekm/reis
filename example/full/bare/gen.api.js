var child_process = require('child_process');
const ping = require('node-http-ping');

async function tryWatch() {
    try {
        await ping('127.0.0.1', 3000);
    } catch (e) {
        return new Promise(r => setTimeout(async () => {
            await tryWatch();
            r();
        }, 1000));
    }
    
    child_process.execSync("npm run api", { stdio: [0, 1, 2] });
}

tryWatch();
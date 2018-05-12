const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
var client = new (require('npm-registry-client'))({});

// Reading the current package.json
let data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json')));

// Changing public data
data.name = "reiso";
data.private = false;
delete data.scripts;

// Writing the data
let strData = JSON.stringify(data, null, 2);
fs.writeFileSync(path.resolve(__dirname, 'build', 'package.json'), strData);

let strComposer = fs.readFileSync(path.resolve(__dirname, 'composer.js'));
fs.writeFileSync(path.resolve(__dirname, 'build', 'composer.js'), strComposer);

let strReadme = fs.readFileSync(path.resolve(__dirname, 'README.md'));
fs.writeFileSync(path.resolve(__dirname, 'build', 'README.md'), strReadme);

let args = process.argv.slice(2)

let username = args[0];
let password = args[1];
let email = args[2];
let uri = "registry.npmjs.org";

console.log('Using:', username, email);

async function publish() {
  await new Promise((resolve, reject) => client.adduser("http://" + uri, { auth: { username, password, email } }, function (err, data, raw, res) {
    if (err) {
      reject(err);
      return;
    }
    fs.writeFileSync(path.resolve('./build/.npmrc'), `//<npm-registry>:8080/:_authToken=\n//${uri}\/:_authToken=${data.token}`);
    resolve();
  }));

  execSync("npm publish", { stdio: [0, 1, 2], cwd: path.resolve(__dirname, 'build') });
}

publish();
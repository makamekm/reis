const { GitWatcher } = require('git-repo-watch');
const { execSync } = require('child_process');

const gw = new GitWatcher();

// Use Sync Fork to check for changes in the upstream an update.
gw.watch({
  remote: 'origin',
  branch: 'master',
  poll: 10
});

const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const email = process.env.EMAIL;

console.log('Using:', username, email);

gw.result$.subscribe( (result) => {
  if (result.error) {
    gw.unwatch(result.config);
    console.error(result.error);
  } else {
    if (result.changed) {
      execSync("npm i", { stdio: [0, 1, 2] });
      execSync("rm -rf build", { stdio: [0, 1, 2] });
      execSync("npm run build", { stdio: [0, 1, 2] });
      execSync(`node publish ${username} ${password} ${email}`, { stdio: [0, 1, 2] });
    }
  }
});

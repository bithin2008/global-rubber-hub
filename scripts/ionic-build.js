const { spawnSync } = require('child_process');
const { join } = require('path');

const angularCli = require.resolve('@angular/cli/bin/ng.js');
const buildArguments = [];

for (let argumentIndex = 2; argumentIndex < process.argv.length; argumentIndex += 1) {
  const argument = process.argv[argumentIndex];

  if (argument === '--platform') {
    argumentIndex += 1;
    continue;
  }

  if (argument.startsWith('--platform=')) {
    continue;
  }

  buildArguments.push(argument);
}

const result = spawnSync(process.execPath, [angularCli, 'build', ...buildArguments], {
  cwd: join(__dirname, '..'),
  stdio: 'inherit'
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
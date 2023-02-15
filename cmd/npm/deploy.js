const { spawnSync, spawn } = require('node:child_process');
const ls = spawn('bash', ['-c', 'docker exec -i node-complier pwd']);
console.log('hellow');
ls.stdout.on('data', (data) => {
  console.log(`____stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`____stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`____child process exited with code ${code}`);
  if (code > 0) {
    console.log('____spawn has error');
  }
});

const dc = spawnSync('docker', ['exec', '-i', 'node-complier', 'ls', '-la'],
    { stdio: 'inherit', env:{DOCKER_CONTEXT: 'default'}});

if(dc.status > 0){
  console.error(`>>error:${dc.status}`);
}else{
  console.log('>> spawn sync success');
}

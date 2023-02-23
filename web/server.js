#!/usr/bin/node
// https://www.tutorialspoint.com/nodejs/nodejs_net_module.htm
const { spawn, spawnSync, execSync } = require('child_process');
const net = require('net');

const server = net.createServer(function (connection) {
    server.getConnections((err, count)=>{
        console.log('count=' + count);
    })
    
    console.log('client connected');
    connection.on('end', function () {
        console.log('client disconnected');
    });

    todo(connection)
    //connection.end()
    //connection.pipe(connection);
});

server.listen(8081, function () {
    console.log('server is listening');
    process.stdout.write
});

function todo(connection) {
    let ls = spawn('sh', ['-c', 'docker pull centos:latest'])
    ls.stdout.on('data', x => {
        connection.write(x.toString())
    })
    ls.stderr.on('data', x => {
        connection.write(x.toString())
    })
    ls.on('close', x => {
        connection.end()
    })
}
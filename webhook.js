let http = require('http');
let crypto = require('crypto');
var spawn = require('child_process').spawn;
let sendMail = require('./sendMail');
const SECRET = '123456';
let isServerStarted = false; // 全局变量，用于跟踪服务是否已经启动

function sign(data) {
    return 'sha1=' + crypto.createHmac('sha1', SECRET).update(data).digest('hex');
}

let server = http.createServer(function (req, res) {
    console.log(req.method, req.url);
    if (req.url == '/webhook' && req.method == 'POST') {
        let buffers = [];
        req.on('data', function (data) {
            buffers.push(data);
        });
        req.on('end', function () {
            let body = Buffer.concat(buffers);
            let sig = req.headers['x-hub-signature'];
            let event = req.headers['x-github-event'];
            let id = req.headers['x-github-delivery'];
            if (sig !== sign(body)) {
                return res.end('Not Allowed');
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({"ok": true}));
            //===========分割线===================
            if (event === 'push') {
                let payload;
                try {
                    payload = JSON.parse(body);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    return;
                }
                let child = spawn('sh', [`./${payload.repository.name}.sh`]);
                let buffers = [];
                child.stdout.on('data', function (buffer) {
                    buffers.push(buffer);
                });
                child.stderr.on('data', function (data) {
                    console.error('Error from child process:', data);
                });
                child.on('close', function (code) {
                    if (code !== 0) {
                        console.error(`Child process exited with code ${code}`);
                        return;
                    }
                    let logs = Buffer.concat(buffers).toString();
                    sendMail(`
            <h1>部署日期: ${new Date()}</h1>
            <h2>部署人: ${payload.pusher.name}</h2>
            <h2>部署邮箱: ${payload.pusher.email}</h2>
            <h2>提交信息: ${payload.head_commit && payload.head_commit['message']}</h2>
            <h2>布署日志: ${logs.replace("\r\n", '<br/>')}</h2>
        `);
                });
            }
        });
    } else {
        res.end('Not Found!');
    }
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

const PORT = 4000;

server.listen(PORT, () => {
    console.log(`服务正在 ${PORT} 端口上启动!`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用！`);
    } else {
        console.error('启动服务时发生错误：', err);
    }
});

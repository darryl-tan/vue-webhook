module.exports = {
    apps: [
        {
            name: "vue-webhook",
            script: "nodemon",
            args: "webhook.js", // 传递给 nodemon 的参数
            interpreter: "none", // 告诉 PM2 不需要用 node 执行，因为 nodemon 自己会处理
            watch: false, // 由 nodemon 自己负责 watch，PM2 不需要
            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production"
            }
        }
    ]
};

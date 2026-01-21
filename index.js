const express = require("express");
const path = require("path");
const fs = require("fs");

const { getTableMeta } = require("./table_meta.js");
const { getTableRecords } = require("./table_records.js");
const { judgeEncryptSignValid } = require("./request_sign.js");

const app = express();

app.use(express.json());
// 配置静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 用户授权状态存储（实际项目中应使用数据库）
const authStatus = new Map();

// 获取授权URL接口
app.get("/api/auth/url", (req, res) => {
    const userId = req.query.userId;
    
    if (!userId) {
        return res.status(400).json({
            code: 400,
            message: "缺少userId参数",
            data: null
        });
    }

    console.log(`获取授权URL请求，userId: ${userId}`);

    // 生成本项目的授权链接（static中间件已配置，/authorize.html即可访问public/authorize.html）
    const authUrl = `https://psychic-space-fishstick-6977gjp44rj2r9r6-3000.app.github.dev/authorize.html?userId=${userId}&redirect_uri=https://psychic-space-fishstick-6977gjp44rj2r9r6-3000.app.github.dev`;

    const result = {
        code: 0,
        message: "获取授权URL成功",
        data: {
            url: authUrl,
            userId: userId
        }
    };

    res.status(200).json(result);
});

// 检查授权状态接口
app.get("/api/auth/status", (req, res) => {
    const userId = req.query.userId;
    
    if (!userId) {
        return res.status(400).json({
            code: 400,
            message: "缺少userId参数",
            data: null
        });
    }

    console.log(`检查授权状态，userId: ${userId}`);

    // 从存储中获取用户的授权状态
    const isAuthed = authStatus.get(userId) || false;

    const result = {
        code: 0,
        message: "授权状态查询成功",
        data: {
            userId: userId,
            isAuthed: isAuthed
        }
    };

    res.status(200).json(result);
});

// 授权回调接口（三方平台重定向回来）
app.get("/api/auth/callback", (req, res) => {
    const { state, code } = req.query;

    if (!state || !code) {
        return res.status(400).json({
            code: 400,
            message: "缺少必要的授权参数",
            data: null
        });
    }

    console.log(`授权回调，userId: ${state}, code: ${code}`);

    // 验证code并获取access_token（这里是示例，实际需要调用三方API）
    // const accessToken = await exchangeCodeForToken(code);

    // 标记用户为已授权
    authStatus.set(state, true);

    // 返回成功页面或重定向到前端页面
    res.status(200).json({
        code: 0,
        message: "授权成功",
        data: {
            userId: state,
            isAuthed: true
        }
    });
});

app.get("/", (req, res) => {
    res.send("hello world");
});

app.get("/meta.json", (req, res) => {
    fs.readFile(
        path.join(__dirname, "./public/meta.json"),
        "utf8",
        (err, data) => {
            res.set("Content-Type", "application/json");
            res.status(200).send(data);
        },
    );
});

app.post("/api/table_meta", (req, res) => {
    console.log("table_meta的请求数据", req.body);
    console.log("加密判断结果：", judgeEncryptSignValid(req));

    const result = { code: 0, message: "POST请求成功", data: getTableMeta() };

    res.status(200).json(result);
});

app.post("/api/records", (req, res) => {
    // Process a POST request
    console.log("table_records 的请求数据", req.body);
    console.log("加密判断结果：", judgeEncryptSignValid(req));

    // 进行处理，并返回结果
    const result = {
        code: 0,
        message: "POST请求成功",
        data: getTableRecords(),
    };
    res.status(200).json(result);
});

app.listen(3000, () => {
    console.log("Express server initialized");
});

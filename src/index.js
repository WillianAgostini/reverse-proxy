const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const utils = require('./utils');
require('dotenv').config();

const app = express();
app.use(express.static('public'))

app.get('/listFiles', (req, res) => {
    const files = utils.listFiles();
    res.json(files);
});

app.delete('/clearFiles', (req, res) => {
    utils.clearFiles();
    res.status(200).send();
});

const proxyMiddleware = createProxyMiddleware({
    target: process.env.BUS_URL,
    onProxyReq: (proxyReq, req, res) => {
        req.body = '';
        req.on('data', function (chunk) {
            req.body += chunk;
        });
    },
    onProxyRes: (proxyRes, req, res) => {
        res.body = '';
        proxyRes.on('readable', function () {
            res.body += proxyRes.read();
        });
        proxyRes.on('end', function () {
            utils.process(req, res);
        });
    }
});

app.use('/', proxyMiddleware);

app.listen(12001)

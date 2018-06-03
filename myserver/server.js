var http = require('http'),
    httpProxy = require('http-proxy'),
    JSON = require('JSON');

var proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', function (proxyReq, req, res, options) {
    console.log(res);

    proxyReq.removeHeader('origin');
});

proxy.on('proxyRes', function (proxyRes, req, res) {

    let existingCookies = proxyRes.headers['set-cookie'],
        rewrittenCookies = [];

    // console.log("Request:", req);

    if (existingCookies !== undefined) {
        if (!Array.isArray(existingCookies)) {
            existingCookies = [existingCookies];
        }

        for (let i = 0; i < existingCookies.length; i++) {
            console.log(JSON.stringify(existingCookies[i],null,2));
            rewrittenCookies.push(existingCookies[i].replace(/;\s*?(Secure)/i, ''));
            console.log(JSON.stringify(rewritteCookies[i],null,2));
        }

        proxyRes.headers['set-cookie'] = rewrittenCookies;
    }
});

var server = http.createServer(function (req, res) {

    proxy.web(req, res, {
        target: 'https://demo.djangobooster.com',
        changeOrigin: true
    });
});

let port = 5051;
console.log("listening on port " + port)
server.listen(port);

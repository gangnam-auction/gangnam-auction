const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app)
{
    app.use(
        '/api',
        createProxyMiddleware(
        {
            target: 'http://112.221.66.174:8081/',
            changeOrigin: true,
            secure: false
        })
    );

    app.use(
        '/images',
        createProxyMiddleware(
            {
                target: 'http://112.221.66.174:8081/',
                changeOrigin: true,
                secure: false
            })
    );
};

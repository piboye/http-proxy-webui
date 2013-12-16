var _ = require("underscore");
var url_tool = require("url");
var cookie_proxy = require("../cookie_proxy");
var cookie_proxy_port = cookie_proxy.listen_port;
exports.forward = function(req, resp) {
    var url = req.query.url;
    console.log(url);
    var result = url_tool.parse(url);
    var ip = result.hostname;
    var port = result.port;
    var host = req.headers.host;
    var a = host.split(":");
    var location = "http://"+a[0]+":"+cookie_proxy_port+result.path;
    resp.cookie('proxy_forward_ip', ip, {maxAge:900000});
    resp.cookie('proxy_forward_port', port, {maxAge:900000});
    resp.writeHead(302, {
        'Location': location
    });
    resp.end(location);
}

var http = require('http');
var httpProxy = require('http-proxy');
var get_cookies = function(rc) {
    var cookies = {};
    rc && rc.split(";").forEach(function(cookie){
        var parts = cookie.split("=");
        cookies[parts.shift().trim()] = unescape(parts.join('='));
    });
    return cookies;
};

var setup_websocket_proxy = function(proxy, port, port2) {
    var server = http.createServer(function (req, res) {
        proxy.proxyRequest(req, res, 
           {
            host: "localhost",
            port:port2
           }
        );
    });

    server.on('upgrade', function (req, socket, head) {
        var cookies = get_cookies(req.headers.cookie);
        var ip = cookies["proxy_forward_ip"];
        var port2 = cookies["proxy_forward_port"];

        if( (typeof ip) != "undefined" && (typeof port2) != "undefined") {
            proxy.proxyWebSocketRequest(req, socket, head,
                {host:ip,
                port:port2
            });
        } else {
            console.error("no ip or port, %s:%s", ip, port2);
            socket.close();
        }
    });
    server.listen(port, function(err) {
        console.error("listen cookie proxy server failed, port:%d", port);
    });
    return server;
};

var setup_http_proxy= function(port) {
     var http_proxy_server = httpProxy.createServer(function(req, res, proxy) {
        var cookies = get_cookies(req.headers.cookie);
        var ip = cookies["proxy_forward_ip"];
        var port2 = cookies["proxy_forward_port"];

        if( (typeof ip) != "undefined" && (typeof port2) != "undefined") {
            proxy.proxyRequest(req, res, {
                host:ip,
                port:port2
            });
        } else {
            console.error("no ip or port, %s:%s", ip, port2);
            res.responseCode = 404;
            res.end("failed");
        }
    }).listen(port);
    return http_proxy_server;
}

exports.start  = function (port, http_proxy_port) {
     !port && (port = 8080);
     !http_proxy_port && (http_proxy_port = 8888);
     var http_proxy_server = setup_http_proxy(http_proxy_port);
     var server = setup_websocket_proxy(http_proxy_server.proxy, port, http_proxy_port);
    
    exports.websocket_server = server;
    exports.http_server = http_proxy_server;
    exports.listen_port = port;
    return server;
};

exports.stop = function() {
    exports.server.stop();
};

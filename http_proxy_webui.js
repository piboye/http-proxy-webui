/**
 * Module dependencies.
 */
//set process name for ps
process.title = "node_http_proxy_webui";

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var _ = require("underscore");

var proxy = null;
var app = express();

// all environments
app.set('port', process.env.PORT || 9000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var web_ui_router = {};
var web_ui_router_key = [];

app.get("/cgi/:cgi/:method", function(req, res) {
    try 
    {
        var cgi = require("./cgi/"+req.params.cgi);
        var proc = cgi[req.params.method];
        if (typeof (proc) == "function") {
            proc(req, res, {proxy:proxy, webui_keys:web_ui_router_key});
        } else {
            res.statusCode=404;
            res.end("error", 404);
        }
    }
    catch (e) {
        console.error("error:%s", e);
        console.error("stack:%s", e.stack);
        res.statusCode=404;
        res.end("no cgi", 404);
    }
});

port = app.get('port');
var http_web_ui = http.createServer(app).listen(port, function(){
  console.log('Express server listening on port ' + port);
});

// setup http proxy
var httpProxy = require('http-proxy');

var get_ip_list= function() {
    var os=require('os');
    var ifaces=os.networkInterfaces();
    var addrs=[];
    for (var dev in ifaces) {
        var alias=0;
        ifaces[dev].forEach(function(details){
            if (details.family=='IPv4') {
                addrs.push(details.address);
                //console.log(dev+(alias?':'+alias:''),details.address);
                ++alias;
            }
        });
    }
    return addrs;
};
	
var local_ips = get_ip_list();
_.each(local_ips,function(ip) {
    web_ui_router[ip] = ip+":"+port;
});
web_ui_router_key = _.keys(web_ui_router);

var db = require("./db.js");
var config_router = db.get_data();
//var router = _.extend(config_router, web_ui_router);
var options = {
  router: _.extend(config_router, web_ui_router)
}

var proxy_port = app.get('proxy_port');
if (!proxy_port) proxy_port = 80;
console.log("proxy_port:%d", proxy_port);
proxy = httpProxy.createServer(options).listen(proxy_port);

var cookie_proxy_port = app.get('cookie_proxy_port');
var cookie_proxy_http_port = app.get('cookie_proxy_http_port');
if (!cookie_proxy_port) cookie_proxy_port = 8080;
if (!cookie_proxy_http_port) cookie_proxy_http_port = 8888;
var cookie_proxy = require("./cookie_proxy");
cookie_proxy.start(cookie_proxy_port, cookie_proxy_http_port);

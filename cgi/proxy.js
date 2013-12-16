var _ = require("underscore");
var util = require("util");
var db = require("../db.js");

var has_webui_keys = function(key, keys) {
    return _.some(keys, function(k) { return k == key;});
};

exports.add = function(req, resp, Env) {
    var proxy = Env.proxy;
    var src = req.query.src;
    var dest = req.query.dest;
    var callback = req.query.callback;
    var webui_keys = Env.webui_keys;
    if (!!src  && !!dest ) {
        if (has_webui_keys(src, webui_keys)) {
            resp.end(util.format("%s(%j);", callback, {ret:2, 
                                 msg:"forbidden,src is  webui proxy map"}));
             return;
        }
        var table = _.clone(proxy.proxy.proxyTable.router);
        if (_.has(table, src)) {
            resp.end(util.format("%s(%j);", callback, {ret:3, 
                                 msg:"forbidden,src:["+src+"] is  exist", dest:table.src}));
             return;
        }
        proxy.proxy.proxyTable.addRoute(src, dest);
        resp.end(util.format("%s(%j);", callback, {ret:0, msg:"success"}));
        //
        table = _.clone(proxy.proxy.proxyTable.router);
        _.each(webui_keys, function(k) { delete table[k];});
        db.save(table);
        //
    } else {
        resp.end(util.format("%s(%j);", callback, {ret:1, msg:"error src or dest"}));
    }
};

exports.remove = function(req, resp, Env) {
    var proxy = Env.proxy;
    var src = req.query.key;
    var callback = req.query.callback;
    var webui_keys = Env.webui_keys;
    if (!!src) {
        if (has_webui_keys(src, webui_keys)) {
            resp.end(util.format("%s(%j);", callback, {ret:2, 
                                 msg:"forbidden,src is  webui proxy map"}));
        }
        proxy.proxy.proxyTable.removeRoute(src);
        var table = _.clone(proxy.proxy.proxyTable.router);
        resp.end(util.format("%s(%j);", callback, {ret:0, msg:"success"}));
        //
        table = _.clone(proxy.proxy.proxyTable.router);
        _.each(webui_keys, function(k) { delete table[k];});
        db.save(table);
    } else {
        resp.end(util.format("%s(%j);", callback, {ret:1, msg:"error src or dest"}));
    }
};

exports.list = function(req, resp, Env) {
    var proxy = Env.proxy;
    var callback = req.query.callback;
    var webui_keys = Env.webui_keys;
    var out = _.clone(proxy.proxy.proxyTable.router);
    _.each(webui_keys, function(key) {
        delete out[key];
    });
    resp.end(util.format("%s(%j);", callback, {ret:0, list:out}));
};

exports.change = function(req, resp, Env) {
    var proxy = Env.proxy;
    var old_key = req.query.old_key;
    var src = req.query.src;
    var dest = req.query.dest;
    var callback = req.query.callback;
    var webui_keys = Env.webui_keys;
    if (!!old_key && !!src  && !!dest ) {
        if (has_webui_keys(src, webui_keys)) {
            resp.end(util.format("%s(%j);", callback, {ret:2, 
                                 msg:"forbidden,src is  webui proxy map"}));
             return;
        }
        proxy.proxy.proxyTable.removeRoute(old_key);
        proxy.proxy.proxyTable.addRoute(src, dest);
        resp.end(util.format("%s(%j);", callback, {ret:0, msg:"success"}));
        var table = _.clone(proxy.proxy.proxyTable.router);
        _.each(webui_keys, function(k) { delete table[k];});
        db.save(table);
    } else {
        resp.end(util.format("%s(%j);", callback, {ret:1, msg:"error src or dest"}));
    }
};

var fs = require('fs');
var db_file = './db/proxy_db.json';
exports.save = function(datas) {
    fs.writeFile(db_file, JSON.stringify(datas, null, 4), function(err) {
        if(err) {
            console.log(err);
        } 
    });
}

exports.get_data = function() {
    try {
        var data = fs.readFileSync(db_file, 'utf8'), 
        data = JSON.parse(data);
        return data;
    } catch(e) {
            console.log('Error: ,' + e);
            console.log('stack: ,' + e.stack);
            return {};
    }
}

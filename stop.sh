export PATH=./node_modules/forever/bin/:$PATH  
forever -e ./error.log -o log/output.log stop http_proxy_webui.js

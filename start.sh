export PATH=./node_modules/forever/bin:$PATH
export NODE_ENV=production
nohup forever -e log/error.log -o log/output.log http_proxy_webui.js &

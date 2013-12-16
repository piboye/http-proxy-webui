(cd ../; tar -czf http-proxy-webui.tar.gz -T<(find http-proxy-webui/  -not -iwholename '*.svn*' -and -not -iwholename '*.git*' ))

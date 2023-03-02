# crontab -l
# 16 3 * * * /opt/containerd/etcd.d/bak_cron.sh
# cron logged by rsyslog, config: /etc/rsyslog.conf `#cron*`, 'systemctl restart rsyslog.service'
set -e

etcd_home=/var/lib/etcd
bak_today=$(date +%Y%m%d-%H%M%S)

/usr/local/etcd/bin/etcdctl snapshot save --endpoints=127.0.0.1:2376 $etcd_home/_bak/bak${bak_today}.bak \
	|| echo "${bak_today}, failed for backup" >> $etcd_home/error.log

echo ">>prune old *.bak files"

find $etcd_home/_bak/ -name '*.bak' -type f -mtime +61 -print -exec rm -rf {} \; \
	|| echo "${bak_today}, failed for prune old .bak files" >> $etcd_home/error.log

echo ">>finish."

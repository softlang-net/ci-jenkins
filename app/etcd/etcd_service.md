#### etcd service config
> https://github.com/softlang-net/ci-etc-dns/tree/main/etcd


- /etc/systemd/system/etcd.service
> `systemctl edit --full -f etcd`

```conf
# systemctl edit --full -f etcd
[Unit]
Description=etcd - highly-available key value store
Documentation=https://github.com/coreos/etcd
Documentation=man:etcd
After=network.target
Wants=network-online.target

[Service]
Type=notify
User=etcd
PermissionsStartOnly=true
ExecStart=/usr/local/etcd/bin/etcd --config-file=/etc/etcd/config.yaml
Restart=on-abnormal
#RestartSec=10s
LimitNOFILE=65536
MemoryMax=128M

[Install]
WantedBy=multi-user.target
```
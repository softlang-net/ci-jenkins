#### coredns run as service

- /etc/systemd/system/coredns.service
> `systemctl edit --full -f coredns`

```conf
[Unit]
Description=CoreDNS DNS server
Documentation=https://coredns.io
After=network.target etcd.service

[Service]
MemoryMax=128M
PermissionsStartOnly=true
LimitNOFILE=1048576
LimitNPROC=512
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true
# useradd coredns -s /sbin/nologin -c 'coredns.service' -d /var/lib/coredns -m
User=coredns
WorkingDirectory=/etc/coredns
ExecStart=/usr/bin/coredns -conf=Corefile
ExecReload=/bin/kill -SIGUSR1 $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
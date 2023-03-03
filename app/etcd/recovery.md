#### etcd add new node OR recovery

- etcd add new member

```shell
# etcdctl help member remove
etcdctl member remove 'memberID' # ex.etcd1
# ------ run on the normal member (etcd0) ------
# show the member list
etcdctl member list
# remove the unreachable member
etcdctl member remove b4d98e3855f0bac
# add new node
etcdctl member add etcd1  --peer-urls="http://172.17.0.13:2380"
# ---- the result message of add member, put the result to etcd1: /etc/etcd/config.yaml & systemctl start etcd (the new member)
Member eeff55ccfe0e7b9d added to cluster 76dbe3c8dbb31b81
ETCD_NAME="etcd1"
ETCD_INITIAL_CLUSTER="etcd2=http://172.17.0.14:2380,etcd0=http://172.17.0.3:2380,etcd1=http://172.17.0.13:2380"
ETCD_INITIAL_ADVERTISE_PEER_URLS="http://172.17.0.13:2380"
ETCD_INITIAL_CLUSTER_STATE="existing"
# ---- run on new member etcd1 -----
systemctl start etcd
```

- For add new member `/etc/etcd/config.yaml`

```yaml
# cat /etc/etcd/config.yaml
# etcd version: v3.3+
# https://raw.githubusercontent.com/etcd-io/etcd/release-3.4/etcd.conf.yml.sample
# This is the configuration file for the etcd server.
name: 'etcd1' # the new member-name

# `ETCD_INITIAL_CLUSTER` from `etcdctl member add etcd1`
initial-cluster: "etcd0=http://172.17.0.3:2380,etcd1=http://172.17.0.13:2380,etcd2=http://172.17.0.14:2380"

# Initial cluster token for the etcd cluster during bootstrap.
initial-cluster-token: 'xxx'

# `existing` for add new member
initial-cluster-state: 'existing'
```

- create the etcd service
```conf
# systemctl edit --full -f etcd.serice
[Unit]
Description=etcd - highly-available key value store
Documentation=https://github.com/coreos/etcd
Documentation=man:etcd
After=network.target
Wants=network-online.target

[Service]
Type=notify
# useradd -m -d /var/lib/etcd/ -s /usr/sbin/nologin etcd
User=etcd
PermissionsStartOnly=true
ExecStart=/usr/local/bin/etcd --config-file=/etc/etcd/config.yaml
Restart=on-abnormal
#RestartSec=10s
LimitNOFILE=65536
MemoryLimit=128M

[Install]
WantedBy=multi-user.target
```

- Force to create a new one-member cluster, 
> to recovery one by one (reference `add new member`)

```conf
# ----- Reset the only last one member ----
force-new-cluster: true # /etc/etcd/config.yaml
# Force to create a new one-member cluster. It commits configuration changes forcing to remove all existing members in the cluster and add itself. It needs to be set to restore a backup.
# default: false
# env variable: ETCD_FORCE_NEW_CLUSTER
```

- etcd recovery from backup

```shell
## ------ copy backup.db to every node ----
# 1. run at node0 container
etcdctl snapshot restore bak20220331-001101.bak \
  --name etcd0 \
  --initial-cluster "etcd0=http://172.17.0.3:2380,etcd1=http://172.17.0.13:2380,etcd2=http://172.17.0.14:2380" \
  --initial-cluster-token etcd_token \
  --initial-advertise-peer-urls http://172.17.0.3:2380

# 2. run at node1 container
etcdctl snapshot restore bak20220331-001101.bak \
  --name etcd1 \
  --initial-cluster "etcd0=http://172.17.0.3:2380,etcd1=http://172.17.0.13:2380,etcd2=http://172.17.0.14:2380" \
  --initial-cluster-token etcd_token \
  --initial-advertise-peer-urls http://172.17.0.13:2380

# 3. run at node2 container
etcdctl snapshot restore bak20220331-001101.bak \
  --name etcd2 \
  --initial-cluster "etcd0=http://172.17.0.3:2380,etcd1=http://172.17.0.13:2380,etcd2=http://172.17.0.14:2380" \
  --initial-cluster-token etcd_token \
  --initial-advertise-peer-urls http://172.17.0.14:2380

## -- run at host server
# >> docker compose -p host-etcd down
# >> rm old member/*
# >> mv etcd?/member/* /etcd_data/member/
# >> xcompose -p host-etcd -f compose.yaml up -d
```

- backup

```shell
# crontab -l
# 16 3 * * * /opt/containerd/etcd.d/bak_cron.sh
# cron logged by rsyslog, config: /etc/rsyslog.conf `#cron*`, 'systemctl restart rsyslog.service'
set -e
bak_today=$(date +%Y%m%d-%H%M%S)
docker exec etcd4dev ash -c "etcdctl --user health:health snapshot save /etcd_data/member/_bak/bak${bak_today}.bak" \
	|| echo "${bak_today}, failed for backup" >> /opt/containerd/etcd.d/error.log
echo ">>prune old *.bak files"

docker exec etcd4dev ash -c "find /etcd_data/member/_bak/ -name '*.bak' -type f -mtime +15 -print -exec rm -rf {} \;" \
	|| echo "${bak_today}, failed for prune old .bak files" >> /opt/containerd/etcd.d/error.log

echo ">>finish."
```
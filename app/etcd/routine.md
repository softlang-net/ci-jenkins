#### etcd routine operation

```shell
# put value
etcdctl put /dns/dc 0
etcdctl put /dns/dc/dev/mq1 '{"host":"172.17.0.3","ttl":10}'

etcdctl get --prefix -w json /dns # -w json to show revision
/dns/ci/
0
/dns/ci/image/
{"host":"172.17.0.3","ttl":10}
/dns/cn/sdinc/
0
/dns/cn/softlang/ci
{"host":"172.17.0.3","ttl":10}
/dns/dc/dev/
0
/dns/dc/dev/mq1
{"host":"172.17.0.3","ttl":10}
/dns/dc/dev/mysql1
{"host":"172.17.0.3","ttl":10}
/dns/dc/dev/pg1/
{"host":"172.17.0.3","ttl":10}
/dns/dc/dev/pod1
{"host":"172.17.0.13","ttl":10}
/dns/dc/dev/pod2
{"host":"172.17.0.14","ttl":10}
/dns/dc/dev/redis
{"host":"172.17.0.3","ttl":10}
/dns/ink/bur/npm
{"host":"172.17.0.3","ttl":10}
```
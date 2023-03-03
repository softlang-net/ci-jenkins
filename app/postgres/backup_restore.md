#### for postgres & greenplum 

- restore some table from backup.dump

```shell
# 1. create new database `demo`
# 2. create schema `crm`
# 3. restore from dump
pg_restore -v -d demo -n crm -t crm_hospital dbw01_bak_20230302-223502.dump
```

- backup daily

```shell
#!/bin/bash
set -e

# begin backup
bk_time=$(date +%Y%m%d-%H%M%S)
bk_log=/home/gpadmin/logs/gp_bak_${bk_time}.log

echo ">>clean old bakup files" >> ${bk_log}
# remove old backup (keep 3 backup files)
rm `ls -t /opt/mpp/backup/*.dump  |tail -n +4` || echo 'no files' >>  ${bk_log}

echo ">>start1: " $(date "+%Y-%m-%d %H:%M:%S") >> ${bk_log}

export PGHOST=127.0.0.1
export PGPORT=5432
export PGUSER=gpadmin
#export PGPASSWORD="pg_hba.conf"
export PGDATABASE=dw01
bk_file=/opt/mpp/backup/dbw01_bak_${bk_time}.dump
echo "start backup to ${bk_file}" >> ${bk_log}
pg_dump -Fc > ${bk_file} || (rm ${bk_file} -rf && echo "error, backup failed." >> ${bk_log} && exit 1)

echo ">>finish: " $(date "+%Y-%m-%d %H:%M:%S") >>  ${bk_log}

echo "bacup success" >>  ${bk_log}

cat ${bk_log}
```

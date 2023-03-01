#### how it works?

- caddy useful
1. caddy is easy to config ssl/https
2. caddy can be the fore-proxy with https
3. caddy can proxy for http / websocket

- v2ray server
> install `curl -Ls https://install.direct/go.sh | sudo bash`

```json
// server.json
{
    "log": {
        "loglevel": "error"
    },
    "inbounds": [
        {
            "port": 3389,
            "protocol": "vmess",
            "settings": {
                "//decryption": "none",
                "clients": [
                    {
                        "id": "guid-xxx",
                        "security": "aes-128-gcm",
                        "level": 0
                    }
                ]
            },
            "streamSettings": {
                "network": "ws",
                "wsSettings": {
                    "path": "/ws",
                    "headers": {}
                }
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom",
            "settings": {}
        },
        {
            "protocol": "blackhole",
            "settings": {},
            "tag": "blocked"
        }
    ],
    "routing": {
        "rules": [
            {
                "type": "field",
                "ip": [
                    "geoip:private"
                ],
                "outboundTag": "blocked"
            }
        ]
    }
}
```

- v2ray client (pc/android)
> brew install v2rayu (on mac)

```json
{
  "log": {
    "error": "",
    "loglevel": "info",
    "access": ""
  },
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "protocol": "socks",
      "settings": {
        "udp": false,
        "auth": "noauth"
      },
      "port": "1080"
    },
    {
      "listen": "127.0.0.1",
      "protocol": "http",
      "settings": {
        "timeout": 360
      },
      "port": "1087"
    }
  ],
  "outbounds": [
    {
      "mux": {
        "enabled": false,
        "concurrency": 8
      },
      "protocol": "vmess",
      "streamSettings": {
        "wsSettings": {
          "path": "/ws",
          "headers": {
            "host": "v2.bug.fyi"
          }
        },
        "tlsSettings": {
          "allowInsecure": false
        },
        "security": "tls",
        "network": "ws"
      },
      "tag": "proxy",
      "settings": {
        "vnext": [
          {
            "address": "v2.bug.fyi",
            "users": [
              {
                "id": "guid-xxx",
                "alterId": 0,
                "level": 0,
                "security": "aes-128-gcm"
              }
            ],
            "port": 443
          }
        ]
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP",
        "userLevel": 0
      }
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "none"
        }
      }
    }
  ],
  "dns": {},
  "routing": {
    "settings": {
      "domainStrategy": "AsIs",
      "rules": []
    }
  },
  "transport": {}
}
```
export default {
  default: {
    // You can provide your own properties here except Reiso internal ones and use them by getConfig()
    // ...
    // --- Reiso Properties ---
    // File translation path
    "translation": "./translation.json",
    // Awalable languages
    "languages": ["en"],
    // Default language
    "defaultLanguage": "en",
    // Public directory
    "publicDir": "./public",
    // Upload directory
    "uploadDir": "./uploads",
    // Upload max file size in MB
    "maxFileSize": 50,
    // Server Http port
    "port": 3000,
    // Server Web Socket Port
    "portWS": 5000,
    // Public host
    "host": "127.0.0.1",
    // Public port for Http connections for a client connection
    "globalPort": 3000,
    // Public port for Web Socket connections for a client connection
    "globalPortWS": 5000,
    // Seaport Ballancer host
    "seaportHost": null,
    // Seaport Ballancer Port
    "seaportPort": null,
    // Seaport Ballancer Node Name
    "seaportName": null,
    // GraphQL Web Interface (Recommend for development only)
    "graphiql": null,
    // GraphQL quota default limitation [Number]
    "quotaLimit": null,
    // Number of instances per program (0 = automatic) [Number]
    "cores": null,
    // Log to console with level: [debug, info, warn, error]
    "logConsole": {
      "lelel": "info"
    },
    // Log to Logstash by json with level: [debug, info, warn, error]
    "logLogstash": null,
    // "logLogstash": {
    //   "host": "elk",
    //   "port": 5801,
    //   "tags": ["production", "test"],
    //   "tries": 2,
    //   "interval": 100,
    //   "beat": "reiso_ex_full",
    //   "type": "reiso_ex_full",
    //   "level": "info"
    // },
    // Additional information for logging
    "logAdditional": {},
    // DDOS protection
    "ddos": null,
    // Allow via proxy connection
    "proxyProtection": null,
    // Elastic APM monitoring
    // "apm": {
    //   "serverUrl": "http://localhost:8200",
    //   "serviceName": "reiso_full_server",
    //   "secretToken": "qwerty",
    //   "instrument": true,
    //   "errorOnAbortedRequests": true,
    //   "captureBody": "all",
    //   "captureErrorLogStackTraces": "always",
    //   "active": true,
    //   "transactionSampleRate": 0.5,
    //   "filterHttpHeaders": false,
    //   "asyncHooks": true,
    //   "level": "debug"
    // },
    // ORM via typeorm
    "db": {
      "Main": {
        "database": "test",
        "host": "localhost",
        "password": "",
        "port": 3306,
        "type": "mysql",
        "username": "root"
      }
    },
    // Web Socket Redis cache server
    "redisPubSub": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    },
    // Handler Redis cache server
    "redisHandler": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": "",
        "scope": "cb_subscription"
      }
    },
    // Worker Redis cache server
    "redisWorker": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    },
    // Redis cache server
    "redis": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    }
  }
};
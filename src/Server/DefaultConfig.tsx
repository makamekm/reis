export default {
  default: {
    // You can provide your own properties here except Reiso internal ones and use them by getConfig()
    // ...
    // --- Reiso Properties ---
    // File translation path [string]
    "translation": "./translation.json",
    // Awalable languages [string[]]
    "languages": ["en"],
    // Default language [string]
    "defaultLanguage": "en",
    // Public directory [string]
    "publicDir": "./public",
    // Upload directory [string]
    "uploadDir": "./uploads",
    // Upload max file size in MB [number]
    "maxFileSize": 50,
    // Server Http port [number]
    "port": 3000,
    // Server Web Socket Port [number]
    "portWS": 5000,
    // Public host [string]
    "host": "127.0.0.1",
    // Public port for Http connections for a client connection [number]
    "globalPort": 3000,
    // Public port for Web Socket connections for a client connection [number]
    "globalPortWS": 5000,
    // Seaport Ballancer host [string]
    "seaportHost": null,
    // Seaport Ballancer Port [number]
    "seaportPort": null,
    // Seaport Ballancer Node Name [string]
    "seaportName": null,
    // GraphQL Web Interface (Recommend for development only) [boolean]
    "graphiql": null,
    // GraphQL quota default limitation [number]
    "quotaLimit": null,
    // Number of instances per program (0 = automatic) [number]
    "cores": null,
    // Log to console with level: [debug, info, warn, error] [console object]
    "logConsole": {
      "level": "info"
    },
    // Log to Logstash by json with level: [debug, info, warn, error] [logstash object]
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
    // Additional information for logging [object]
    "logAdditional": {},
    // DDOS protection [ddos object]
    "ddos": null,
    // Allow via proxy connection [boolean]
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
    // ORM via typeorm [scope -> typeorm object]
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
    // Web Socket Redis cache server [scope -> redis object]
    "redisPubSub": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    },
    // Handler Redis cache server [scope -> redis object]
    "redisHandler": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": "",
        "scope": "cb_subscription"
      }
    },
    // Worker Redis cache server [scope -> redis object]
    "redisWorker": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    },
    // Redis cache server [scope -> redis object]
    "redis": {
      "Main": {
        "port": 6379,
        "host": "127.0.0.1",
        "password": ""
      }
    }
  }
};
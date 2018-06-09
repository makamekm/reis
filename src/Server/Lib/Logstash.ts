import net = require('net');

import { LoggerI, LogType } from "./Logger";

export type LogstashI = { log: Function, connection: any };

export class Logstash {
    messageQueue: string[] = []
    logstashConnection: LogstashI
    logstashStatus: boolean = false
    logstashTries: number = 0
    logLogstashConfig

    constructor(config) {
        this.logLogstashConfig = config;
    }

    private logstashMessage(tags, fields, metadata, level, message) {
        return JSON.stringify({
            ...message,
            "@tags": tags,
            "@fields": fields,
            "@metadata": metadata,
            "level": level
        }) + "\n";
    }

    private async logstashBack(host, port, onClose): Promise<LogstashI> {
        return await new Promise<LogstashI>((r, e) => {
            const connection = net.createConnection({ host, port }, function () {
                r({
                    log: (message) => connection.write(message),
                    connection
                })
            })
            .on('error', function (err) {
                e(err);
            })
            .on('end', function () {
                onClose();
            });
        })
    }

    public async logstashSend() {
        if (this.messageQueue.length > 0 && !this.logstashStatus) {
            if (this.logstashTries > (this.logLogstashConfig.tries || 3)) {
                this.logstashTries = 0;
                this.messageQueue = this.messageQueue.slice(1);
            }
        }

        if (this.messageQueue.length > 0 && !this.logstashStatus) {
            this.logstashStatus = true;

            let message = this.messageQueue[0];

            if (!this.logstashConnection) {
                try {
                    this.logstashConnection = await this.logstashBack(this.logLogstashConfig.host, this.logLogstashConfig.port, () => {
                        this.logstashConnection = null;
                    });
                } catch (e) {
                    this.logstashConnection = null;
                    this.logstashTries++;
                    this.logstashStatus = false;
                    console.log('Fail connecting with Logstash', this.logLogstashConfig, message, e);
                    return true;
                }
            }

            let result: boolean;

            try {
                result = this.logstashConnection.log(message);
            } catch (e) {
                try {
                    await new Promise(r => this.logstashConnection.connection.close(r));
                } catch (e) { }
                this.logstashConnection = null;
                this.logstashTries++;
                this.logstashStatus = false;
                console.log('Fail sending a Logstash message', this.logLogstashConfig, message, e);
                return true;
            }

            if (result) {
                this.logstashTries = 0;
                this.messageQueue = this.messageQueue.slice(1);
            } else {
                this.logstashTries++;
                console.log('Cant send a Logstash message', this.logLogstashConfig, message);
            }

            this.logstashStatus = false;
        }

        return this.messageQueue.length > 0;
    }

    async log(tags: string[], fields: string[], metadata: string[], level: string, line: LogType) {
        let message = this.logstashMessage(tags, fields, metadata, level, line);
        this.messageQueue.push(message);
        if (this.messageQueue.length > 1000) {
            this.logstashTries = 0;
            this.messageQueue = this.messageQueue.slice(this.messageQueue.length - 1000);
        }
        await this.logstashSend();
    }
}
import { getConfig } from '../../Modules/Config';
import { Logstash } from "./Logstash";
import { LoggerI, LogType } from "./Logger";
import { distinct } from "./String";

const logLogstashConfig = getConfig().logLogstash;
const sender = require('os').hostname();

export class LogstashLogger implements LoggerI {
    logger: Logstash;
    timer: any

    constructor() {
        this.logger = new Logstash(logLogstashConfig);
        this.startTimer();
    }

    private startTimer() {
        this.timer = setInterval(() => this.logger.logstashSend(), logLogstashConfig && logLogstashConfig.interval || 300);
    }

    getLevel() {
        return logLogstashConfig && logLogstashConfig.level;
    }

    getTags(line: LogType) {
        let tags = [];
        if (logLogstashConfig.tags && Array.isArray(logLogstashConfig.tags)) {
            tags = logLogstashConfig.tags.concat(tags);
        } else if (logLogstashConfig.tags) {
            tags = logLogstashConfig.tags.split(',');
        }
        tags = logLogstashConfig.tags ? logLogstashConfig.tags.concat(tags) : tags;
        tags = (line.tags && Array.isArray(line.tags)) ? line.tags.concat(tags) : tags;
        tags = distinct(tags);
        return tags;
    }

    getMeta(line: LogType) {
        return {
            'beat': logLogstashConfig.beat || 'reiso',
            'type': logLogstashConfig.type || 'reiso',
            ...(typeof line['@metadata'] == 'object' ? (line['@metadata'] as any) : {})
        }
    }

    getFields(line: LogType) {
        return {
            'sender': logLogstashConfig.sender || sender,
            ...(typeof line['@fields'] == 'object' ? (line['@fields'] as any) : {})
        }
    }

    log(level: string, line: LogType) {
        const fields = this.getFields(line);
        const metadata = this.getMeta(line);
        const tags = this.getTags(line);
        this.logger.log(tags, fields, metadata, level, line);
    }
}
import { getConfig } from '../../Modules/Config';
import { Logstash } from "./Logstash";
import { LoggerI, LogType } from "./Logger";
import { distinct } from "./String";

const sender = require('os').hostname();

export class LogstashLogger implements LoggerI {
    private logger: Logstash;
    private timer: any

    constructor() {
        this.logger = new Logstash(getConfig().logLogstash);
        this.startTimer();
    }

    private startTimer() {
        this.timer = setInterval(() => this.logger.logstashSend(), getConfig().logLogstash && getConfig().logLogstash.interval || 300);
    }

    private getTags(line: LogType) {
        let tags = [];
        if (getConfig().logLogstash.tags && Array.isArray(getConfig().logLogstash.tags)) {
            tags = getConfig().logLogstash.tags.concat(tags);
        } else if (getConfig().logLogstash.tags) {
            tags = getConfig().logLogstash.tags.split(',');
        }
        tags = getConfig().logLogstash.tags ? getConfig().logLogstash.tags.concat(tags) : tags;
        tags = (line.tags && Array.isArray(line.tags)) ? line.tags.concat(tags) : tags;
        tags = distinct(tags);
        return tags;
    }

    private getMeta(line: LogType) {
        return {
            'beat': getConfig().logLogstash.beat || 'reiso',
            'type': getConfig().logLogstash.type || 'reiso',
            ...(typeof line['@metadata'] == 'object' ? (line['@metadata'] as any) : {})
        }
    }

    private getFields(line: LogType) {
        return {
            'sender': getConfig().logLogstash.sender || sender,
            ...(typeof line['@fields'] == 'object' ? (line['@fields'] as any) : {})
        }
    }

    getLevel() {
        return getConfig().logLogstash && getConfig().logLogstash.level;
    }

    async log(level: string, line: LogType) {
        const fields = this.getFields(line);
        const metadata = this.getMeta(line);
        const tags = this.getTags(line);
        await this.logger.log(tags, fields, metadata, level, line);
    }
}
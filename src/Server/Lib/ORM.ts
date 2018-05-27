import { getConfig } from '../../Modules/Config';
import { ORMManager } from '../ORMManager';
import { ORMLogger } from './ORMLogger';

export function initializeScope(scope: string = 'Main') {
    const config = JSON.parse(JSON.stringify(getConfig().db[scope]));
    config.autoSchemaSync = false;
    config.entities = ORMManager.getEntity();
    config.logging = "all";
    config.logger = new ORMLogger();
    return new ORMManager(config);
}
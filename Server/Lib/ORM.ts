import { getConfig } from '../../Modules/Config';
import { ORMManager, getEntity } from '../ORMManager';
import { ORMLogger } from './ORMLogger';

export function initializeScope(scope: string = 'default') {
    const config = JSON.parse(JSON.stringify(getConfig().db[scope]));
    config.autoSchemaSync = false;
    config.entities = getEntity(scope);
    config.logging = "all";
    config.logger = new ORMLogger();
    return new ORMManager(config);
}
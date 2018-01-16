export * from "typeorm";
import * as ORM from '../Server/ORM';
export { RegisterEntity } from '../Server/ORM';
export declare let Manager: ORM.Manager;
export declare const initialize: () => void;

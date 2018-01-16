export declare function setLogDir(p: any): void;
export declare function waitFile(p: any): Promise<void>;
export declare const fixError: (error: Error, type: string, additional?: any) => Promise<void>;
export declare const logConsole: (message: string) => Promise<void>;
export declare const fixClientError: (message: string, stack: string) => Promise<void>;

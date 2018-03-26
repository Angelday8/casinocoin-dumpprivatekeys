export interface LokiMeta {
    revision: number;
    created: number;
    version: number;
    updated: number;
}

export interface LokiKey {
    $loki?: number;
    meta?: LokiMeta;
    privateKey: string;
    publicKey: string;
    accountID: string;
    secret: string;
    encrypted: boolean;
}
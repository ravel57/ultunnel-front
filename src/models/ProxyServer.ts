import {ProxyProtocol} from './ProxyProtocol'

export class ProxyServer {
    id: number;
    name: string;
    host: string;
    proxies: ProxyProtocol[];
    login?: string | null;
    password?: string | null;
    useSubDomain?: boolean | null;
    subdomain?: string | null;
    port?: number | null;
    serverIp?: string | null;

    constructor(id: number, name: string, host: string, proxies: ProxyProtocol[]) {
        this.id = id;
        this.name = name;
        this.host = host;
        this.proxies = proxies;
    }
}
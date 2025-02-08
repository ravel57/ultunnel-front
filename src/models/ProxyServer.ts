import {ProxyProtocol} from './ProxyProtocol'

export class ProxyServer {
    id: number;
    name: string;
    host: string;
    proxies: ProxyProtocol[];

    constructor(id: number, name: string, host: string, proxies: ProxyProtocol[]) {
        this.id = id;
        this.name = name;
        this.host = host;
        this.proxies = proxies;
    }
}
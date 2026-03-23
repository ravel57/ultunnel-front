import {ProxyType} from "./ProxyType";

export class ProxyProtocol {
    id: number
    login: string
    password: string
    port: number
    proxyPort: number
    subdomain: string
    type: ProxyType
    useSubDomain: boolean
	serverIp: string


    constructor(id: number, login: string, password: string, port: number, proxyPort: number, subdomain: string, type: ProxyType, useSubDomain: boolean, serverIp: string) {
        this.id = id
        this.login = login
        this.password = password
        this.port = port
        this.proxyPort = proxyPort
        this.subdomain = subdomain
        this.type = type
        this.useSubDomain = useSubDomain
		this.serverIp = serverIp
    }
}
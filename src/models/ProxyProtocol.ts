import {ProxyType} from "./ProxyType";

export interface ProxyProtocol {
    id: number
    login: string
    password: string
    port: number
    proxyPort: number
    subdomain: string
    type: ProxyType
    useSubDomain: boolean
}
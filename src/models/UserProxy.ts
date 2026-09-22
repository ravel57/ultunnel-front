import {ProxyTypeValue} from "./ProxyTypeValue";

export interface UserProxySource {
	id?: number | string
	type?: string | ProxyTypeValue | null
}

export class UserProxy {
	id?: number
	type?: string | null
	tag?: string | null
	server?: string | null
	server_port?: number | null
	uuid?: string | null
	packet_encoding?: string | null
	url?: string | null
	proxy?: UserProxySource | null
}

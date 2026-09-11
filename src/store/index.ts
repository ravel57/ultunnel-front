import {defineStore} from "pinia";
import {User} from "../models/User";
import {ProxyServer} from "../models/ProxyServer";
import axios from "axios";
import {ProxyType} from "../models/ProxyType";
import {ProxyTypeValue} from "../models/ProxyTypeValue";
import {ProxyProtocol} from "../models/ProxyProtocol";

function normalizeProxyType(value: unknown): ProxyTypeValue | null {
    let normalizedType = "";

    if (typeof value === "string") {
        normalizedType = value.trim().toUpperCase();
    } else if (typeof value === "object" && value !== null && "name" in value) {
        const name = (value as {name?: unknown}).name;
        if (typeof name === "string") {
            normalizedType = name.trim().toUpperCase();
        }
    }

    return normalizedType ? ProxyType[normalizedType] ?? null : null;
}

export const useStore = defineStore("main", {
    state: () => ({
        users: [] as User[],
        servers: [] as ProxyServer[],
    }),

    getters: {},

    actions: {
        fetchData() {
            axios.get('/api/v1/get-all-users')
                .then(response => {
                    this.users = Array.isArray(response.data) ? response.data : [];
                    this.users.forEach((user: User) => {
                        user.createdDate = new Date(user.createdDate);
                        user.nextPaymentDate = new Date(user.nextPaymentDate);
                        user.proxiesConfigs = Array.isArray(user.proxiesConfigs)
                            ? user.proxiesConfigs
                            : [];
                    });
                })
                .catch(error => {
                    console.log(error);
                });

            axios.get('/api/v1/get-all-servers')
                .then(response => {
                    this.servers = Array.isArray(response.data)
                        ? response.data as ProxyServer[]
                        : [];

                    this.servers.forEach((server: ProxyServer) => {
                        const proxies = Array.isArray(server.proxies)
                            ? server.proxies
                            : [];

                        // Do not leave proxy.type as null: ProxyCard renders type.name/type.img.
                        server.proxies = proxies.reduce<ProxyProtocol[]>((result, proxy) => {
                            if (!proxy || typeof proxy !== "object") {
                                return result;
                            }

                            const type = normalizeProxyType(proxy.type);
                            if (!type) {
                                console.warn("Пропущен прокси с неизвестным type", proxy);
                                return result;
                            }

                            proxy.type = type;
                            result.push(proxy);
                            return result;
                        }, []);
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
});

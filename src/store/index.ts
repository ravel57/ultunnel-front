import {defineStore} from "pinia";
import {User} from "../models/User";
import {ProxyServer} from "../models/ProxyServer";
import axios from "axios";
import {ProxyType} from "../models/ProxyType";
import {ProxyTypeValue} from "../models/ProxyTypeValue";
import {ProxyProtocol} from "../models/ProxyProtocol";

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
                    this.users = response.data
                    this.users.forEach((user: User) => {
                        user.createdDate = new Date(user.createdDate)
                        user.nextPaymentDate = new Date(user.nextPaymentDate)
                    })
                })
                .catch(error => {
                    console.log(error)
                })
            axios.get('/api/v1/get-all-servers')
                .then(response => {
                    this.servers = response.data as ProxyServer[]
                    this.servers.forEach((el: ProxyServer) => {
                        el.proxies.forEach(proxy => {
                            const normalizedType = proxy.type.trim().toUpperCase();
                            proxy.type = (ProxyType as any)[normalizedType] || null;
                        })
                    })
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }
});

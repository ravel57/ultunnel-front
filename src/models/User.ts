import {UserProxy} from "./UserProxy";

export class User {
    id: number
    name: string
    isEnabled: boolean
    createdDate: Date
    nextPaymentDate: Date
    secretKey: string
    proxiesConfigs: UserProxy[]

    constructor(id: number, name: string, isEnabled: boolean, createdDate: Date, nextPaymentDate: Date, secretKey: string, proxiesConfigs: UserProxy[]) {
        this.id = id;
        this.name = name;
        this.isEnabled = isEnabled;
        this.createdDate = createdDate;
        this.nextPaymentDate = nextPaymentDate;
        this.secretKey = secretKey;
        this.proxiesConfigs = proxiesConfigs;
    }
}
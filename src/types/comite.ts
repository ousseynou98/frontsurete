import { Analyse } from "./Analyse";
import { Ip } from "./ip";
import { Rso } from "./rso";

export interface Comite {
    id?: string;
    name: string;
    status: string;
    rso: Rso;
    startDate: Date;
    endDate: Date;
    rsoId: string;
    ip: Ip;
    ipId: string;
    analyses?: Analyse[];
}

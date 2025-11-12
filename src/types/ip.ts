import { Site } from "./site";

export interface Ip {
    id?: string;
    name: string;
    type: string;
    siteId: string;
    site: Site;
    startDate: Date;
    refDate: Date;
    expiredDate: Date;
    latitude: number;
    longitude: number;
}

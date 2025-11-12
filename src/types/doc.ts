import { Analyse } from "./Analyse";

export interface Doc {
    id: string;
    titre: string;
    typeDoc: string;
    createAt: Date;
    statutDoc: string;
    statusDg: string;
    userId?: string;
    analyse?: Analyse[];
}
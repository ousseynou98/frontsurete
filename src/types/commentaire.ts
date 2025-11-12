import { Analyse } from "./Analyse";

export interface Commentaire {
    id: string;
    desc: string;
    createAt: Date;
    type: string;
    analyse?: Analyse[];
}
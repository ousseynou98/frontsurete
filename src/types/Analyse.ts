import { Comite } from "./comite";
import { Commentaire } from "./commentaire";
import { Doc } from "./doc";

export interface Analyse {
    id: string;
    titre: string;
    description: string;
    createAt: Date;
    status: string;
    statusDg: string;
    comite?: Comite;
    commentaires?: Commentaire[];
    docs?: Doc[];
}

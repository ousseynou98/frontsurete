import axios from '../axios.config';

export interface Participant {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  cni: string;
  urlCNI?: string;
  urlCasierJudiciaire?: string;
  infosCasier?: string;
  note?: number;
  statut: string;
  appreciation?: string;
  numeroDiplome?: string;
  urlDiplome?: string;
  urlAttestationParticipation?: string;
  qrCodeDiplome?: string;
  dateValidationDG?: string;
}

export interface RapportSupervision {
  id: string;
  observationsGenerales: string;
  conformiteContenu?: string;
  conformiteFormateur?: string;
  conformiteLieu?: string;
  recommandations?: string;
  apteExamen: boolean;
  dateRapport: string;
}

export interface Formation {
  id: string;
  type: string;
  nombreParticipants: number;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  status: string;
  centreFormation?: string;
  urlSujetExamen?: string;
  motifRejet?: string;
  dateValidationChefSurete?: string;
  dateDebutExamen?: string;
  dateFinExamen?: string;
  autorisationDemarrerExamen: boolean;
  urlCopiesExamen?: string;
  rsoFormateur?: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  chefSurete?: {
    id: string;
    firstname: string;
    lastname: string;
  };
  dg?: {
    id: string;
    firstname: string;
    lastname: string;
  };
  participants?: Participant[];
  rapportSupervision?: RapportSupervision;
}

export interface CreateFormationDto {
  type: string;
  nombreParticipants: number;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  centreFormation?: string;
  rsoFormateurId?: string; // Optionnel - récupéré automatiquement depuis le JWT
  participants?: Array<{
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;
    cni: string;
    urlCNI?: string;
    urlCasierJudiciaire?: string;
    infosCasier?: string;
  }>;
}

export interface ValiderFormationDto {
  valide: boolean;
  motifRejet?: string;
  urlSujetExamen?: string;
}

export interface CreateRapportDto {
  observationsGenerales: string;
  conformiteContenu?: string;
  conformiteFormateur?: string;
  conformiteLieu?: string;
  recommandations?: string;
  apteExamen: boolean;
}

export interface SaisirNotesDto {
  notes: Array<{
    participantId: string;
    note: number;
    statut: string;
    appreciation?: string;
  }>;
}

class FormationService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/formations`;

  async getAll(params?: { rsoId?: string; responsableId?: string }): Promise<Formation[]> {
    const queryParams = new URLSearchParams();
    if (params?.rsoId) queryParams.append('rsoId', params.rsoId);
    if (params?.responsableId) queryParams.append('responsableId', params.responsableId);
    
    const url = queryParams.toString() ? `${this.baseURL}?${queryParams}` : this.baseURL;
    const response = await axios.get(url);
    return response.data;
  }

  async getOne(id: string): Promise<Formation> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateFormationDto): Promise<Formation> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateFormationDto>): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Workflow métier
  async valider(id: string, data: ValiderFormationDto): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}/valider`, data);
    return response.data;
  }

  async soumettreRapport(id: string, data: CreateRapportDto): Promise<Formation> {
    const response = await axios.post(`${this.baseURL}/${id}/rapport-supervision`, data);
    return response.data;
  }

  async demarrerExamen(id: string): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}/demarrer-examen`);
    return response.data;
  }

  async terminerExamen(id: string): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}/terminer-examen`);
    return response.data;
  }

  async saisirNotes(id: string, data: SaisirNotesDto): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}/saisir-notes`, data);
    return response.data;
  }

  async validerDiplomes(id: string, dgId: string): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}/valider-diplomes`, { dgId });
    return response.data;
  }

  async telechargerCopies(id: string, urlCopies: string): Promise<Formation> {
    const response = await axios.patch(`${this.baseURL}/${id}/telecharger-copies`, { urlCopies });
    return response.data;
  }
}

export default new FormationService();


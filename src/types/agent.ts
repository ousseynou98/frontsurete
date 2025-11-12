// ==============================|| TYPES - AGENT  ||============================== //



export interface AgentProps {
  modal: boolean;
}

export interface AgentList {
  id: any;
  firstname: string;
  lastname: string;
  mat: string;
  phone: string;
  contact: string;
  agence:any;
  active: boolean;
  countryCode:string;
  agenceId: string;
}
export interface AgentFormData {
  firstname: string;
  lastname: string;
  mat: string;
  contact: string;
  countryCode: string;
  active: boolean;
  agenceId: string;
};

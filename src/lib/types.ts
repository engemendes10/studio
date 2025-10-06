export interface UserData {
  nomeCompleto: string;
  rg: string;
  cpf: string;
  matricula: string;
  cargo: string;
  celular: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
}

export const defaultUserData: UserData = {
  nomeCompleto: '',
  rg: '',
  cpf: '',
  matricula: '',
  cargo: '',
  celular: '',
  email: '',
  endereco: '',
  cidade: '',
  estado: '',
};

export interface Activity {
  name: string;
  points: number;
}

export interface InspectionActivity {
  activityName: string;
  quantity: number;
}

export interface Inspection {
  id: string; 
  date: string; // YYYY-MM-DD
  processNumber: string;
  activities: InspectionActivity[];
}

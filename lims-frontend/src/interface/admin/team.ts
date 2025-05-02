export interface ITeam {
  id?: string;
  name: string;
  position: string;
  content: string;
  photo: File | null;
  uuid?: string;
}

export interface IUpdateTeam {
  data: ITeam;
  id: string;
}

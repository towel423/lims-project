export interface IPerson {
  id?: string;
  title: string;
  subtitle: string;
  link: string;
  image_url: File | null;
  active: boolean;
  uuid?: string;
}

export interface IUpdatePerson {
  data: IPerson;
  id: string;
}

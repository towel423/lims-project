export interface IPages {
  id?: string;
  title: string;
  subtitle: string;
  link: string;
  image_url: File | null;
  active: boolean;
  uuid?: string;
}

export interface IUpdatePages {
  data: IPages;
  id: string;
}

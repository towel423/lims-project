export interface IMenus {
  id?: string;
  title: string;
  subtitle: string;
  link: string;
  image_url: File | null;
  active: boolean;
  uuid?: string;
}

export interface IUpdateMenus {
  data: IMenus;
  id: string;
}

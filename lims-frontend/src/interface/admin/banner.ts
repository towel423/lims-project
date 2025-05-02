export interface IBanner {
  id?: string;
  title: string;
  subtitle: string;
  link: string;
  image_url: File | null | any;
  active: boolean;
  uuid?: string;
}

export interface IUpdateBanner {
  data: IBanner;
  id: string;
}

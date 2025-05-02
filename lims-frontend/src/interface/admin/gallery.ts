export interface IGallery {
  id?: string;
  year: string;
  category: string;
  image_url: File | null;
  uuid?: string;
}

export interface IUpdateGallery {
  data: IGallery;
  id: string;
}

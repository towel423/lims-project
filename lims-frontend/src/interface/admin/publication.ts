interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface IPublication {
  id?: number;
  title: string;
  slug?: string;
  description: string;
  img: string | File | null; // Mengizinkan tipe File atau null
  position?: string;
  category_id?: number;
  caption: string;
  uuid?: string;
  like?: number;
  view?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  category?: Category; // Relationship to the Category
}

export interface IUpdatePublication {
  data: IPublication;
  id: string;
}

export interface IPublicationCategory extends Category {}

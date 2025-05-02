interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface IEvent {
  id?: number;
  title: string;
  slug?: string;
  description: string;
  image_url: string | File | null; // Mengizinkan tipe File atau null
  position?: string;
  category_id?: number;
  content: string;
  uuid?: string;
  like?: number;
  view?: number;
  start_date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
  category?: Category; // Relationship to the Category
}

export interface IUpdateEvent {
  data: IEvent;
  id: string;
}

export interface IEventCategory extends Category {}

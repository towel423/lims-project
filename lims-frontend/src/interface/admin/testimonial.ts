export interface ITestimonial {
  id?: string;
  name: string;
  content: string;
  image_url: File | null;
  uuid?: string;
}

export interface IUpdateTestimonial {
  data: ITestimonial;
  id: string;
}

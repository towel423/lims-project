export interface ISettings {
  id?: string;
  key: string;
  value: string;
  uuid?: string;
}

export interface IUpdateSettings {
  data: ISettings;
  id: string;
  uuid?: string;
}

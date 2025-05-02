export interface IProfileDTO {
  fullname: string;
  email: string;
  mobile: string;
  password?: string;
}

export interface IProfileChangePassword {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

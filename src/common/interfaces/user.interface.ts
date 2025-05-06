export interface UserInterface {
  id: number;
  username: string;
  role: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  photo_profile?: string;
  address?: string;
  photo?: string;
  iat: number;
  exp: number;
}

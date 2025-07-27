export interface LoginUserDto {
    email: string;
    password: string;
  }
  
export interface RegisterUserDto {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
}
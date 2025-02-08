import { ApiResponse } from "../models/api-response.model";
import { Login, LoginResonse } from "../models/login.model";

export const mockLogin: Login = {
    documento: '12345',
    password: 'password',
};

export const mockResponseLogin: ApiResponse<LoginResonse> = {
    code: 200,
    message: 'Inicio de sesión exitoso',
    data: {
        token: 'testToken',
        nombre: 'Test User'
    }
}
// Определяем тип данных, которые мы отправляем для регистрации
export interface RegisterData {
  email: string;
  password: string;
}

// Определяем тип данных для входа
export interface LoginData {
  email: string;
  password: string;
}
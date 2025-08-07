import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isHydrated: boolean; // <-- НОВЫЙ ФЛАГ
  setToken: (token: string) => void;
  logout: () => void;
  _setIsHydrated: (isHydrated: boolean) => void; // <-- НОВАЯ СЛУЖЕБНАЯ ФУНКЦИЯ
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      isHydrated: false, // Начальное состояние - не загружено
      setToken: (token: string) => set({ token }),
      logout: () => set({ token: null }),
      _setIsHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: 'auth-storage',
      // Эта функция будет вызвана после того, как состояние будет загружено из localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setIsHydrated(true);
        }
      },
    }
  )
);

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import axios from 'axios'; // или fetch, если используешь его
//
// interface AuthState {
//   token: string | null;
//   isHydrated: boolean;
//   setToken: (token: string) => void;
//   logout: () => void;
//   login: (email: string, password: string) => Promise<void>; // ← ДОБАВИЛИ
//   _setIsHydrated: (isHydrated: boolean) => void;
// }
//
// export const useAuthStore = create(
//   persist<AuthState>(
//     (set) => ({
//       token: null,
//       isHydrated: false,
//       setToken: (token: string) => set({ token }),
//       logout: () => set({ token: null }),
//       login: async (email, password) => {
//         const response = await axios.post('/api/v1/auth/login', {
//           email,
//           password,
//         });
//         const token = response.data.token;
//         set({ token });
//       },
//       _setIsHydrated: (isHydrated: boolean) => set({ isHydrated }),
//     }),
//     {
//       name: 'auth-storage',
//       onRehydrateStorage: () => (state) => {
//         if (state) {
//           state._setIsHydrated(true);
//         }
//       },
//     }
//   )
// );
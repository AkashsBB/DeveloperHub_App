import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  isCheckingAuthLocked: boolean;
  signup: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: false,
  isCheckingAuthLocked: false,

  signup: async ({ name, email, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      throw new Error("Passwords do not match");
    }

    set({ loading: true });
    try {
      const res = await axios.post("api/auth/signup", { name, email, password }, { withCredentials: true });
      const userData = res.data;
      if (!userData?.id) throw new Error("Invalid user data");

      set({ user: userData, loading: false });
      toast.success("Signup successful");
    } catch (error) {
      set({ loading: false });
      const message = error instanceof AxiosError
        ? error.response?.data?.message || "Signup failed"
        : "An error occurred";
      toast.error(message);
      throw new Error(message);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("api/auth/login", { email, password }, { withCredentials: true });
      const userData = res.data.data; // Backend wraps user in 'data'
      if (!userData?.id) throw new Error("Invalid user data");

      set({ user: userData, loading: false });
      toast.success("Login successful");
      await get().checkAuth(); // Verify cookie  
    } catch (error) {
      set({ loading: false });
      const message = error instanceof AxiosError
        ? error.response?.data?.message || "Login failed"
        : "An error occurred";
      console.error('Login error:', error);
      toast.error(message);
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await axios.post("api/auth/logout", {}, { withCredentials: true });
      set({ user: null, loading: false, checkingAuth: false });
      sessionStorage.clear();
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      set({ user: null, loading: false, checkingAuth: false });
      sessionStorage.clear();
      const message = error instanceof AxiosError
        ? error.response?.data?.message || "Logout failed"
        : "An error occurred";
      toast.error(message);
      return false;
    }
  },

  checkAuth: async () => {
    const { isCheckingAuthLocked, checkingAuth } = get();
    if (isCheckingAuthLocked || checkingAuth) return null;

    set({ checkingAuth: true, isCheckingAuthLocked: true });
    try {
      const res = await axios.get("api/auth/check-auth", { withCredentials: true });
      const userData = res.data.data; // Backend wraps user in 'data'
      set({ user: userData?.id ? userData : null, checkingAuth: false, isCheckingAuthLocked: false });
      return userData?.id ? userData : null;
    } catch (error) {
      set({ user: null, checkingAuth: false, isCheckingAuthLocked: false });
      return null;
    }
  },
}));
import { useState, useEffect } from "react";
import { toast } from "sonner";

import type { User } from "@type/User";
import { login } from "@services/auth.service";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [authLoading, setAuthLoading] = useState(true); // esto es para manejar la carga antes de login

  // Restaurar sesion
  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (saved && token) {
      setCurrentUser(JSON.parse(saved));
      setIsLoggedIn(true);
    }

    setAuthLoading(false);
  }, []);

  // Login
  const handleLogin = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    try {
      const response = await login({ email, password });

      localStorage.setItem("token", response.token);

      const mappedUser: User = {
        email: response.email,
        name: response.name,
        role: response.role.toLowerCase() as User["role"],
      };

      localStorage.setItem("currentUser", JSON.stringify(mappedUser));

      setCurrentUser(mappedUser);
      setIsLoggedIn(true);

      return mappedUser;
    } catch {
      toast.error("Credenciales incorrectas");
      return null;
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    currentUser,
    authLoading,
    handleLogin,
    handleLogout,
  };
}

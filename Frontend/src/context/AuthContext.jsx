// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login generico
  async function login(email, password) {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    const newToken = data.token;

    const newUser = {
      email: data.email,
      role: data.role,
      doctorId: data.doctorId,
      patientId: data.patientId,
    };

    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    return newUser;
  }

  // Self-registration paziente + auto-login
  async function registerPatient(payload) {
    const data = await api("/api/auth/register/patient", {
      method: "POST",
      body: payload,
      auth: false,
    });

    const newToken = data.token;

    const newUser = {
      email: data.email,
      role: data.role,
      doctorId: data.doctorId,
      patientId: data.patientId,
    };

    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    return newUser;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const value = {
    user,
    token,
    login,
    logout,
    registerPatient,
    isAdmin: user?.role === "ADMIN",
    isDoctor: user?.role === "DOCTOR",
    isPatient: user?.role === "PATIENT",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

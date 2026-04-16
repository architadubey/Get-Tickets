import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load session on mount
  useEffect(() => {
    const stored = localStorage.getItem('gettickets_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch { localStorage.removeItem('gettickets_user'); }
    }
  }, []);

  const signup = async (data) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.error || 'Something went wrong during registration.' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Server unreachable. Please try again later.' };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, message: json.error || 'Incorrect email or password.' };
      }
      
      const sessionUser = {
        id: json.id,
        name: json.name,
        email: json.email,
        phone: json.phone,
        city: json.city,
        interests: json.interests,
      };
      localStorage.setItem('gettickets_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsAuthenticated(true);
      return { success: true, user: sessionUser };
    } catch (err) {
      return { success: false, message: 'Server unreachable. Please try again later.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('gettickets_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

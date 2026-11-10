import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medicare_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getMe()
        .then(data => {
          if (data.success) {
            setUser({
              ...data.user,
              profile: data.profile,
              patient_id: data.profile?.id && data.user.role === 'patient' ? data.profile.id : data.user.patient_id,
              doctor_id: data.profile?.id && data.user.role === 'doctor' ? data.profile.id : data.user.doctor_id,
              receptionist_id: data.profile?.id && data.user.role === 'receptionist' ? data.profile.id : data.user.receptionist_id
            });
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const loginUser = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('medicare_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const registerPatientUser = async (patientData) => {
    const res = await api.registerPatient(patientData);
    if (res.success && res.token) {
      localStorage.setItem('medicare_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('medicare_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, registerPatientUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const MOCK_USERS = {
  '0000001': { id: '0000001', full_name: 'Electoral Commissioner', index_number: '0000001', role: 'commissioner' },
  '1000001': { id: '1000001', full_name: 'Ama Asante', index_number: '1000001', role: 'voter' },
  '1000002': { id: '1000002', full_name: 'Kwame Mensah', index_number: '1000002', role: 'voter' },
  '1000003': { id: '1000003', full_name: 'Akua Boateng', index_number: '1000003', role: 'voter' },
  '1000004': { id: '1000004', full_name: 'Kofi Amoah', index_number: '1000004', role: 'voter' },
  '1000005': { id: '1000005', full_name: 'Abena Osei', index_number: '1000005', role: 'voter' },
  '1234567': { id: '1234567', full_name: 'Test Voter', index_number: '1234567', role: 'voter' },
};

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read mock_index from localStorage (set on successful OTP)
    const idx = localStorage.getItem('mock_index');
    if (idx && MOCK_USERS[idx]) {
      setStudent(MOCK_USERS[idx]);
    } else {
      setStudent(null);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem('mock_index');
    setStudent(null);
    window.location.href = '/login';
  };

  const isVoter = () => ['voter', 'commissioner', 'admin'].includes(student?.role);
  const isCommissioner = () => ['commissioner', 'admin'].includes(student?.role);
  const isAdmin = () => student?.role === 'admin';

  return (
    <AuthContext.Provider value={{ student, signOut, isVoter, isCommissioner, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

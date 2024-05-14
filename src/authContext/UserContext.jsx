import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || null);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail);
    } else {
      localStorage.removeItem('userEmail');
    }
  }, [userEmail]);

  const login = (email) => {
    setUserEmail(email);
  };

  const logout = () => {
    setUserEmail(null);
  };

  return (
    <UserContext.Provider value={{ userEmail, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
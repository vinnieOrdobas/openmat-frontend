import { useContext } from 'react';
// We import the 'AuthContext' we just created in the other file
import { AuthContext } from './AuthContext.jsx'; 

// This is our "custom hook"
// It's just a shortcut for accessing the AuthContext
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error is a safety net. It will tell us later if we
    // forget to wrap our app in the <AuthProvider>
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
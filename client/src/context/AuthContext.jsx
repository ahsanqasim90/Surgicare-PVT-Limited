import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import api from '../services/api';

const AuthContext=createContext(null);

export function AuthProvider({children}){
  const [user,setUser]=useState(null);
  const [checking,setChecking]=useState(Boolean(sessionStorage.getItem('surgicare_admin_token')));
  const logout=()=>{sessionStorage.removeItem('surgicare_admin_token');setUser(null)};
  useEffect(()=>{
    const onUnauthorised=()=>logout();
    window.addEventListener('surgicare:unauthorised',onUnauthorised);
    if(checking)api.get('/auth/me').then(data=>setUser(data.user)).catch(()=>logout()).finally(()=>setChecking(false));
    return()=>window.removeEventListener('surgicare:unauthorised',onUnauthorised);
  },[]);
  const login=async credentials=>{const data=await api.post('/auth/login',credentials);sessionStorage.setItem('surgicare_admin_token',data.token);setUser(data.user);return data.user};
  const value=useMemo(()=>({user,checking,login,logout}),[user,checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(){return useContext(AuthContext)}

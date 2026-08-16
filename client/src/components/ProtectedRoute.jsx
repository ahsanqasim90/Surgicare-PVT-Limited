import {Navigate,useLocation} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function ProtectedRoute({children}){
  const {user,checking}=useAuth();
  const location=useLocation();
  if(checking)return <div className="route-loader" role="status"><span/>Checking secure access...</div>;
  if(!user)return <Navigate to="/staff-login" replace state={{from:location}}/>;
  return children;
}

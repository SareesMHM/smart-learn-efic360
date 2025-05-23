import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser'; // Adjust path
import Loader from './Loader';

const ProtectedRoute = ({ children, isAdmin, isTeacher, isParent}) => {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) return <Loader />;

  if (isError || !user) {
    return <Navigate to="/login" />;
  }

  if (!user.isvalidEmail) {
    return <Navigate to="/SendVerification" />;
  }

  if (isAdmin && user.role !== 'Admin') {
    return <Navigate to="/AdminDashboard" />;
  }

  if (isTeacher && user.role !== 'Teacher') {
    return <Navigate to="/TeacherDashboard" />;
  }
   if (isParent && user.role !== 'Parent') {
    return <Navigate to="/TeacherDashboard" />;
  }

  return children;
};

export default ProtectedRoute;

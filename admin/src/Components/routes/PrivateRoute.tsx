import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../features/auth/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/hooks";

interface DecodedToken {
  type: string;
  exp: number;
  [key: string]: any;
}


const PrivateRoute = () => {
  const { adminToken } = useAuth();

  const dispatch = useDispatch<AppDispatch>();

  if (!adminToken) return <Navigate to="/signin" />;

  try {
    const decoded: DecodedToken = jwtDecode(adminToken);

    // Optionally, check adminToken expiry
    if (decoded.exp * 1000 < Date.now()) {
      // ✅ Update Redux state
      dispatch(logout());
      console.log("i am here , logout");
      return <Navigate to="/signin" />;
    }

    if (decoded?.type !== "admin" && decoded?.type !== "agent") {
      return <Navigate to="/signin" />;
    }

    return <Outlet />;
  } catch (error) {
    return <Navigate to="/signin" />;
  }
};

export default PrivateRoute;

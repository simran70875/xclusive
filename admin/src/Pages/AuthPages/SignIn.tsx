import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../hooks/useAuth";

export default function SignIn() {
  interface DecodedToken {
    type: string;
    [key: string]: any;
  }

  const navigate = useNavigate();
  const { adminToken } = useAuth();

  useEffect(() => {
    if (adminToken) {
      try {
        const decoded: DecodedToken = jwtDecode(adminToken);
        if (decoded?.type === "admin" || decoded?.type === "agent") {
          navigate("/");
        }
      } catch (err) {
        console.error("JWT decode failed", err);
      }
    }
  }, [adminToken, navigate]);

  // ⛔ Prevent rendering the login page while redirecting
  if (adminToken) return null;


  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}

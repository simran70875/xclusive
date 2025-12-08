import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API_PATHS } from "../utils/config";
import { loginSuccess } from "../features/auth/authSlice";
import type { AppDispatch } from "../app/hooks";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react"; // EyeOff instead of EyeClosed
import OrangeOutlineButton from "../components/Button/OrangeOutlineButton";
import toast from "react-hot-toast";
import { useAxios } from "../hooks/useAxios";
import images from "../components/imagesPath";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  interface UserResponseType {
    token: string;
    user: any;
  }

  const {
    data,
    error,
    loading,
    refetch: login,
  } = useAxios<UserResponseType>({
    method: "post",
    url: API_PATHS.LOGIN,
    body: {
      userIdOrEmail: userId, password, type: "user"
    },
    manual: true,
    successMessage: "Logged in successfully!",
    errorMessage: "", // let backend message be shown
  });

  const handleLogin = async () => {

    if (!userId || !password) {
      toast.error("Please enter both User ID and Password");
      return;
    }

    login();
  };

  useEffect(() => {
    if (data) {
      const { token, user } = data;
      const userId = user.userId;
      dispatch(loginSuccess({ user, token, userId }));
      navigate("/profile");
    }
  }, [data]);

  useEffect(() => {
    if (error?.message) {
      toast.error(error.message);
    }
  }, [error]);


  return (

    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  Sign In
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your User ID and password to sign in!
                </p>
              </div>
              <div>
                <form>
                  <div className="space-y-6">
                    <div>

                      <label htmlFor={"userId"} className="block text-sm font-medium text-gray-200 mb-2">
                        User ID <span className="text-red-500">*</span>
                      </label>
                      <div className="relative border-b border-gray-300 focus-within:border-yellow-500">
                        <input
                          id={"userId"}
                          type="text"
                          name={"userId"}
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          className="w-full bg-white focus:outline-none p-2 pr-10 text-gray-700"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor={"password"} className="block text-sm font-medium text-gray-200 mb-2"> Password <span className="text-red-500">*</span></label>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-white focus:outline-none p-2 pr-10 text-gray-700"
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <Eye />
                          ) : (
                            <EyeOff />
                          )}
                        </span>
                      </div>
                    </div>



                    <div>
                      <OrangeOutlineButton label={loading ? "Signing in..." : "Sign in"} onClick={() => handleLogin()} className="w-full" disabled={loading} />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            {/* <GridShape /> */}
            <div className="flex flex-col items-center max-w-xs">
              <div className="block mb-4">
                <img
                  width={231}
                  height={48}
                  src={images.logo}
                  alt="Logo"
                  className="mb-5"
                />
                <span className="text-white dark:text-white/90 font-bold text-3xl select-none">
                  XCLUSIVEDIAMONDS<span className="text-yellow-500">.</span>
                </span>
              </div>
              <p className="text-center text-gray-400 dark:text-white/60">
                Welcome to Xclusive Diamond, where safeguarding your work environment is our utmost priority.
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          {/* <ThemeTogglerTwo /> */}
        </div>
      </div>
    </div>

  );
}

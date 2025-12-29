import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

let url = process.env.REACT_APP_API_URL;

const LoginPage = () => {
  const adminToken = localStorage.getItem("token");
  const Navigate = useNavigate();

  const [settingsData, setSettingsData] = useState({});
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function getSettings() {
      try {
        const res = await axios.get(`${url}/app/settings/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setSettingsData(res?.data?.Settings);
      } catch (error) {
        console.log(error);
      }
    }
    getSettings();
  }, [settingsData, adminToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (role === "admin") {
        try {
          const response = await axios.post(
            `${url}/admin/login`,
            { username, password },
            {
              headers: {
                Authorization: `${adminToken}`,
              },
            }
          );

          if (response.data.type === "success") {
            localStorage.setItem("token", response.data.token);
            Navigate("/");
          } else if (response.data.type === "error") {
            setError(response?.data?.message);
            closeError();
          }
        } catch (error) {
          setError("*server error!");
          closeError();
        }
      } else if (role === "subAdmin") {
        try {
          const response = await axios.post(
            `${url}/subAdmin/login`,
            { username, password },
            {
              headers: {
                Authorization: `${adminToken}`,
              },
            }
          );

          if (response.data.type === "success") {
            localStorage.setItem("token", response.data.token);
            Navigate("/");
          } else if (response.data.type === "error") {
            setError(response?.data?.message);
            closeError();
          }
        } catch (error) {
          setError("*server error!");
          closeError();
        }
      }
    } catch (error) {}
  };

  function closeError() {
    setTimeout(() => {
      setError("");
    }, 1500);
  }

  return (
    <>
      <div className="authentication-bg">
        <div className="account-pages pt-sm-4">
          <div className="container">
            <div className="row align-items-center justify-content-center">
              <div className="col-md-8 col-lg-6 col-xl-5">
                <div className="card">
                  <a className=" d-block auth-logo">
                    <img
                      src={settingsData?.app_logo}
                      alt=""
                      height={80}
                      className="logo logo-dark"
                    />
                    <img
                      src={settingsData?.app_logo}
                      alt=""
                      height="22"
                      className="logo logo-light"
                    />
                  </a>
                  <div className="card-body p-4">
                    <div className="text-center mt-2">
                      <h5 className="text-primary">Welcome Back !</h5>
                      <p className="text-muted">
                        Sign in to continue to Xclusive Diamond.
                      </p>
                    </div>
                    <div className="p-2 mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="username">
                            Role
                          </label>
                          <select
                            className="form-select"
                            onChange={(e) => setRole(e.target.value)}
                          >
                            <option value="admin">Admin</option>
                            <option value="subAdmin">Sub Admin</option>
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label" htmlFor="username">
                            Username
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            onChange={(e) => setUsername(e.target.value)}
                            id="username"
                            placeholder="Enter username"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label" htmlFor="userpassword">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            onChange={(e) => setPassword(e.target.value)}
                            id="userpassword"
                            placeholder="Enter password"
                          />
                          <div style={{ color: "red", fontSize: "13px" }}>
                            {error}
                          </div>
                        </div>

                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="auth-remember-check"
                          />
                          <label
                            className="form-check-label"
                            htmlFor="auth-remember-check"
                          >
                            Remember me
                          </label>
                        </div>

                        <div className="mt-3 text-end">
                          <button
                            className="btn btn-primary w-sm waves-effect waves-light"
                            type="submit"
                          >
                            Log In
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

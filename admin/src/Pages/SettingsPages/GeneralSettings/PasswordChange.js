import axios from "axios";
import { useEffect, useState } from "react";
import AlertBox from "../../../Components/AlertComp/AlertBox";
let url = process.env.REACT_APP_API_URL;

const PasswordChange = () => {
  const [settingsAddStatus, setSettingsAddStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const adminToken = localStorage.getItem("token");

  const [old_password, setOldPassword] = useState({});
  const [password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${url}/app/settings/passwordChange`,
        { old_password, password, confirm_password },
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );

      console.log(response);
      if (response.data.type === "success") {
        let alertBox = document.getElementById("alert-box");
        alertBox.classList.add("alert-wrapper");
        setSettingsAddStatus("success");
        setStatusMessage(response?.data?.message);
      } else if (response.data.type === "error") {
        setSettingsAddStatus("error");
        let alertBox = document.getElementById("alert-box");
        alertBox.classList.add("alert-wrapper");
        setStatusMessage(response?.data?.message);
      }
    } catch (error) {
      setSettingsAddStatus("error");
      setStatusMessage("Failed to update password");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettingsAddStatus("");
      setStatusMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [settingsAddStatus, statusMessage]);

  return (
    <>
      <form onSubmit={handlePasswordSubmit}>
        <div className="mb-3 row">
          <label
            htmlFor="example-text-input"
            className="col-md-2 col-form-label"
          >
            Old Password :
          </label>
          <div className="col-md-10">
            <input
              required
              type="password"
              className="form-control"
              id="userpassword"
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter old password"
            />
          </div>
        </div>
        <div className="mb-3 row">
          <label
            htmlFor="example-text-input"
            className="col-md-2 col-form-label"
          >
            New Password :
          </label>
          <div className="col-md-10">
            <input
              required
              type="password"
              className="form-control"
              id="userpassword1"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
        </div>
        <div className="mb-3 row">
          <label
            htmlFor="example-text-input"
            className="col-md-2 col-form-label"
          >
            Confirm Password :
          </label>
          <div className="col-md-10">
            <input
              required
              type="password"
              className="form-control"
              id="userpassword2"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter confirm password"
            />
          </div>
        </div>
        <div className="mt-3 text-end">
          <button
            className="btn btn-primary w-sm waves-effect waves-light"
            style={{ marginLeft: "5px" }}
            type="submit"
          >
            {" "}
            <i className="fas fa-save"></i> Save
          </button>
        </div>
      </form>

      <AlertBox status={settingsAddStatus} statusMessage={statusMessage} />
    </>
  );
};

export default PasswordChange;

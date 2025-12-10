import React, { useEffect, useState } from "react";
import axios from "axios";
import AlertBox from "../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL;

const AddMarquee = () => {
  const adminToken = localStorage.getItem("token");
  const [text, setText] = useState("");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function getExistingMarquee() {
      try {
        const response = await axios.get(`${url}/getMarquee`);
        console.log("response from getMarquee ", response.data);

        setText(response.data.marquee.text);
        setId(response.data.marquee._id);
      } catch (error) {
        setStatus("error");
      }
    }

    getExistingMarquee();
  }, [adminToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("text ==>", text, id);
    try {
      let response;
      if (text === "") {
        response = await axios.post(
          `${url}/addMarquee`,
          { text: text },
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
      } else {
        response = await axios.put(
          `${url}/update/Marquee/${id}`,
          { text: text },
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          }
        );
      }
      let alertBox = document.getElementById("alert-box");
      alertBox.classList.add("alert-wrapper");
      setStatus(response.data.type);
      setStatusMessage(response.data.message);
      console.log("add marquee response ==> ", response);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusMessage("Marquee not added!");
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      let alertBox = document.getElementById("alert-box");
      alertBox.classList.remove("alert-wrapper");
      setStatus("");
      setStatusMessage("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [status, statusMessage]);

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <div className="col-3 table-heading">Add Marquee Text</div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3 row">
                        <div className="mb-3 row">
                          <label
                            htmlFor="example-text-input"
                            className="col-md-2 col-form-label"
                          >
                            Add Text :
                          </label>
                          <div className="col-md-12">
                            <input
                              required
                              className="form-control"
                              type="text"
                              id="marqueeText"
                              value={text}
                              onChange={(e) => {
                                setText(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mb-10">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <button
                              className="btn btn-danger"
                              onClick={() => setText("")}
                            >
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </button>
                            <button className="btn btn-success" type="submit">
                              <i className="fas fa-save"></i> Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AlertBox status={status} statusMessage={statusMessage} />
    </>
  );
};

export default AddMarquee;

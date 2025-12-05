import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import AlertBox from "../../../Components/AlertComp/AlertBox";
let url = process.env.REACT_APP_API_URL;

const MemberShipSettings = () => {
  const adminToken = localStorage.getItem("token");
  const Navigate = useNavigate();
  const [existingMemberShip, setExistingMemberShip] = useState([]);
  const [selectedMemberShip, setSelectedMemberShip] = useState("1"); // Default to Gold Membership
  const [memberShipName, setMemberShipName] = useState("");
  const [sortDesc, setSortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [memberShipPrice, setMemberShipPrice] = useState(0);

  useEffect(() => {
    async function getExistingMemberShip() {
      try {
        const response = await axios.get(`${url}/memberShip/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setExistingMemberShip(response?.data?.memberShip || []);
      } catch (error) {
        console.error(error);
      }
    }
    getExistingMemberShip();
  }, [adminToken]);

  useEffect(() => {
    const selectedMembershipValue = existingMemberShip?.find(
      (membership) => membership.Type === selectedMemberShip
    );
    if (selectedMembershipValue) {
      setSortDesc(selectedMembershipValue?.Sort_Desc);
      setLongDesc(selectedMembershipValue?.Long_Desc);
      setMemberShipPrice(selectedMembershipValue?.MemberShip_Price);
      setMemberShipName(selectedMembershipValue?.MemberShip_Name);
    }
  }, [existingMemberShip, selectedMemberShip]);

  const [memberShipAddStatus, setMemberShipAddStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const memberShip = {
      name: memberShipName,
      price: memberShipPrice,
      sortDesc: sortDesc,
      longDesc: longDesc,
      type: selectedMemberShip,
    };
    let memberShipId;
    if (selectedMemberShip === "1") {
      memberShipId = existingMemberShip?.[0]?._id;
    } else if (selectedMemberShip === "2") {
      memberShipId = existingMemberShip?.[1]?._id;
    } else if (selectedMemberShip === "3") {
      memberShipId = existingMemberShip?.[2]?._id;
    }

    try {
      const response = await axios.patch(
        `${url}/memberShip/update/${memberShipId}`,
        memberShip,
        {
          headers: {
            Authorization: `${adminToken}`,
          },
        }
      );
      if (response.data.type === "success") {
        setMemberShipAddStatus(response.data.type);
        setStatusMessage(response.data.message);
        setTimeout(() => {
          Navigate("/");
        }, 900);
      } else {
        setMemberShipAddStatus(response.data.type);
        setStatusMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setMemberShipAddStatus("error");
      setStatusMessage("MemberShip not added!");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMemberShipAddStatus("");
      setStatusMessage("");
    }, 1500);

    return () => clearTimeout(timer);
  }, [memberShipAddStatus, statusMessage]);

  //  for react quill (long desc)
  const editor = useRef();

  const handleTextChange = (value) => {
    setLongDesc(value);
  };

  // Quill.register(quillTable.TableCell);
  // Quill.register(quillTable.TableRow);
  // Quill.register(quillTable.Table);
  // Quill.register(quillTable.Contain);
  // Quill.register('modules/table', quillTable.TableModule);

  const tableOptions = [];
  const maxRows = 8;
  const maxCols = 5;
  for (let r = 1; r <= maxRows; r++) {
    for (let c = 1; c <= maxCols; c++) {
      tableOptions.push("newtable_" + r + "_" + c);
    }
  }

  const editorModules = {
    toolbar: [
      [
        { header: "1" },
        { header: "2" },
        { header: [3, 4, 5, 6] },
        { font: [] },
      ],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "video", "image"],
      ["clean"],
      ["code-block"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }, { table: tableOptions }],
    ],
  };

  return (
    <>
      <div className="main-content dark">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <div className="col-3 table-heading">MemberShip Settings</div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Select MemberShip :
                        </label>
                        <div className="col-md-3">
                          <select
                            required
                            className="form-select"
                            id="subcategory-select"
                            value={selectedMemberShip}
                            onChange={(e) => {
                              setSelectedMemberShip(e.target.value);
                            }}
                          >
                            <option value="1">Gold</option>
                            <option value="2">Silver</option>
                            <option value="3">PPO</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          MemberShip Name :
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="example-number-input"
                            value={memberShipName}
                            onChange={(e) => {
                              setMemberShipName(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          MemberShip Price :
                        </label>
                        <div className="col-md-10">
                          <input
                            min="0"
                            required
                            className="form-control"
                            type="number"
                            id="example-number-input"
                            value={memberShipPrice}
                            onChange={(e) => {
                              setMemberShipPrice(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Sort Description :
                        </label>
                        <div className="col-md-10">
                          <textarea
                            className="form-control"
                            type="text"
                            value={sortDesc}
                            onChange={(e) => setSortDesc(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Long Description :
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={longDesc}
                            onChange={handleTextChange}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <div className="col ms-auto">
                          <div className="d-flex flex-reverse flex-wrap gap-2">
                            <button
                              className="btn btn-danger"
                              onClick={() => Navigate("/showCategory")}
                            >
                              {" "}
                              <i className="fas fa-window-close"></i> Cancel{" "}
                            </button>
                            <button className="btn btn-success" type="submit">
                              {" "}
                              <i className="fas fa-save"></i> Save{" "}
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
        <AlertBox status={memberShipAddStatus} statusMessage={statusMessage} />
      </div>
    </>
  );
};

export default MemberShipSettings;

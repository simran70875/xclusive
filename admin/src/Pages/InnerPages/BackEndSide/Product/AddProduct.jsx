import React, { useState } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import { Trash2, Plus, Save, XCircle, Upload, Check } from "lucide-react";

const AddProductDesign = () => {
  // --- DYNAMIC OPTION STATES ---
  const [metalTypes, setMetalTypes] = useState(["Gold", "Silver", "Platinum"]);
  const [purities, setPurities] = useState(["9k", "14k", "18k", "22k", "24k"]);
  const [sizes, setSizes] = useState([12, 14, 16, 18, 20]);

  const [diamondTypes, setDiamondTypes] = useState(["Diamond", "Sapphire", "Ruby", "Emerald"]);
  // New State for Diamond Qualities
  const [diamondQualities, setDiamondQualities] = useState([
    { value: 'VVS1', label: 'VVS1' }, { value: 'VVS2', label: 'VVS2' },
    { value: 'VS1', label: 'VS1' }, { value: 'VS2', label: 'VS2' },
    { value: 'SI1', label: 'SI1' }, { value: 'I1', label: 'I1' }
  ]);

  // --- TAB STATE ---
  const [activeTab, setActiveTab] = useState(0);

  // --- MASTER PRODUCT STATE ---
  const [masterData, setMasterData] = useState({
    name: "",
    sku: "SKU-" + Math.floor(Math.random() * 100000),
    description: "",
  });

  // --- VARIATIONS STATE ---
  const [variations, setVariations] = useState([
    {
      id: 1,
      variationName: "Yellow Gold",
      images: [],
      isDiamondInvolved: false,
      metalComponents: [
        { metalType: "Gold", purity: "18k", size: 16, weight: 0, rate: 0 },
      ],
      diamondComponents: [],
      labourCharge: 0,
      makingCharge: 0,
      finalPrice: 0,
    },
    {
      id: 2,
      variationName: "White Gold",
      images: [],
      isDiamondInvolved: false,
      metalComponents: [
        { metalType: "Gold", purity: "18k", size: 16, weight: 0, rate: 0 },
      ],
      diamondComponents: [],
      labourCharge: 0,
      makingCharge: 0,
      finalPrice: 0,
    },
    {
      id: 3,
      variationName: "Rose Gold",
      images: [],
      isDiamondInvolved: false,
      metalComponents: [
        { metalType: "Gold", purity: "18k", size: 16, weight: 0, rate: 0 },
      ],
      diamondComponents: [],
      labourCharge: 0,
      makingCharge: 0,
      finalPrice: 0,
    },
  ]);

  // --- HANDLERS ---
  const handleOnTheSpotAdd = (type) => {
    const val = prompt(`Enter new ${type}:`);
    if (val) {
      if (type === "Metal") setMetalTypes([...metalTypes, val]);
      if (type === "Purity") setPurities([...purities, val]);
      if (type === "Size") setSizes([...sizes, val]);
      if (type === "Diamond Type") setDiamondTypes([...diamondTypes, val]);
      if (type === "Quality") setDiamondQualities([...diamondQualities, { value: val, label: val }]);
    }
  };

  const deleteVariation = (id, e) => {
    e.stopPropagation(); // Prevents switching tabs when clicking delete
    if (variations.length === 1)
      return alert("You must have at least one variation.");
    if (window.confirm("Delete this variation?")) {
      const filtered = variations.filter((v) => v.id !== id);
      setVariations(filtered);
      setActiveTab(0);
    }
  };

  const calculateTotal = (idx) => {
    const updated = [...variations];
    const v = updated[idx];
    if (!v) return;
    const mTotal = v.metalComponents.reduce(
      (acc, m) => acc + Number(m.weight) * Number(m.rate),
      0,
    );
    const dTotal = v.isDiamondInvolved
      ? v.diamondComponents.reduce(
          (acc, d) => acc + Number(d.totalCrt) * Number(d.rate || 0),
          0,
        )
      : 0;
    v.finalPrice =
      mTotal +
      dTotal +
      Number(v.labourCharge || 0) +
      Number(v.makingCharge || 0);
    setVariations(updated);
  };

  const currentVar = variations[activeTab];

  return (
    <div className="main-content p-4 bg-light">
      {/* 1. PRODUCT MASTER INFORMATION */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-header bg-white py-3">
          <h5>Product Master Details</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold small">Product Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Elegant Solitaire"
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small">SKU Code</label>
              <input
                type="text"
                className="form-control bg-light"
                value={masterData.sku}
                readOnly
              />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small">Brand</label>
              <Select options={[{ label: "Royal Jewels", value: 1 }]} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small">Category</label>
              <Select options={[{ label: "Rings", value: 1 }]} />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small">Collection</label>
              <Select options={[{ label: "Bridal", value: 1 }]} />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-bold small">Master Images</label>
              <input type="file" className="form-control" multiple />
            </div>
            <div className="col-12">
              <label className="form-label fw-bold small">Description</label>
              <ReactQuill theme="snow" value={masterData.description} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABBED VARIATIONS SECTION */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white pt-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 text-primary fw-bold">
              Variations Information
            </h5>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                const newVar = {
                  id: Date.now(),
                  variationName: "New Variation",
                  images: [],
                  isDiamondInvolved: false,
                  metalComponents: [
                    {
                      metalType: "Gold",
                      purity: "18k",
                      size: 16,
                      weight: 0,
                      rate: 0,
                    },
                  ],
                  diamondComponents: [],
                  labourCharge: 0,
                  makingCharge: 0,
                  finalPrice: 0,
                };
                setVariations([...variations, newVar]);
                setActiveTab(variations.length);
              }}
            >
              <Plus size={16} /> Add Variation
            </button>
          </div>

          <ul className="nav nav-tabs border-0">
            {variations.map((v, idx) => (
              <li
                className="nav-item"
                key={v.id}
                style={{ position: "relative" }}
              >
                <button
                  className={`nav-link fw-bold d-flex align-items-center ${activeTab === idx ? "active bg-primary text-white border-primary" : "text-secondary bg-light"}`}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    marginRight: "5px",
                    borderRadius: "8px 8px 0 0",
                    paddingRight: "35px",
                  }}
                >
                  {v.variationName || `Var ${idx + 1}`}
                  <Trash2
                    size={14}
                    className="ms-2"
                    style={{
                      position: "absolute",
                      right: "10px",
                      cursor: "pointer",
                      opacity: 0.7,
                    }}
                    onClick={(e) => deleteVariation(v.id, e)}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body bg-white border-top">
          {currentVar && (
            <div className="animate__animated animate__fadeIn">
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label small fw-bold">
                    Variation Color/Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={currentVar.variationName}
                    onChange={(e) => {
                      const up = [...variations];
                      up[activeTab].variationName = e.target.value;
                      setVariations(up);
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">
                    Manage Variation Images
                  </label>
                  <br></br>
                  <button className="btn btn-sm btn-primary py-2">
                    <Plus size={16} /> Upload Images
                  </button>
                </div>
              </div>

              {/* METAL CALCULATIONS */}
              <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
                <h6 className="fw-bold text-dark border-start border-primary border-4 ps-2">
                  METAL COMPONENTS
                </h6>
              </div>

              <table className="table table-bordered align-middle">
                <thead className="table-light small">
                  <tr>
                    <th>
                      <div className="d-flex align-items-center justify-content-between">
                        Metal Type{" "}
                        <button
                          className="btn btn-xxs btn-outline-secondary py-1"
                          onClick={() => handleOnTheSpotAdd("Metal")}
                        >
                          +
                        </button>
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center justify-content-between">
                        Purity
                        <button
                          className="btn btn-xxs btn-outline-secondary py-1"
                          onClick={() => handleOnTheSpotAdd("Purity")}
                        >
                          +
                        </button>
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center justify-content-between">
                        Size{" "}
                        <button
                          className="btn btn-xxs btn-outline-secondary py-1"
                          onClick={() => handleOnTheSpotAdd("Size")}
                        >
                          +
                        </button>
                      </div>
                    </th>
                    <th>Weight (g)</th>

                    <th>Rate/g</th>
                    <th className="text-end">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVar.metalComponents.map((m, mIdx) => (
                    <tr key={mIdx}>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={m.metalType}
                          onChange={(e) => {
                            currentVar.metalComponents[mIdx].metalType =
                              e.target.value;
                            setVariations([...variations]);
                          }}
                        >
                          {metalTypes.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={m.purity}
                          onChange={(e) => {
                            currentVar.metalComponents[mIdx].purity =
                              e.target.value;
                            setVariations([...variations]);
                          }}
                        >
                          {purities.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={m.size}
                          onChange={(e) => {
                            currentVar.metalComponents[mIdx].size =
                              e.target.value;
                            setVariations([...variations]);
                          }}
                        >
                          {sizes.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={m.weight}
                          onChange={(e) => {
                            currentVar.metalComponents[mIdx].weight =
                              e.target.value;
                            calculateTotal(activeTab);
                          }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={m.rate}
                          onChange={(e) => {
                            currentVar.metalComponents[mIdx].rate =
                              e.target.value;
                            calculateTotal(activeTab);
                          }}
                        />
                      </td>
                      <td className="text-end fw-bold">
                        £{(Number(m.weight) * Number(m.rate)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-sm btn-outline-primary mb-4"
                onClick={() => {
                  currentVar.metalComponents.push({
                    metalType: "Gold",
                    purity: "18k",
                    size: 16,
                    weight: 0,
                    rate: 0,
                  });
                  setVariations([...variations]);
                }}
              >
                + Add Metal Row
              </button>

              <div className="col-md-4 d-flex align-items-end pb-2 pt-2">
                <div className="form-check form-switch mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={currentVar.isDiamondInvolved}
                    onChange={(e) => {
                      const up = [...variations];
                      up[activeTab].isDiamondInvolved = e.target.checked;
                      if (
                        e.target.checked &&
                        currentVar.diamondComponents.length === 0
                      ) {
                        up[activeTab].diamondComponents = [
                          {
                            type: "Diamond",
                            shape: "Round",
                            mm: "",
                            count: 0,
                            average: "",
                            totalCrt: 0,
                            rate: 0,
                          },
                        ];
                      }
                      setVariations(up);
                      calculateTotal(activeTab);
                    }}
                  />
                  <label className="form-check-label fw-bold">
                    Involve Diamonds?
                  </label>
                </div>
              </div>
              {/* DIAMOND CALCULATIONS */}
              {currentVar.isDiamondInvolved && (
                <div className="mt-4 animate__animated animate__fadeInUp">
                  <h6 className="fw-bold text-info border-start border-info border-4 ps-2 mb-3">
                    DIAMOND COMPONENTS
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light small">
                        <tr>
                          <th>Type</th>
                          <th>Quality</th>
                          <th>Shape</th>
                          <th>mm</th>
                          <th>No of stone</th>
                          <th>Average</th>
                          <th>Total Crt</th>
                          <th>Rate/Crt</th>
                          <th className="text-end">Total cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentVar.diamondComponents.map((d, dIdx) => (
                          <tr key={dIdx}>
                            <td>
                              {/* Changed from Input to Select with dynamic options */}
                              <select
                                className="form-select form-select-sm"
                                value={d.type}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].type = e.target.value;
                                  setVariations([...variations]);
                                }}
                              >
                                {diamondTypes.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </td>
                            {/* New Quality Field Dropdown */}
                            <td>
                              <select className="form-select form-select-sm" value={d.quality} onChange={(e) => { currentVar.diamondComponents[dIdx].quality = e.target.value; setVariations([...variations]); }}>
                                {diamondQualities.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                              </select>
                            </td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={d.shape}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].shape =
                                    e.target.value;
                                  setVariations([...variations]);
                                }}
                              >
                                <option>Round</option>
                                <option>Princess</option>
                                <option>Oval</option>
                                <option>Square</option>
                              </select>
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={d.mm}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].mm =
                                    e.target.value;
                                  setVariations([...variations]);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={d.count}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].count =
                                    e.target.value;
                                  setVariations([...variations]);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={d.average}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].average =
                                    e.target.value;
                                  setVariations([...variations]);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={d.totalCrt}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].totalCrt =
                                    e.target.value;
                                  calculateTotal(activeTab);
                                }}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                value={d.rate}
                                onChange={(e) => {
                                  currentVar.diamondComponents[dIdx].rate =
                                    e.target.value;
                                  calculateTotal(activeTab);
                                }}
                              />
                            </td>
                            <td className="text-end fw-bold">
                              £
                              {(
                                Number(d.totalCrt) * Number(d.rate || 0)
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-info mb-4"
                    onClick={() => {
                      currentVar.diamondComponents.push({
                        type: "Diamond",
                        shape: "Round",
                        mm: "",
                        count: 0,
                        average: "",
                        totalCrt: 0,
                        rate: 0,
                      });
                      setVariations([...variations]);
                    }}
                  >
                    + Add Diamond Row
                  </button>
                </div>
              )}

              {/* TAB FOOTER - SUMMARY */}
              <div className="row justify-content-end mt-4">
                <div className="col-md-5">
                  <div className="card card-body bg-light border-0">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Labour Charge</span>
                      <input
                        type="number"
                        className="form-control form-control-sm w-50"
                        value={currentVar.labourCharge}
                        onChange={(e) => {
                          currentVar.labourCharge = e.target.value;
                          calculateTotal(activeTab);
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Making Charge</span>
                      <input
                        type="number"
                        className="form-control form-control-sm w-50"
                        value={currentVar.makingCharge}
                        onChange={(e) => {
                          currentVar.makingCharge = e.target.value;
                          calculateTotal(activeTab);
                        }}
                      />
                    </div>
                    <div className="d-flex justify-content-between fw-bold fs-4 border-top pt-2 mt-2 text-dark">
                      <span>Variation Total</span>
                      <span className="text-success">
                        £{Number(currentVar.finalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-end mt-5 mb-5 pb-5">
        <button className="btn btn-outline-danger px-5">Cancel</button>
        <button className="btn btn-success btn-lg px-5 shadow">
          <Save size={20} className="me-2" /> Save Product
        </button>
      </div>
    </div>
  );
};

export default AddProductDesign;

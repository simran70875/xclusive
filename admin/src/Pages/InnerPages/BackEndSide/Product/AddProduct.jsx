import { useState } from "react";
import ReactQuill from "react-quill";
import {
  Trash2,
  Plus,
  Save,
  Copy,
  Gem,
  Layers,
  Package,
  Image as ImageIcon,
  Briefcase,
  Upload,
  CheckCircle,
  EllipsisVertical,
} from "lucide-react";

const AddProductDesign = () => {
  const metalTypes = ["Gold", "Silver", "Platinum"];
  const purities = ["9k", "14k", "18k", "22k", "24k"];
  const diamondTypes = ["Diamond", "Sapphire", "Ruby", "Emerald"];
  const metalSizesList = ["12", "14", "16", "18", "20"];
  const diamondSizesList = ["0.5", "1.0", "1.5", "2.0"];

  // 1. Add these global quality definitions (based on your uploaded sheet)
  const diamondQualities = [
    { name: "LAB VVS/Vs", rateKey: "labVvsVs" },
    { name: "Natural FG VS", rateKey: "naturalFgVs" },
    { name: "Natural GH Si", rateKey: "naturalGhSi" },
    { name: "Natural HI Si", rateKey: "naturalHiSi" },
  ];

  // --- MASTER PRODUCT STATE ---
  const [productData, setProductData] = useState({
    name: "",
    brand: "",
    category: "",
    collection: "",
    description: "",
    images: [], // Global images available to all variations
  });

  // --- MODAL STATE ---
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalTab, setModalTab] = useState("upload"); // "upload" or "library"

  // --- HELPER: Object Creation ---
  function createNewVariationObject(id, name) {
    return {
      _id: id,
      variationName: name,
      variationImages: [], // Images specifically selected for THIS variation
      isDiamondInvolved: false,
      metalSizes: metalSizesList.map((s, i) => ({
        _id: `m-size-${id}-${i}`,
        sizeName: s,
        components: [{ metalType: "Gold", purity: "18k", weight: 0, rate: 0 }],
        labourCharge: 0, // Added here
        makingCharge: 0, // Added here
      })),
      diamondSizes: diamondSizesList.map((s, i) => ({
        _id: `d-size-${id}-${i}`,
        sizeName: s,
        labourCharge: 0, // Added here
        makingCharge: 0, // Added here
        components: [
          {
            type: "Diamond",
            shape: "Round",
            mm: "",
            count: 0,
            totalCrt: 0,
            rate: 0,
          },
        ],
      })),
      finalPrice: 0,
    };
  }

  const [variations, setVariations] = useState([
    createNewVariationObject("v-1", "Yellow Gold"),
  ]);
  const [activeVarId, setActiveVarId] = useState("v-1");
  const [activeMetalSizeId, setActiveMetalSizeId] = useState(
    variations[0].metalSizes[0]._id,
  );
  const [activeDiamondSizeId, setActiveDiamondSizeId] = useState(
    variations[0].diamondSizes[0]._id,
  );

  const currentVar =
    variations.find((v) => v._id === activeVarId) || variations[0];
  const currentMetalSize =
    currentVar.metalSizes.find((s) => s._id === activeMetalSizeId) ||
    currentVar.metalSizes[0];
  const currentDiamondSize =
    currentVar.diamondSizes.find((s) => s._id === activeDiamondSizeId) ||
    currentVar.diamondSizes[0];

  // --- CALCULATION LOGIC ---
  const calculateTotal = (data) => {
    return data.map((v) => {
      const mCost =
        v.metalSizes
          .find((s) => s._id === activeMetalSizeId)
          ?.components.reduce(
            (acc, m) => acc + Number(m.weight) * Number(m.rate),
            0,
          ) || 0;

      const dCost = v.isDiamondInvolved
        ? v.diamondSizes
            .find((s) => s._id === activeDiamondSizeId)
            ?.components.reduce(
              (acc, d) => acc + Number(d.totalCrt) * Number(d.rate),
              0,
            ) || 0
        : 0;

      return {
        ...v,
        finalPrice:
          mCost + dCost + Number(v.labourCharge) + Number(v.makingCharge),
      };
    });
  };

  // --- VARIATION ACTIONS ---
  const handleAddVariation = () => {
    const id = "v-" + Date.now();
    const newVar = createNewVariationObject(id, "New Variation");
    setVariations([...variations, newVar]);
    setActiveVarId(id);
  };

  const handleDuplicateVariation = (v, e) => {
    e.stopPropagation();
    const newId = "v-" + Date.now();
    const duplicated = JSON.parse(JSON.stringify(v));
    duplicated._id = newId;
    duplicated.variationName += " (Copy)";
    duplicated.metalSizes.forEach((s, i) => (s._id = `m-size-${newId}-${i}`));
    duplicated.diamondSizes.forEach((s, i) => (s._id = `d-size-${newId}-${i}`));
    setVariations([...variations, duplicated]);
    setActiveVarId(newId);
  };

  const handleDeleteVariation = (id, e) => {
    e.stopPropagation();
    if (variations.length === 1)
      return alert("At least one variation is required.");
    const filtered = variations.filter((v) => v._id !== id);
    setVariations(filtered);
    if (activeVarId === id) setActiveVarId(filtered[0]._id);
  };

  const updateField = (field, value) => {
    const updated = variations.map((v) =>
      v._id === activeVarId ? { ...v, [field]: value } : v,
    );
    setVariations(calculateTotal(updated));
  };

  // Update updateComponent to handle rate changes and recalculate totals
  const updateComponent = (type, index, field, value) => {
    const updated = variations.map((v) => {
      if (v._id === activeVarId) {
        const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
        const activeId =
          type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

        return {
          ...v,
          [sizeKey]: v[sizeKey].map((s) => {
            if (s._id === activeId) {
              const newComps = [...s.components];
              newComps[index][field] = value;

              // AUTO-LOOKUP: If user changes 'mm', you could theoretically
              // look up the 'ct/piece' from your spreadsheet image here.

              return { ...s, components: newComps };
            }
            return s;
          }),
        };
      }
      return v;
    });
    setVariations(updated); // Calculation is now done per quality in the UI
  };

  const calculateQualityTotal = (variation, qualityName) => {
    const mSize = variation.metalSizes.find((s) => s._id === activeMetalSizeId);
    const dSize = variation.diamondSizes.find(
      (s) => s._id === activeDiamondSizeId,
    );

    // Metal Table Subtotal
    const metalSubtotal =
      mSize?.components.reduce((acc, m) => acc + m.weight * m.rate, 0) || 0;
    const metalTotal =
      metalSubtotal +
      (Number(mSize?.labourCharge) || 0) +
      (Number(mSize?.makingCharge) || 0);

    // Diamond Table Subtotal (Calculation varies by Quality)
    let diamondTotal = 0;
    if (variation.isDiamondInvolved) {
      const diamondSubtotal =
        dSize?.components.reduce((acc, d) => {
          // Rates pulled from spreadsheet mapping
          const qualityRate = d.qualityRates?.[qualityName] || d.rate;
          return acc + Number(d.totalCrt) * Number(qualityRate);
        }, 0) || 0;

      diamondTotal =
        diamondSubtotal +
        (Number(dSize?.labourCharge) || 0) +
        (Number(dSize?.makingCharge) || 0);
    }

    return metalTotal + diamondTotal;
  };
  // --- SIZE CRUD ACTIONS ---

  const handleDuplicateSize = (type, sizeObj) => {
    const newId = `${type === "metal" ? "m" : "d"}-size-${Date.now()}`;
    const duplicatedSize = {
      ...JSON.parse(JSON.stringify(sizeObj)),
      _id: newId,
      sizeName: sizeObj.sizeName + " (Copy)",
    };

    const updated = variations.map((v) =>
      v._id === activeVarId
        ? {
            ...v,
            [type === "metal" ? "metalSizes" : "diamondSizes"]: [
              ...v[type === "metal" ? "metalSizes" : "diamondSizes"],
              duplicatedSize,
            ],
          }
        : v,
    );
    setVariations(calculateTotal(updated));
  };

  const handleDeleteSize = (type, sizeId, e) => {
    e.stopPropagation();
    const key = type === "metal" ? "metalSizes" : "diamondSizes";
    if (currentVar[key].length <= 1)
      return alert("At least one size is required.");

    const updated = variations.map((v) => {
      if (v._id === activeVarId) {
        const filtered = v[key].filter((s) => s._id !== sizeId);
        return { ...v, [key]: filtered };
      }
      return v;
    });

    setVariations(calculateTotal(updated));
    // Switch active tab if we deleted the current one
    const remaining = updated.find((v) => v._id === activeVarId)[key];
    if (type === "metal" && activeMetalSizeId === sizeId)
      setActiveMetalSizeId(remaining[0]._id);
    if (type === "diamond" && activeDiamondSizeId === sizeId)
      setActiveDiamondSizeId(remaining[0]._id);
  };

  // --- SIZE MODAL STATE ---
  const [sizeModal, setSizeModal] = useState({
    show: false,
    type: "metal", // 'metal' or 'diamond'
    mode: "add", // 'add' or 'edit'
    id: null, // For editing
    value: "",
  });

  // --- UPDATED SIZE CRUD ACTIONS (Replacing Alerts/Prompts) ---
  const openSizeModal = (type, mode, id = null, initialValue = "") => {
    setSizeModal({ show: true, type, mode, id, value: initialValue });
  };

  const handleSaveSize = () => {
    const { type, mode, id, value } = sizeModal;
    if (!value) return;

    if (mode === "add") {
      const newId = `${type === "metal" ? "m" : "d"}-size-${Date.now()}`;
      const newSizeObj =
        type === "metal"
          ? {
              _id: newId,
              sizeName: value,
              components: [
                { metalType: "Gold", purity: "18k", weight: 0, rate: 0 },
              ],
            }
          : {
              _id: newId,
              sizeName: value,
              components: [
                {
                  type: "Diamond",
                  shape: "Round",
                  mm: "",
                  count: 0,
                  totalCrt: 0,
                  rate: 0,
                },
              ],
            };

      const updated = variations.map((v) =>
        v._id === activeVarId
          ? {
              ...v,
              [type === "metal" ? "metalSizes" : "diamondSizes"]: [
                ...v[type === "metal" ? "metalSizes" : "diamondSizes"],
                newSizeObj,
              ],
            }
          : v,
      );
      setVariations(calculateTotal(updated));
      if (type === "metal") setActiveMetalSizeId(newId);
      else setActiveDiamondSizeId(newId);
    } else {
      // Edit Mode
      const key = type === "metal" ? "metalSizes" : "diamondSizes";
      setVariations(
        variations.map((v) =>
          v._id === activeVarId
            ? {
                ...v,
                [key]: v[key].map((s) =>
                  s._id === id ? { ...s, sizeName: value } : s,
                ),
              }
            : v,
        ),
      );
    }
    setSizeModal({ ...sizeModal, show: false });
  };

  // --- COMPONENT ROW ACTIONS ---
  const handleAddComponentRow = (type) => {
    const updated = variations.map((v) => {
      if (v._id === activeVarId) {
        const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
        const activeId =
          type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

        return {
          ...v,
          [sizeKey]: v[sizeKey].map((s) => {
            if (s._id === activeId) {
              const newRow =
                type === "metal"
                  ? { metalType: "Gold", purity: "18k", weight: 0, rate: 0 }
                  : {
                      type: "Diamond",
                      shape: "Round",
                      mm: "",
                      count: 0,
                      totalCrt: 0,
                      rate: 0,
                    };
              return { ...s, components: [...s.components, newRow] };
            }
            return s;
          }),
        };
      }
      return v;
    });
    setVariations(calculateTotal(updated));
  };

  const handleDeleteComponentRow = (type, index) => {
    const updated = variations.map((v) => {
      if (v._id === activeVarId) {
        const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
        const activeId =
          type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

        return {
          ...v,
          [sizeKey]: v[sizeKey].map((s) => {
            if (s._id === activeId) {
              if (s.components.length <= 0) return s; // Keep at least one row
              const filtered = s.components.filter((_, i) => i !== index);
              return { ...s, components: filtered };
            }
            return s;
          }),
        };
      }
      return v;
    });
    setVariations(calculateTotal(updated));
  };

  const updateSizeField = (type, field, value) => {
    const key = type === "metal" ? "metalSizes" : "diamondSizes";
    const activeId = type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

    const updated = variations.map((v) => {
      if (v._id === activeVarId) {
        return {
          ...v,
          [key]: v[key].map((s) =>
            s._id === activeId ? { ...s, [field]: Number(value) } : s,
          ),
        };
      }
      return v;
    });
    setVariations(updated);
  };

  return (
    <div className="main-content p-4 bg-light min-vh-100">
      {/* 1. TOP PRODUCT INFORMATION CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">
            <Package className="me-2 text-primary" />
            General Product Information
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">Product Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter product name"
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Brand</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setProductData({ ...productData, brand: e.target.value })
                }
              >
                <option>Select Brand</option>
                <option>Luxury Gold</option>
                <option>Royal Gems</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Category</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setProductData({ ...productData, category: e.target.value })
                }
              >
                <option>Select Category</option>
                <option>Rings</option>
                <option>Necklaces</option>
                <option>Earrings</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Collection</label>
              <select
                className="form-select"
                onChange={(e) =>
                  setProductData({ ...productData, collection: e.target.value })
                }
              >
                <option>Select Collection</option>
                <option>Wedding 2026</option>
                <option>Classic Essentials</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label small fw-bold">
                Global Product Images (General)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <ImageIcon size={18} />
                </span>
                <input type="file" className="form-control" multiple />
              </div>
            </div>
            <div className="col-12 mt-3">
              <label className="form-label small fw-bold">
                Product Description
              </label>
              <ReactQuill
                theme="snow"
                value={productData.description}
                onChange={(val) =>
                  setProductData({ ...productData, description: val })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. VARIATIONS CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-primary fw-bold">
            <Briefcase className="me-2" />
            Pricing Variations
          </h5>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddVariation}
          >
            <Plus size={16} className="me-1" /> Add Variation
          </button>
        </div>

        {/* VARIATION TABS */}
        <div className="p-3 bg-white border-bottom">
          <ul className="nav nav-tabs border-0">
            {variations.map((v) => (
              <li className="nav-item" key={v._id}>
                <div
                  className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeVarId === v._id ? "active bg-primary text-white shadow-sm" : "text-secondary bg-light"}`}
                  style={{
                    cursor: "pointer",
                    marginRight: "5px",
                    borderRadius: "8px 8px 0 0",
                  }}
                  onClick={() => {
                    setActiveVarId(v._id);
                    setActiveMetalSizeId(v.metalSizes[0]._id);
                    setActiveDiamondSizeId(v.diamondSizes[0]._id);
                  }}
                >
                  {v.variationName}
                  <div className="d-flex gap-1 ms-2">
                    <Copy
                      size={14}
                      className={
                        activeVarId === v._id ? "text-white-50" : "text-primary"
                      }
                      onClick={(e) => handleDuplicateVariation(v, e)}
                    />
                    <Trash2
                      size={14}
                      className={
                        activeVarId === v._id ? "text-white-50" : "text-danger"
                      }
                      onClick={(e) => handleDeleteVariation(v._id, e)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div className="w-50">
              <label className="form-label small fw-bold">
                Variation Display Name
              </label>
              <input
                type="text"
                className="form-control"
                value={currentVar.variationName}
                onChange={(e) => updateField("variationName", e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2"
              onClick={() => setShowImageModal(true)}
            >
              <ImageIcon size={18} /> Manage Variation Images (
              {currentVar.variationImages.length})
            </button>
          </div>

          {/* METAL SECTION */}
          <div className="mb-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <h6 className="fw-bold mb-0 text-dark">
                <Layers size={18} className="me-2 text-muted" />
                METAL COMPONENTS
              </h6>
              <div className="d-flex gap-2 bg-light p-1 rounded border">
                {currentVar.metalSizes.map((s) => (
                  <div
                    key={s._id}
                    className={`btn-group btn-group-sm shadow-sm ${activeMetalSizeId === s._id ? "ring-primary" : ""}`}
                  >
                    <button
                      className={`btn ${activeMetalSizeId === s._id ? "btn-dark" : "btn-white border"}`}
                      onClick={() => setActiveMetalSizeId(s._id)}
                    >
                      {s.sizeName}
                    </button>
                    <button
                      className="btn btn-white border dropdown-toggle dropdown-toggle-split"
                      data-bs-toggle="dropdown"
                    >
                      <EllipsisVertical size={12} />
                    </button>
                    <ul className="dropdown-menu shadow-sm">
                      <li>
                        <button
                          className="dropdown-item small"
                          onClick={() =>
                            openSizeModal("metal", "edit", s._id, s.sizeName)
                          }
                        >
                          Edit Name
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item small"
                          onClick={() => handleDuplicateSize("metal", s)}
                        >
                          Duplicate
                        </button>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item small text-danger"
                          onClick={(e) => handleDeleteSize("metal", s._id, e)}
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                ))}
                <button
                  className="btn btn-outline-success btn-sm rounded-circle"
                  onClick={() => openSizeModal("metal", "add")}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <table className="table table-bordered align-middle shadow-sm">
              {/* The 'table-striped' class is omitted to keep all rows the same color */}
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Metal Type</th>
                  <th>Purity</th>
                  <th>Size/Length</th>
                  <th>Weight (g)</th>
                  <th>Rate/g</th>
                  <th className="text-end">Cost</th>
                  <th className="text-center" style={{ width: "50px" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {currentMetalSize.components.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={m.metalType}
                        onChange={(e) =>
                          updateComponent(
                            "metal",
                            idx,
                            "metalType",
                            e.target.value,
                          )
                        }
                      >
                        {metalTypes.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={m.purity}
                        onChange={(e) =>
                          updateComponent(
                            "metal",
                            idx,
                            "purity",
                            e.target.value,
                          )
                        }
                      >
                        {purities.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={m.size}
                        onChange={(e) =>
                          updateComponent("metal", idx, "size", e.target.value)
                        }
                      >
                        {metalSizesList.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={m.weight}
                        onChange={(e) =>
                          updateComponent(
                            "metal",
                            idx,
                            "weight",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={m.rate}
                        onChange={(e) =>
                          updateComponent("metal", idx, "rate", e.target.value)
                        }
                      />
                    </td>
                    <td className="text-end fw-bold">
                      £{(m.weight * m.rate).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-danger btn-sm border-0"
                        onClick={() => handleDeleteComponentRow("metal", idx)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* ADD NEW ROW SECTION */}
                <tr>
                  <td colSpan="7" className="p-2 border-0 bg-white">
                    <button
                      className="btn btn-link btn-sm text-decoration-none fw-bold p-0"
                      style={{ color: "#ff4d4d" }}
                      onClick={() => handleAddComponentRow("metal")}
                    >
                      + Add new
                    </button>
                  </td>
                </tr>

                {/* subTotal Cost */}
                <tr>
                  <td
                    colSpan="5"
                    className="text-end fw-bold border bg-light py-2"
                  >
                    Sub-total Cost
                  </td>
                  <td className="text-end fw-bold bg-light">
                    <input
                      type="number"
                      className="form-control form-control-sm border-0 text-end py-2"
                      value={currentMetalSize.labourCharge}
                      onChange={(e) =>
                        updateSizeField("metal", "labourCharge", e.target.value)
                      }
                    />
                  </td>
                </tr>

                {/* LABOUR CHARGE */}
                <tr>
                  <td
                    colSpan="5"
                    className="text-end fw-bold border bg-light py-2"
                  >
                    Labour
                  </td>
                  <td className="text-end fw-bold bg-light">
                    <input
                      type="number"
                      className="form-control form-control-sm border-0 text-end py-2"
                      value={currentMetalSize.labourCharge}
                      onChange={(e) =>
                        updateSizeField("metal", "labourCharge", e.target.value)
                      }
                    />
                  </td>
                </tr>

                {/* MAKING CHARGE */}
                <tr>
                  <td
                    colSpan={"5"}
                    className="text-end fw-bold border bg-light py-2"
                  >
                    Making
                  </td>
                  <td className="text-end fw-bold bg-light">
                    <input
                      type="number"
                      className="form-control form-control-sm border-0 text-end py-2"
                      value={currentMetalSize.makingCharge}
                      onChange={(e) =>
                        updateSizeField("metal", "makingCharge", e.target.value)
                      }
                    />
                  </td>
                </tr>

                {/* FINAL TOTAL COST */}
                <tr>
                  <td
                    colSpan={"5"}
                    className="text-end fw-bold border bg-light py-2"
                  >
                    Total Cost
                  </td>
                  <td className="text-end fw-bold bg-light">
                    £
                    {(
                      currentMetalSize.components.reduce(
                        (acc, m) => acc + m.weight * m.rate,
                        0,
                      ) +
                      (Number(currentMetalSize.labourCharge) || 0) +
                      (Number(currentMetalSize.makingCharge) || 0)
                    ).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* DIAMOND SECTION */}
          <div
            className="form-check form-switch mb-4 p-3 rounded border"
            style={{ backgroundColor: "#f0f7ff" }}
          >
            <input
              className="form-check-input ms-0 me-2"
              type="checkbox"
              checked={currentVar.isDiamondInvolved}
              onChange={(e) =>
                updateField("isDiamondInvolved", e.target.checked)
              }
            />
            <label className="form-check-label fw-bold text-primary">
              Involve Diamond Components?
            </label>
          </div>

          {currentVar.isDiamondInvolved && (
            <div className="animate__animated animate__fadeIn mb-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <h6 className="fw-bold mb-0 text-info">
                  <Gem size={18} className="me-2" />
                  DIAMOND COMPONENTS
                </h6>
                <div className="d-flex gap-2 bg-light p-1 rounded border">
                  {currentVar.diamondSizes.map((s) => (
                    <div
                      key={s._id}
                      className={`btn-group btn-group-sm shadow-sm`}
                    >
                      <button
                        className={`btn ${activeDiamondSizeId === s._id ? "btn-info text-white" : "btn-white border text-info"}`}
                        onClick={() => setActiveDiamondSizeId(s._id)}
                      >
                        {s.sizeName}
                      </button>
                      <button
                        className="btn btn-white border dropdown-toggle dropdown-toggle-split text-info"
                        data-bs-toggle="dropdown"
                      >
                        <EllipsisVertical size={12} />
                      </button>
                      <ul className="dropdown-menu shadow-sm">
                        <li>
                          <button
                            className="dropdown-item small"
                            onClick={() =>
                              openSizeModal(
                                "diamond",
                                "edit",
                                s._id,
                                s.sizeName,
                              )
                            }
                          >
                            Edit Name
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item small"
                            onClick={() => handleDuplicateSize("diamond", s)}
                          >
                            Duplicate
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item small text-danger"
                            onClick={(e) =>
                              handleDeleteSize("diamond", s._id, e)
                            }
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  ))}
                  <button
                    className="btn btn-outline-info btn-sm rounded-circle"
                    onClick={() => openSizeModal("diamond", "add")}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <table className="table table-bordered align-middle shadow-sm">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Type</th>
                    <th>Shape</th>
                    <th>mm</th>
                    <th>No. Stones</th>
                    <th>Total Crt</th>
                    <th>Rate/Crt</th>
                    <th className="text-end">Cost</th>
                    <th className="text-center" style={{ width: "50px" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentDiamondSize.components.map((d, idx) => (
                    <tr key={idx}>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={d.type}
                          onChange={(e) =>
                            updateComponent(
                              "diamond",
                              idx,
                              "type",
                              e.target.value,
                            )
                          }
                        >
                          {diamondTypes.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={d.shape}
                          onChange={(e) =>
                            updateComponent(
                              "diamond",
                              idx,
                              "shape",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={d.mm}
                          onChange={(e) =>
                            updateComponent(
                              "diamond",
                              idx,
                              "mm",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={d.count}
                          onChange={(e) =>
                            updateComponent(
                              "diamond",
                              idx,
                              "count",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={d.totalCrt}
                          onChange={(e) =>
                            updateComponent(
                              "diamond",
                              idx,
                              "totalCrt",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={d.rate}
                          onChange={(e) =>
                            updateComponent(
                              "diamond",
                              idx,
                              "rate",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="text-end fw-bold">
                        £{(d.totalCrt * d.rate).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-danger btn-sm border-0"
                          onClick={() =>
                            handleDeleteComponentRow("diamond", idx)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="8" className="bg-light p-1">
                      <button
                        className="btn btn-link btn-sm text-decoration-none fw-bold text-info"
                        onClick={() => handleAddComponentRow("diamond")}
                      >
                        <Plus size={14} className="me-1" /> Add Diamond Row
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="text-end fw-bold bg-light">
                      Subtotal Diamond Cost
                    </td>
                    <td className="text-end fw-bold bg-light">
                      £
                      {currentDiamondSize.components
                        .reduce((acc, d) => acc + d.totalCrt * d.rate, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="text-end fw-bold bg-light">
                      Labour
                    </td>
                    <td className="text-end fw-bold bg-light">
                      <input
                        type="number"
                        className="form-control form-control-sm border-0 text-end"
                        value={currentDiamondSize.labourCharge}
                        onChange={(e) =>
                          updateSizeField(
                            "diamond",
                            "labourCharge",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="text-end fw-bold bg-light">
                      Making
                    </td>
                    <td className="text-end fw-bold bg-light">
                      <input
                        type="number"
                        className="form-control form-control-sm border-0 text-end"
                        value={currentDiamondSize.makingCharge}
                        onChange={(e) =>
                          updateSizeField(
                            "diamond",
                            "makingCharge",
                            e.target.value,
                          )
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="text-end fw-bold bg-light">
                      Total Cost
                    </td>
                    <td className="text-end fw-bold bg-light">
                      £
                      {(
                        currentDiamondSize.components.reduce(
                          (acc, d) => acc + d.totalCrt * d.rate,
                          0,
                        ) +
                        (Number(currentDiamondSize.labourCharge) || 0) +
                        (Number(currentDiamondSize.makingCharge) || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* QUALITY VARIATIONS GRID (As per your Screenshot) */}
              <div className="mt-4">
                <div className="d-flex align-items-center mb-3">
                  <CheckCircle className="text-success me-2" size={20} />
                  <h6 className="fw-bold mb-0">ADD QUALITY VARIATIONS</h6>
                </div>

                <div className="row g-3">
                  {diamondQualities.map((quality, idx) => {
                    const totalPrice = calculateQualityTotal(
                      currentVar,
                      quality.name,
                    );

                    return (
                      <div className="col-md-3" key={idx}>
                        <div className="card shadow-sm border-0 text-center overflow-hidden">
                          <div className="bg-white py-3 border-bottom">
                            <span className="fw-bold d-block">
                              {quality.name}
                            </span>
                          </div>
                          {/* Mocked detail grid from your image */}
                          <div className="card-body p-0">
                            <div className="row g-0 border-bottom">
                              <div className="col-6 py-2 border-end small text-muted">
                                Rate
                              </div>
                              <div className="col-6 py-2 small fw-bold">
                                Varied
                              </div>
                            </div>
                            <div className="row g-0">
                              <div className="col-6 py-2 border-end small text-muted">
                                Status
                              </div>
                              <div className="col-6 py-2 small text-success fw-bold">
                                Active
                              </div>
                            </div>
                          </div>
                          {/* Final Price Banner */}
                          <div className="bg-success text-white py-3">
                            <small className="d-block opacity-75">
                              Total Price
                            </small>
                            <h5 className="mb-0 fw-bold">
                              £{totalPrice.toFixed(2)}
                            </h5>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Quality Placeholder */}
                  <div className="col-md-3">
                    <div
                      className="card shadow-sm border-0 border-dashed d-flex align-items-center justify-content-center bg-light"
                      style={{
                        border: "2px dashed #dee2e6",
                      }}
                    >
                      <button className="btn btn-link text-decoration-none text-danger fw-bold">
                        <Plus size={18} className="me-1" /> ADD QUALITY
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRICING CHARGES */}
          <div className="row justify-content-end mt-4">
            <div className="col-md-4 bg-dark text-white p-3 rounded shadow">
             
              
              <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2 mt-2 text-warning">
                <span>Total Price</span>
                <span>£{currentVar.finalPrice.toFixed(2) | 0.00}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- IMAGE MANAGEMENT MODAL --- */}
      {showImageModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-white border-bottom py-3">
                <h6 className="modal-title fw-bold">
                  Manage Images: {currentVar.variationName}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>

              <div className="modal-body p-0">
                <div className="d-flex border-bottom bg-light">
                  <button
                    className={`flex-fill py-3 border-0 transition-all ${modalTab === "upload" ? "bg-white fw-bold border-bottom border-primary border-3 text-primary" : "text-muted bg-light"}`}
                    onClick={() => setModalTab("upload")}
                  >
                    <Upload size={18} className="me-2" /> Upload New Variation
                    Images
                  </button>
                  <button
                    className={`flex-fill py-3 border-0 transition-all ${modalTab === "library" ? "bg-white fw-bold border-bottom border-primary border-3 text-primary" : "text-muted bg-light"}`}
                    onClick={() => setModalTab("library")}
                  >
                    <CheckCircle size={18} className="me-2" /> Select from Media
                    Library
                  </button>
                </div>

                <div className="p-4" style={{ minHeight: "300px" }}>
                  {modalTab === "upload" ? (
                    <div className="text-center border-2 border-dashed rounded p-5 bg-light">
                      <Upload size={40} className="text-muted mb-3" />
                      <h5>Drag and drop images here</h5>
                      <p className="text-muted small">
                        Only JPG, PNG files supported
                      </p>
                      <input
                        type="file"
                        className="form-control w-50 mx-auto mt-3"
                        multiple
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted small mb-3">
                        Showing images uploaded in 'General Product Information'
                      </p>
                      <div className="row g-3">
                        {[1, 2, 3, 4].map((img) => (
                          <div className="col-3" key={img}>
                            <div className="position-relative border rounded p-1 hover-shadow cursor-pointer">
                              <img
                                src="https://xclusivediamonds.com/cdn/shop/files/d0fd7a2b2ad72aaa779ed7f44eebc1ac_720x.jpg?v=1734478410"
                                alt="prod"
                                className="img-fluid rounded"
                              />
                              <input
                                type="checkbox"
                                className="position-absolute top-0 end-0 m-2 shadow"
                                style={{ width: "20px", height: "20px" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-light border-top">
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => setShowImageModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4 shadow-sm"
                  onClick={() => setShowImageModal(false)}
                >
                  Apply Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIZE CRUD MODAL */}
      {sizeModal.show && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light py-2">
                <h6 className="modal-title fw-bold">
                  {sizeModal.mode === "add" ? "Add New Size" : "Rename Size"}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSizeModal({ ...sizeModal, show: false })}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label small fw-bold text-muted text-uppercase">
                  Size Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  autoFocus
                  value={sizeModal.value}
                  onChange={(e) =>
                    setSizeModal({ ...sizeModal, value: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSize()}
                  placeholder="e.g. 15, 2.5ct, Large"
                />
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  className="btn btn-light btn-sm fw-bold px-3"
                  onClick={() => setSizeModal({ ...sizeModal, show: false })}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm fw-bold px-3 shadow-sm"
                  onClick={handleSaveSize}
                >
                  {sizeModal.mode === "add" ? "Create" : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end gap-3 mb-5">
        <button className="btn btn-outline-secondary px-5">Discard</button>
        <button className="btn btn-success btn-lg px-5 shadow">
          <Save size={20} className="me-2" /> Save Full Product
        </button>
      </div>
    </div>
  );
};

export default AddProductDesign;

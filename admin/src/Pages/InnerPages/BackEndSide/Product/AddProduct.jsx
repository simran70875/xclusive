import axios from "axios";
import Modal from "react-modal";
import Select from "react-select";
import ReactQuill from "react-quill";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Trash2,
  Plus,
  Copy,
  Gem,
  Layers,
  Image as ImageIcon,
  Briefcase,
  Upload,
  CheckCircle,
  EllipsisVertical,
} from "lucide-react";

import defualtImage from "../../../../resources/assets/images/add-image.png";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

const AddProduct = () => {
  // variation
  const url = process.env.REACT_APP_API_URL;
  const adminToken = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: adminToken,
      "Content-Type": "application/json",
    },
  };
  const Navigate = useNavigate();

  // product
  const [productName, setProductName] = useState("");

  const [productImages, setProductImages] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [data, setData] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [description, setDescription] = useState("");
  const [productAddStatus, setProductAddStatus] = useState();
  const [statusMessage, setStatusMessage] = useState("");

  const [metalTypes, setMetalTypes] = useState([
    "",
    "Gold",
    "Silver",
    "Platinum",
  ]);
  const [metalTypeInput, setMetalTypeInput] = useState("");

  const [purities, setPurities] = useState([
    "",
    "9k",
    "14k",
    "18k",
    "22k",
    "24k",
  ]);
  const [metalPurityInput, setMetalPurityInput] = useState("");

  const [diamondTypes, setDiamondTypes] = useState([
    "",
    "Diamond",
    "Sapphire",
    "Ruby",
    "Emerald",
  ]);
  const [diamondTypeInput, setDiamondTypeInput] = useState("");

  const [metalSizesList, setMetalSizesList] = useState(["", "11"]);
  const [metalSizeInput, setMetalSizeInput] = useState("");

  const [diamondRates, setDiamondRates] = useState();
  const [metalRates, setMetalRates] = useState();

  const [allProductImages, setAllProductImages] = useState([]);
  const fetchDiamondRates = async () => {
    try {
      const res = await axios.get(`${url}/diamond`, axiosConfig);
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setDiamondRates(data);
    } catch (error) {
      console.error("Failed to fetch diamond rates", error);
      setDiamondRates([]);
    }
  };
  const fetchMetalPrices = async () => {
    try {
      const response = await axios.get(`${url}/metal`, axiosConfig);
      const metalsArray = response.data.data || response.data;
      setMetalRates(metalsArray);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProductImages = async () => {
    try {
      const res = await axios.get(`${url}/product/get-all-images`, axiosConfig);
      const data = Array.isArray(res.data) ? res.data : res.data.data;
      setAllProductImages(data?.product);
    } catch (error) {
      console.error("Failed to fetch images", error);
      setAllProductImages([]);
    }
  };

  useEffect(() => {
    fetchMetalPrices();
    fetchDiamondRates();
    fetchProductImages();
  }, []);

  function getMetalMaster(metalType, metalRates) {
    return metalRates?.find(
      (m) => m.metalName.toLowerCase() === metalType.toLowerCase(),
    );
  }

  function parsePurity(purity) {
    return Number(String(purity).replace("k", ""));
  }

  function calculateMetalPriceFrontend(metalComponent, metalRates) {
    const master = getMetalMaster(metalComponent.metalType, metalRates);
    if (!master) return { rate: 0, cost: 0 };

    const purity = parsePurity(metalComponent.purity);
    const weight = Number(metalComponent.weight || 0);

    const purityFactor = purity / master.basePurity;
    const ratePerGram = master.baseRate * purityFactor;
    const cost = ratePerGram * weight;

    return {
      rate: Number(ratePerGram.toFixed(2)),
      cost: Number(cost.toFixed(2)),
    };
  }

  function findRoundDiamondMaster(mmSize, diamondRates) {
    return diamondRates?.find(
      (d) =>
        d.shape === "round" &&
        d.mmFrom <= mmSize &&
        d.mmTo >= mmSize &&
        d.active,
    );
  }

  function calculateRoundDiamondFrontend(component, diamondRates) {
    const { mmSize, stones } = component;

    if (!mmSize || !stones) return null;

    const master = findRoundDiamondMaster(mmSize, diamondRates);
    if (!master) return null;

    const avgCaratPerStone =
      (master.caratWeightFrom + master.caratWeightTo) / 2;

    const totalCrt = avgCaratPerStone * Number(stones);

    // ✅ normalize master quality keys
    const normalizedRates = {};
    Object.entries(master.qualityRates || {}).forEach(([k, v]) => {
      normalizedRates[k.toLowerCase().trim()] = v;
    });

    // ✅ DIRECTLY CREATE qualityVariants (NO MAPPING)
    const qualityVariants = Object.entries(normalizedRates).map(
      ([qualityKey, rate]) => ({
        quality: qualityKey, // lab_vvs_vs
        pricePerCrt: rate, // 100
        finalPrice: Number((rate * totalCrt).toFixed(2)),
        active: true,
      }),
    );

    return {
      avgCaratPerStone: Number(avgCaratPerStone.toFixed(4)),
      totalCrt: Number(totalCrt.toFixed(3)),
      qualityVariants, // 🔥 PUSHED DIRECTLY
    };
  }

  // --- MODAL STATE ---
  const [showImageModal, setShowImageModal] = useState(false);
  const [tempUploadedImages, setTempUploadedImages] = useState([]);
  const [tempSelectedImages, setTempSelectedImages] = useState([]);
  const [modalTab, setModalTab] = useState("upload"); // "upload" or "library"

  function createNewVariationObject(id, name) {
    return {
      tempId: id, // frontend only
      variationName: name,
      variationStock: "Available",
      variationImages: [],
      existingImages: [],

      diamondInvolved: false,

      metalSizes: ["11"]?.map((s) => ({
        _uiId: "m-" + crypto.randomUUID(),
        sizeLabel: metalSizesList.find((ms) => ms === s),
        active: true,
        metalComponents: [
          {
            metalType: "Gold",
            purity: 18,
            size: s,
            weight: 0,
          },
        ],
        metalCharges: {
          labour: 0,
          making: 0,
        },
      })),

      diamondSizes: ["0.5", "10", "1.5"]?.map((s) => ({
        _uiId: "d-" + crypto.randomUUID(),
        sizeLabel: s,
        active: true,
        diamondComponents: [
          {
            type: "Diamond",
            shape: "Round",
            mmSize: 0,
            stones: 0,
            qualityVariants: diamondRates?.find((d) => d.shape === "round")
              ? Object.keys(
                  diamondRates.find((d) => d.shape === "round").qualityRates,
                ).map((q) => ({
                  quality: q,
                  active: true,
                  pricePerCrt: 0,
                  finalPrice: 0,
                }))
              : [],
          },
        ],
        diamondCharges: {
          labour: 0,
          making: 0,
        },
      })),
    };
  }

  const [variations, setVariations] = useState([
    createNewVariationObject("v-1", "Yellow Gold"),
  ]);

  useEffect(() => {
    console.log("variations ", variations);
  }, [variations]);

  const [activeVarId, setActiveVarId] = useState("v-1");
  const [activeMetalSizeId, setActiveMetalSizeId] = useState(
    variations[0].metalSizes[0]._uiId,
  );
  const [activeDiamondSizeId, setActiveDiamondSizeId] = useState(
    variations[0].diamondSizes[0]._uiId,
  );

  const currentVar =
    variations.find((v) => v.tempId === activeVarId) || variations[0];
  const currentMetalSize =
    currentVar.metalSizes.find((s) => s._uiId === activeMetalSizeId) ||
    currentVar.metalSizes[0];

  const MetalTotalCost = () => {
    {
      return (
        currentMetalSize?.metalComponents?.reduce(
          (acc, m) => acc + Number(m.weight || 0) * Number(m.rate || 0),
          0,
        ) +
        (Number(currentMetalSize?.metalCharges?.labour) || 0) +
        (Number(currentMetalSize?.metalCharges?.making) || 0)
      )?.toFixed(2);
    }
  };

  const currentDiamondSize =
    currentVar.diamondSizes.find((s) => s._uiId === activeDiamondSizeId) ||
    currentVar.diamondSizes[0];

  const [qualityCost, setQualityCost] = useState(0);
  const QualityTotalCost = (
    (Number(qualityCost) || 0) +
    (Number(currentDiamondSize?.diamondCharges?.labour) || 0) +
    (Number(currentDiamondSize?.diamondCharges?.making) || 0)
  ).toFixed(2);

  const totalProductCost =
    (Number(MetalTotalCost()) || 0) + (Number(QualityTotalCost) || 0);

  // --- CALCULATION LOGIC ---
  const calculateTotal = (data) => {
    return data.map((v) => {
      // Always calculate based on FIRST active size
      const metalSize =
        v.metalSizes?.find((s) => s.active) || v.metalSizes?.[0];
      const diamondSize =
        v.diamondSizes?.find((s) => s.active) || v.diamondSizes?.[0];

      /* ---------------- METAL ---------------- */
      const metalSubtotal =
        metalSize?.metalComponents?.reduce(
          (acc, m) => acc + Number(m.weight || 0) * Number(m.rate || 0),
          0,
        ) || 0;

      const metalTotal =
        metalSubtotal +
        Number(metalSize?.metalCharges?.labour || 0) +
        Number(metalSize?.metalCharges?.making || 0);

      /* ---------------- DIAMOND ---------------- */
      let diamondTotal = 0;

      if (v.diamondInvolved && diamondSize) {
        const diamondSubtotal =
          diamondSize.diamondComponents?.reduce(
            (acc, d) => acc + (d.calculatedQualities?.[0]?.finalPrice || 0),
            0,
          ) || 0;

        diamondTotal =
          diamondSubtotal +
          Number(diamondSize.diamondCharges?.labour || 0) +
          Number(diamondSize.diamondCharges?.making || 0);
      }

      return {
        ...v,
        finalPrice: metalTotal + diamondTotal,
      };
    });
  };

  // --- VARIATION ACTIONS ---
  const handleAddVariation = () => {
    const id = "v-" + Date.now();
    const newVar = createNewVariationObject(id, "New Variation");

    setVariations((prev) => calculateTotal([...prev, newVar]));
    setActiveVarId(id);
  };

  const handleDuplicateVariation = (variation) => {
    const newId = "v-" + Date.now();
    const duplicated = JSON.parse(JSON.stringify(variation));

    duplicated.tempId = newId;
    duplicated.variationName = `${variation.variationName} (Copy)`;

    setVariations((prev) => calculateTotal([...prev, duplicated]));
    setActiveVarId(newId);
  };

  const handleDeleteVariation = (tempId, e) => {
    e.stopPropagation();

    if (variations.length === 1) {
      alert("At least one variation is required.");
      return;
    }

    const filtered = variations.filter((v) => v.tempId !== tempId);
    setVariations(calculateTotal(filtered));

    if (activeVarId === tempId && filtered.length) {
      setActiveVarId(filtered[0].tempId);
      setActiveMetalSizeId(filtered[0].metalSizes[0]._uiId);
      setActiveDiamondSizeId(filtered[0].diamondSizes[0]._uiId);
    }
  };

  const updateField = (field, value) => {
    setVariations((prev) =>
      calculateTotal(
        prev.map((v) => {
          if (v.tempId !== activeVarId) return v;

          if (field === "diamondInvolved" && value === true) {
            return {
              ...v,
              diamondInvolved: true,
              diamondSizes:
                v.diamondSizes?.length > 0
                  ? v.diamondSizes
                  : [
                      {
                        _uiId: "d-" + crypto.randomUUID(),
                        sizeLabel: "Default",
                        active: true,
                        diamondComponents: [
                          {
                            type: "Diamond",
                            shape: "Round",
                            mmSize: 0,
                            stones: 0,
                            qualityVariants: diamondRates?.find(
                              (d) => d.shape === "round",
                            )
                              ? Object.keys(
                                  diamondRates.find((d) => d.shape === "round")
                                    .qualityRates,
                                ).map((q) => ({
                                  quality: q,
                                  active: true,
                                  pricePerCrt: 0,
                                  finalPrice: 0,
                                }))
                              : [],
                          },
                        ],
                        diamondCharges: {
                          labour: 0,
                          making: 0,
                        },
                      },
                    ],
            };
          }

          return { ...v, [field]: value };
        }),
      ),
    );
  };

  // Update updateComponent to handle rate changes and recalculate totals
  const updateComponent = (type, index, field, value) => {
    setVariations((prev) =>
      calculateTotal(
        prev.map((v) => {
          if (v.tempId !== activeVarId) return v;

          const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
          const compKey =
            type === "metal" ? "metalComponents" : "diamondComponents";

          const activeId =
            type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

          return {
            ...v,
            [sizeKey]: v[sizeKey].map((s) => {
              if (s._uiId !== activeId) return s;

              return {
                ...s,
                [compKey]: s[compKey].map((row, i) => {
                  if (i !== index) return row;

                  let updatedRow = {
                    ...row,
                    [field]: isNaN(value) ? value : Number(value),
                  };

                  // 🔥 METAL AUTO PRICE
                  if (type === "metal") {
                    const { rate, cost } = calculateMetalPriceFrontend(
                      updatedRow,
                      metalRates,
                    );

                    updatedRow.rate = rate;
                    updatedRow.cost = cost;
                  }

                  const shape =
                    typeof updatedRow.shape === "string"
                      ? updatedRow.shape.trim().toLowerCase()
                      : "";

                  // 🔥 DIAMOND AUTO CALC (ROUND ONLY)
                  if (updatedRow?.shape !== "" && shape === "round") {
                    const calc = calculateRoundDiamondFrontend(
                      updatedRow,
                      diamondRates,
                    );

                    if (calc) {
                      updatedRow.avgCaratPerStone = calc.avgCaratPerStone;
                      updatedRow.totalCrt = calc.totalCrt;

                      // 🔥 THIS IS THE KEY
                      updatedRow.qualityVariants = calc.qualityVariants;
                    }
                  }

                  return updatedRow;
                }),
              };
            }),
          };
        }),
      ),
    );
  };

  // --- SIZE CRUD ACTIONS ---
  const handleDuplicateSize = (type, sizeObj) => {
    const newId = `${type === "metal" ? "m-" : "d-"}+${crypto.randomUUID()}`;
    const duplicatedSize = {
      ...JSON.parse(JSON.stringify(sizeObj)),
      _uiId: newId,
      sizeLabel: sizeObj.sizeLabel + " (Copy)",
    };

    const updated = variations?.map((v) =>
      v.tempId === activeVarId
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

    const updated = variations?.map((v) => {
      if (v.tempId === activeVarId) {
        const filtered = v[key].filter((s) => s._uiId !== sizeId);
        return { ...v, [key]: filtered };
      }
      return v;
    });

    setVariations(calculateTotal(updated));
    // Switch active tab if we deleted the current one
    const remaining = updated.find((v) => v.tempId === activeVarId)[key];
    if (type === "metal" && activeMetalSizeId === sizeId)
      setActiveMetalSizeId(remaining[0].id);
    if (type === "diamond" && activeDiamondSizeId === sizeId)
      setActiveDiamondSizeId(remaining[0].id);
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
      const newUiId = `${type === "metal" ? "m" : "d"}-${crypto.randomUUID()}`;

      const newSizeObj =
        type === "metal"
          ? {
              _uiId: newUiId,
              sizeLabel: value,
              active: true,
              metalComponents: [
                {
                  metalType: "Gold",
                  purity: 18,
                  size: value,
                  weight: 0,
                  rate: 0,
                },
              ],
              metalCharges: {
                labour: 0,
                making: 0,
              },
            }
          : {
              _uiId: newUiId,
              sizeLabel: value,
              active: true,
              diamondComponents: [
                {
                  type: "Diamond",
                  shape: "Round",
                  mmSize: 0,
                  stones: 0,
                  totalCrt: 0,
                  rate: 0,
                },
              ],
              diamondCharges: {
                labour: 0,
                making: 0,
              },
            };

      setVariations((prev) =>
        prev.map((v) =>
          v.tempId === activeVarId
            ? {
                ...v,
                [type === "metal" ? "metalSizes" : "diamondSizes"]: [
                  ...v[type === "metal" ? "metalSizes" : "diamondSizes"],
                  newSizeObj,
                ],
              }
            : v,
        ),
      );

      if (type === "metal") setActiveMetalSizeId(newUiId);
      else setActiveDiamondSizeId(newUiId);
    } else {
      // EDIT MODE (Rename only)
      const key = type === "metal" ? "metalSizes" : "diamondSizes";

      setVariations((prev) =>
        prev.map((v) =>
          v.tempId === activeVarId
            ? {
                ...v,
                [key]: v[key].map((s) =>
                  s._uiId === id ? { ...s, sizeLabel: value } : s,
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
    setVariations((prev) =>
      prev.map((v) => {
        if (v.tempId !== activeVarId) return v;

        const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
        const activeId =
          type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

        return {
          ...v,
          [sizeKey]: v[sizeKey].map((s) => {
            if (s._uiId !== activeId) return s;

            if (type === "metal") {
              return {
                ...s,
                metalComponents: [
                  ...s.metalComponents,
                  {
                    metalType: "Gold",
                    purity: 18,
                    size: s.sizeLabel,
                    weight: 0,
                    rate: 0,
                  },
                ],
              };
            }

            return {
              ...s,
              diamondComponents: [
                ...s.diamondComponents,
                {
                  type: "Diamond",
                  shape: "Round",
                  mmSize: 0,
                  stones: 0,
                  totalCrt: 0,
                  rate: 0,
                },
              ],
            };
          }),
        };
      }),
    );
  };

  const handleDeleteComponentRow = (type, index) => {
    setVariations((prev) =>
      prev.map((v) => {
        if (v.tempId !== activeVarId) return v;

        const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
        const activeId =
          type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

        return {
          ...v,
          [sizeKey]: v[sizeKey].map((s) => {
            if (s._uiId !== activeId) return s;

            const compKey =
              type === "metal" ? "metalComponents" : "diamondComponents";

            if (s[compKey].length <= 1) return s; // keep at least one row

            return {
              ...s,
              [compKey]: s[compKey].filter((_, i) => i !== index),
            };
          }),
        };
      }),
    );
  };

  const updateSizeField = (type, field, value) => {
    const sizeKey = type === "metal" ? "metalSizes" : "diamondSizes";
    const activeId = type === "metal" ? activeMetalSizeId : activeDiamondSizeId;

    setVariations((prev) =>
      prev.map((v) => {
        if (v.tempId !== activeVarId) return v;

        return {
          ...v,
          [sizeKey]: v[sizeKey].map((s) => {
            if (s._uiId !== activeId) return s;

            if (type === "metal") {
              return {
                ...s,
                metalCharges: {
                  ...s.metalCharges,
                  [field]: Number(value),
                },
              };
            }

            return {
              ...s,
              diamondCharges: {
                ...s.diamondCharges,
                [field]: Number(value),
              },
            };
          }),
        };
      }),
    );
  };

  useEffect(() => {
    Modal.setAppElement(document.body); // Set the appElement to document.body
  }, []);

  function buildVariationPayload(v) {
    return {
      variationName: v.variationName,
      variationStock: v.variationStock,
      diamondInvolved: v.diamondInvolved,

      metalSizes: v.metalSizes?.map((s) => ({
        sizeLabel: s.sizeLabel,
        active: s.active,
        metalComponents: s.metalComponents,
        metalCharges: s.metalCharges,
      })),

      diamondSizes: v.diamondSizes?.map((s) => ({
        sizeLabel: s.sizeLabel,
        active: s.active,
        diamondComponents: s.diamondComponents,
        diamondCharges: s.diamondCharges,
      })),

      existingImages: v.existingImages,
    };
  }

  const hasVariationImages = (v) => {
    return (
      (v.variationImages && v.variationImages.length > 0) ||
      (v.existingImages && v.existingImages.length > 0)
    );
  };

  const isValidDiamond = (diamondSizes = []) => {
    return diamondSizes.every((size) =>
      size.diamondComponents?.every(
        (d) =>
          d.shape &&
          Number(d.mmSize) > 0 &&
          Number(d.stones) > 0 &&
          d.qualityVariants?.length > 0,
      ),
    );
  };

  const isValidMetal = (metalSizes = []) => {
    return metalSizes.every((size) =>
      size.metalComponents?.every(
        (m) =>
          m.metalType && m.purity && Number(m.weight) > 0 && size.sizeLabel,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 PRODUCT VALIDATION
    if (!productName.trim()) {
      return alert("Product name is required");
    }

    if (!productImages || productImages.length === 0) {
      return alert("Please add at least one product image");
    }

    if (!variations || variations.length === 0) {
      return alert("Please add at least one variation");
    }

    // 🔹 VARIATION VALIDATION
    for (const v of variations) {
      if (!v.variationName) {
        return alert("Variation name is required");
      }

      if (!hasVariationImages(v)) {
        return alert(
          `Variation "${v.variationName}" must have at least one image`,
        );
      }

      if (!isValidMetal(v.metalSizes)) {
        return alert(`Invalid metal details in variation "${v.variationName}"`);
      }

      if (v.diamondInvolved && !isValidDiamond(v.diamondSizes)) {
        return alert(
          `Invalid diamond details in variation "${v.variationName}"`,
        );
      }
    }

    // 🔹 IF ALL VALID → PROCEED
    try {
      const formData = new FormData();
      formData.append("Product_Name", productName);

      productImages.forEach((img) => {
        formData.append("images", img);
      });

      formData.append("Category", selectedCategories.value);
      if (selectedBrand?.dataId)
        formData.append("Brand_Name", selectedBrand.dataId);

      formData.append("Collection_Name", selectedCollection?.dataId);
      formData.append("Description", description);

      const response = await axios.post(`${url}/product/add`, formData, {
        headers: { Authorization: adminToken },
      });

      const productId = response?.data?.data?.productId;
      if (!productId) throw new Error("Product ID missing");

      // 🔹 CREATE VARIATIONS
      for (const v of variations) {
        const payload = buildVariationPayload(v);
        const fd = new FormData();

        fd.append("variationName", payload.variationName);
        fd.append("variationStock", payload.variationStock);
        fd.append("diamondInvolved", payload.diamondInvolved);
        fd.append("metalSizes", JSON.stringify(payload.metalSizes));
        fd.append("diamondSizes", JSON.stringify(payload.diamondSizes));
        fd.append("existingImages", JSON.stringify(payload.existingImages));

        v.variationImages?.forEach((img) => {
          fd.append("images", img);
        });

        await axios.post(`${url}/product/variation/add/${productId}`, fd, {
          headers: { Authorization: adminToken },
        });
      }

      Navigate("/showProduct");
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductAddStatus("");
      setStatusMessage("");
      let alertBox = document?.getElementById("alert-box");
      alertBox?.classList?.remove("alert-wrapper");
    }, 1500);

    return () => clearTimeout(timer);
  }, [productAddStatus, statusMessage]);

  useEffect(() => {
    // Fetch category data from your API
    async function fetchCategoryData() {
      try {
        const response = await axios.get(`${url}/category/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });

        const options = response?.data?.category?.map((option) => ({
          value: option._id,
          label:
            option.Category_Name.charAt(0).toUpperCase() +
            option.Category_Name.slice(1),
        }));

        setCategoryOptions(options);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchCategoryData();
  }, []);

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions);
  };

  // get all brand , collections
  useEffect(() => {
    async function fetchData() {
      try {
        const Response = await axios.get(`${url}/data/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        setData(Response?.data?.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    }
    fetchData();
  }, []);

  // Filter data for each data type
  const brandData = data?.filter((option) => option?.Data_Type === "Brand");
  const collectionsData = data?.filter(
    (option) => option?.Data_Type === "Collection",
  );

  const brandOptions = brandData?.map((option) => {
    return {
      dataId: option?._id,
      label:
        option?.Data_Name?.charAt(0)?.toUpperCase() +
        option?.Data_Name?.slice(1),
    };
  });

  const collectionOptions = collectionsData?.map((option) => {
    return {
      dataId: option?._id,
      label:
        option?.Data_Name?.charAt(0)?.toUpperCase() +
        option?.Data_Name?.slice(1),
    };
  });

  // custom style for react quill
  const customStyles = {
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "white" : "white",
      color: state.isSelected ? "black" : "black",
      ":hover": {
        backgroundColor: "#e6f7ff",
      },
    }),
  };

  //  for react quill (long desc)
  const editor = useRef();

  const handleTextChange = (value) => {
    setDescription(value);
  };

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
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Add Product</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <form>
                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Product Name:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={productName}
                            onChange={(e) => {
                              setProductName(e.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Category Name:
                        </label>
                        <div className="col-md-10">
                          <Select
                            name="categories"
                            value={selectedCategories}
                            onChange={handleCategoryChange}
                            options={categoryOptions}
                            placeholder="Select Categories"
                            className="w-full md:w-20rem"
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Brand Name:
                        </label>
                        <div className="col-md-10">
                          <Select
                            name="brands"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e)}
                            options={brandOptions}
                            styles={customStyles}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Collection :
                        </label>
                        <div className="col-md-10">
                          <Select
                            name="collections"
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e)}
                            options={collectionOptions}
                            styles={customStyles}
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Long Description:
                        </label>
                        <div className="col-md-10">
                          <ReactQuill
                            ref={editor}
                            value={description}
                            onChange={handleTextChange}
                            modules={editorModules}
                            className="custom-quill-editor"
                          />
                        </div>
                      </div>

                      <div className="mb-3 row">
                        <label
                          htmlFor="example-text-input"
                          className="col-md-2 col-form-label"
                        >
                          Product Images:
                          <div className="imageSize">
                            (Recommended Resolution: W-971 X H-1500, W-1295 X
                            H-2000, W-1618 X H-2500)
                          </div>
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="file"
                            multiple
                            onChange={(e) => {
                              setProductImages([...e.target.files]);
                            }}
                            id="example-text-input"
                          />
                          <div
                            className="fileupload_img col-md-10 mt-3"
                            style={{ display: "flex", gap: "10px" }}
                          >
                            {productImages.length > 0 ? (
                              productImages?.map((img, i) => (
                                <img
                                  key={i}
                                  src={URL.createObjectURL(img)}
                                  alt="product"
                                  height={100}
                                  style={{ objectFit: "cover", width: "auto" }}
                                />
                              ))
                            ) : (
                              <img
                                src={defualtImage}
                                height={100}
                                width={100}
                                alt="default"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* 2. VARIATIONS CARD */}
                        <div className="card shadow-sm border-0 mb-4">
                          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-primary fw-bold">
                              <Briefcase className="me-2" />
                              Pricing Variations
                            </h5>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={handleAddVariation}
                            >
                              <Plus size={16} className="me-1" /> Add Variation
                            </button>
                          </div>

                          {/* VARIATION TABS */}
                          <div className="p-3 bg-white border-bottom">
                            <ul className="nav nav-tabs border-0">
                              {variations?.map((v) => (
                                <li className="nav-item" key={v.tempId}>
                                  <div
                                    className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeVarId === v.tempId ? "active bg-primary text-white shadow-sm" : "text-secondary bg-light"}`}
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "5px",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                    onClick={() => {
                                      setActiveVarId(v.tempId);
                                      setActiveMetalSizeId(
                                        v.metalSizes[0]._uiId,
                                      );
                                      setActiveDiamondSizeId(
                                        v.diamondSizes[0].id,
                                      );
                                    }}
                                  >
                                    {v.variationName}
                                    <div className="d-flex gap-1 ms-2">
                                      <Copy
                                        size={14}
                                        className={
                                          activeVarId === v.tempId
                                            ? "text-white-50"
                                            : "text-primary"
                                        }
                                        onClick={(e) =>
                                          handleDuplicateVariation(v, e)
                                        }
                                      />
                                      <Trash2
                                        size={14}
                                        className={
                                          activeVarId === v.tempId
                                            ? "text-white-50"
                                            : "text-danger"
                                        }
                                        onClick={(e) =>
                                          handleDeleteVariation(v.tempId, e)
                                        }
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
                                  onChange={(e) =>
                                    updateField("variationName", e.target.value)
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                className="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2"
                                onClick={() => {
                                  setTempUploadedImages([
                                    ...currentVar.variationImages,
                                  ]);
                                  setTempSelectedImages([
                                    ...currentVar.existingImages,
                                  ]);
                                  setShowImageModal(true);
                                }}
                              >
                                <ImageIcon size={18} /> Manage Variation Images
                                ({currentVar.variationImages.length})
                              </button>
                            </div>

                            <div className="d-flex gap-2 mt-2 flex-wrap">
                              {/* Existing Images */}
                              {currentVar.existingImages?.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.url}
                                  height={50}
                                  className="rounded border"
                                />
                              ))}

                              {/* Newly Uploaded */}
                              {currentVar.variationImages?.map((img, i) => (
                                <img
                                  key={i}
                                  src={URL.createObjectURL(img)}
                                  height={50}
                                  className="rounded border"
                                />
                              ))}
                            </div>

                            {/* METAL SECTION */}
                            <div className="mb-5">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <h6 className="fw-bold mb-0 text-dark">
                                  <Layers
                                    size={18}
                                    className="me-2 text-muted"
                                  />
                                  METAL COMPONENTS
                                </h6>
                                <div className="d-flex gap-2 bg-light p-1 rounded border">
                                  {currentVar.metalSizes?.map((s) => (
                                    <div
                                      key={s._uiId}
                                      className={`btn-group btn-group-sm shadow-sm ${activeMetalSizeId === s._uiId ? "ring-primary" : ""}`}
                                    >
                                      <button
                                        type="button"
                                        className={`btn ${activeMetalSizeId === s._uiId ? "btn-dark" : "btn-white border"}`}
                                        onClick={() =>
                                          setActiveMetalSizeId(s._uiId)
                                        }
                                      >
                                        {s.sizeLabel}
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-white border dropdown-toggle dropdown-toggle-split"
                                        data-bs-toggle="dropdown"
                                      >
                                        <EllipsisVertical size={12} />
                                      </button>
                                      <ul className="dropdown-menu shadow-sm">
                                        <li>
                                          <button
                                            type="button"
                                            className="dropdown-item small"
                                            onClick={() =>
                                              openSizeModal(
                                                "metal",
                                                "edit",
                                                s._uiId,
                                                s.sizeLabel,
                                              )
                                            }
                                          >
                                            Edit Name
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            type="button"
                                            className="dropdown-item small"
                                            onClick={() =>
                                              handleDuplicateSize("metal", s)
                                            }
                                          >
                                            Duplicate
                                          </button>
                                        </li>
                                        <li>
                                          <hr className="dropdown-divider" />
                                        </li>
                                        <li>
                                          <button
                                            type="button"
                                            className="dropdown-item small text-danger"
                                            onClick={(e) =>
                                              handleDeleteSize(
                                                "metal",
                                                s._uiId,
                                                e,
                                              )
                                            }
                                          >
                                            Delete
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm rounded-circle"
                                    onClick={() =>
                                      openSizeModal("metal", "add")
                                    }
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>
                              </div>

                              <table className="table table-bordered align-middle shadow-sm">
                                {/* The 'table-striped' class is omitted to keep all rows the same color */}
                                <thead className="table-light small text-uppercase">
                                  <tr>
                                    <th>
                                      Metal Type{" "}
                                      <div className="d-flex gap-2 mt-1">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Add Metal Type"
                                          value={metalTypeInput}
                                          onChange={(e) =>
                                            setMetalTypeInput(e.target.value)
                                          }
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-success"
                                          onClick={() => {
                                            if (!metalTypeInput.trim()) return;

                                            // prevent duplicates
                                            if (
                                              metalTypes.includes(
                                                metalTypeInput,
                                              )
                                            )
                                              return;

                                            setMetalTypes((prev) => [
                                              ...prev,
                                              metalTypeInput,
                                            ]);
                                            setMetalTypeInput("");
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </th>
                                    <th>
                                      Purity{" "}
                                      <div className="d-flex gap-2 mt-1">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Add Purity"
                                          value={metalPurityInput}
                                          onChange={(e) =>
                                            setMetalPurityInput(e.target.value)
                                          }
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-success"
                                          onClick={() => {
                                            if (!metalPurityInput.trim())
                                              return;

                                            // prevent duplicates
                                            if (
                                              purities.includes(
                                                metalPurityInput,
                                              )
                                            )
                                              return;

                                            setPurities((prev) => [
                                              ...prev,
                                              metalPurityInput,
                                            ]);
                                            setMetalPurityInput("");
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </th>

                                    <th>
                                      Size / Length
                                      <div className="d-flex gap-2 mt-1">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          placeholder="Add size"
                                          value={metalSizeInput}
                                          onChange={(e) =>
                                            setMetalSizeInput(e.target.value)
                                          }
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-success"
                                          onClick={() => {
                                            if (!metalSizeInput.trim()) return;

                                            // prevent duplicates
                                            if (
                                              metalSizesList.includes(
                                                metalSizeInput,
                                              )
                                            )
                                              return;

                                            setMetalSizesList((prev) => [
                                              ...prev,
                                              metalSizeInput,
                                            ]);
                                            setMetalSizeInput("");
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </th>

                                    <th>Weight (g)</th>
                                    <th>Rate/g</th>
                                    <th className="text-end">Cost</th>
                                    <th
                                      className="text-center"
                                      style={{ width: "50px" }}
                                    >
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white">
                                  {currentMetalSize?.metalComponents?.map(
                                    (m, idx) => (
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
                                            {metalTypes?.map((o) => (
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
                                            {purities?.map((o) => (
                                              <option key={o}>{o}</option>
                                            ))}
                                          </select>
                                        </td>
                                        <td>
                                          <select
                                            className="form-select form-select-sm"
                                            value={m.size}
                                            onChange={(e) =>
                                              updateComponent(
                                                "metal",
                                                idx,
                                                "size",
                                                e.target.value,
                                              )
                                            }
                                          >
                                            {metalSizesList?.map((o) => (
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
                                          <span className="fw-bold">
                                            £{m.rate}
                                          </span>
                                        </td>
                                        <td className="text-end fw-bold">
                                          £
                                          {(
                                            Number(m.weight || 0) *
                                            Number(m.rate || 0)
                                          ).toFixed(2)}
                                        </td>
                                        <td className="text-center">
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm border-0"
                                            onClick={() =>
                                              handleDeleteComponentRow(
                                                "metal",
                                                idx,
                                              )
                                            }
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                                <tfoot>
                                  {/* ADD NEW ROW SECTION */}
                                  <tr>
                                    <td
                                      colSpan="7"
                                      className="p-2 border-0 bg-white"
                                    >
                                      <button
                                        type="button"
                                        className="btn btn-link btn-sm text-decoration-none fw-bold p-0"
                                        style={{ color: "#ff4d4d" }}
                                        onClick={() =>
                                          handleAddComponentRow("metal")
                                        }
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
                                      £
                                      {currentMetalSize?.metalComponents
                                        ?.reduce(
                                          (acc, m) =>
                                            acc +
                                            Number(m.weight || 0) *
                                              Number(m.rate || 0),
                                          0,
                                        )
                                        .toFixed(2)}
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
                                        value={
                                          currentMetalSize?.metalCharges?.labour
                                        }
                                        onChange={(e) =>
                                          updateSizeField(
                                            "metal",
                                            "labour",
                                            e.target.value,
                                          )
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
                                        value={
                                          currentMetalSize?.metalCharges?.making
                                        }
                                        onChange={(e) =>
                                          updateSizeField(
                                            "metal",
                                            "making",
                                            e.target.value,
                                          )
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
                                      £{MetalTotalCost()}
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
                                checked={currentVar.diamondInvolved}
                                onChange={(e) =>
                                  updateField(
                                    "diamondInvolved",
                                    e.target.checked,
                                  )
                                }
                              />
                              <label className="form-check-label fw-bold text-primary">
                                Involve Diamond Components?
                              </label>
                            </div>

                            {currentVar.diamondInvolved && (
                              <div className="animate__animated animate__fadeIn mb-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <h6 className="fw-bold mb-0 text-info">
                                    <Gem size={18} className="me-2" />
                                    DIAMOND COMPONENTS
                                  </h6>
                                  <div className="d-flex gap-2 bg-light p-1 rounded border">
                                    {currentVar.diamondSizes?.map((s) => (
                                      <div
                                        key={s._uiId}
                                        className={`btn-group btn-group-sm shadow-sm`}
                                      >
                                        <button
                                          type="button"
                                          className={`btn ${activeDiamondSizeId === s._uiId ? "btn-info text-white" : "btn-white border text-info"}`}
                                          onClick={() =>
                                            setActiveDiamondSizeId(s._uiId)
                                          }
                                        >
                                          {s.sizeLabel}
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-white border dropdown-toggle dropdown-toggle-split text-info"
                                          data-bs-toggle="dropdown"
                                        >
                                          <EllipsisVertical size={12} />
                                        </button>
                                        <ul className="dropdown-menu shadow-sm">
                                          <li>
                                            <button
                                              type="button"
                                              className="dropdown-item small"
                                              onClick={() =>
                                                openSizeModal(
                                                  "diamond",
                                                  "edit",
                                                  s._uiId,
                                                  s.sizeLabel,
                                                )
                                              }
                                            >
                                              Edit Name
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              type="button"
                                              className="dropdown-item small"
                                              onClick={() =>
                                                handleDuplicateSize(
                                                  "diamond",
                                                  s,
                                                )
                                              }
                                            >
                                              Duplicate
                                            </button>
                                          </li>
                                          <li>
                                            <hr className="dropdown-divider" />
                                          </li>
                                          <li>
                                            <button
                                              type="button"
                                              className="dropdown-item small text-danger"
                                              onClick={(e) =>
                                                handleDeleteSize(
                                                  "diamond",
                                                  s._uiId,
                                                  e,
                                                )
                                              }
                                            >
                                              Delete
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      className="btn btn-outline-info btn-sm rounded-circle"
                                      onClick={() =>
                                        openSizeModal("diamond", "add")
                                      }
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                </div>
                                <table className="table table-bordered align-middle shadow-sm">
                                  <thead className="table-light small text-uppercase">
                                    <tr>
                                      <th>
                                        Type{" "}
                                        <div className="d-flex gap-2 mt-1">
                                          <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Add Type"
                                            value={diamondTypeInput}
                                            onChange={(e) =>
                                              setDiamondTypeInput(
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-success"
                                            onClick={() => {
                                              if (!diamondTypeInput.trim())
                                                return;

                                              // prevent duplicates
                                              if (
                                                diamondTypes.includes(
                                                  diamondTypeInput,
                                                )
                                              )
                                                return;

                                              setDiamondTypes((prev) => [
                                                ...prev,
                                                diamondTypeInput,
                                              ]);
                                              setDiamondTypeInput("");
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </th>
                                      <th>Shape</th>
                                      <th>mm</th>
                                      <th>No. Stones</th>
                                      <th>Average</th>
                                      <th>Total Crt</th>
                                      <th style={{ width: "100px" }}>
                                        Qualities
                                      </th>

                                      {/* <th className="text-end">Cost</th> */}
                                      <th
                                        className="text-center"
                                        style={{ width: "50px" }}
                                      >
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {currentDiamondSize.diamondComponents?.map(
                                      (d, idx) => (
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
                                              {diamondTypes?.map((o) => (
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
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              className="form-control form-control-sm"
                                              value={d.mmSize}
                                              onChange={(e) =>
                                                updateComponent(
                                                  "diamond",
                                                  idx,
                                                  "mmSize",
                                                  parseFloat(e.target.value) ||
                                                    0,
                                                )
                                              }
                                            />
                                          </td>
                                          <td>
                                            <input
                                              type="number"
                                              className="form-control form-control-sm"
                                              value={d.stones}
                                              onChange={(e) =>
                                                updateComponent(
                                                  "diamond",
                                                  idx,
                                                  "stones",
                                                  e.target.value,
                                                )
                                              }
                                            />
                                          </td>
                                          <td>
                                            {d.avgCaratPerStone?.toFixed(4)}
                                          </td>
                                          <td style={{ width: "100px" }}>
                                            {d.totalCrt?.toFixed(3)}
                                          </td>
                                          <td style={{ width: "250px" }}>
                                            <div className="row g-2">
                                              {d.qualityVariants?.map(
                                                (q, qIdx) => (
                                                  <div
                                                    className="col-6 cursor-pointer"
                                                    key={qIdx}
                                                    onClick={() => {
                                                      setQualityCost(
                                                        q.finalPrice,
                                                      );
                                                    }}
                                                  >
                                                    <div
                                                      className="border border-light rounded p-2 h-100"
                                                      style={{
                                                        backgroundColor:
                                                          "#fafafa",
                                                      }}
                                                    >
                                                      <strong className="d-block small text-dark">
                                                        {q.quality}
                                                      </strong>

                                                      <small className="text-muted d-block">
                                                        Per Ct: £{q.pricePerCrt}
                                                      </small>

                                                      <small className="fw-semibold d-block text-success">
                                                        Total: £{q.finalPrice}
                                                      </small>
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </td>

                                          <td className="text-center">
                                            <button
                                              type="button"
                                              className="btn btn-outline-danger btn-sm border-0"
                                              onClick={() =>
                                                handleDeleteComponentRow(
                                                  "diamond",
                                                  idx,
                                                )
                                              }
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                    {/* ADD NEW ROW SECTION */}
                                    <tr>
                                      <td
                                        colSpan="7"
                                        className="p-2 border-0 bg-white"
                                      >
                                        <button
                                          type="button"
                                          className="btn btn-link btn-sm text-decoration-none fw-bold p-0"
                                          style={{ color: "#ff4d4d" }}
                                          onClick={() =>
                                            handleAddComponentRow("diamond")
                                          }
                                        >
                                          + Add new
                                        </button>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* PRICING CHARGES */}
                            <div className="row justify-content-end mt-4">
                              <div className="col-md-4 bg-light text-dark p-3 rounded shadow">
                                <div className="d-flex justify-content-between fw-bold fs-5 border-top text-warning">
                                  <span>Total Price</span>
                                  <span>£{totalProductCost}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* --- IMAGE MANAGEMENT MODAL --- */}
                        {showImageModal && (
                          <div
                            className="modal d-block"
                            style={{
                              backgroundColor: "rgba(0,0,0,0.5)",
                              zIndex: 1050,
                            }}
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
                                      type="button"
                                      className={`flex-fill py-3 border-0 transition-all ${modalTab === "upload" ? "bg-white fw-bold border-bottom border-primary border-3 text-primary" : "text-muted bg-light"}`}
                                      onClick={() => setModalTab("upload")}
                                    >
                                      <Upload size={18} className="me-2" />{" "}
                                      Upload New Variation Images
                                    </button>
                                    <button
                                      type="button"
                                      className={`flex-fill py-3 border-0 transition-all ${modalTab === "library" ? "bg-white fw-bold border-bottom border-primary border-3 text-primary" : "text-muted bg-light"}`}
                                      onClick={() => setModalTab("library")}
                                    >
                                      <CheckCircle size={18} className="me-2" />{" "}
                                      Select from Media Library
                                    </button>
                                  </div>

                                  <div
                                    className="p-4"
                                    style={{ minHeight: "300px" }}
                                  >
                                    {modalTab === "upload" ? (
                                      <div className="text-center border-2 border-dashed rounded p-5 bg-light">
                                        <Upload
                                          size={40}
                                          className="text-muted mb-3"
                                        />
                                        <h5>Drag and drop images here</h5>
                                        <p className="text-muted small">
                                          Only JPG, PNG files supported
                                        </p>
                                        <input
                                          type="file"
                                          className="form-control w-50 mx-auto mt-3"
                                          multiple
                                          onChange={(e) => {
                                            const files = Array.from(
                                              e.target.files,
                                            );
                                            setTempUploadedImages((prev) => [
                                              ...prev,
                                              ...files,
                                            ]);
                                          }}
                                        />
                                        <div className="d-flex gap-2 mt-3 flex-wrap justify-content-center">
                                          {tempUploadedImages.map((img, i) => (
                                            <div
                                              key={i}
                                              className="position-relative"
                                            >
                                              <img
                                                src={URL.createObjectURL(img)}
                                                height={70}
                                                className="rounded border"
                                              />
                                              <button
                                                type="button"
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                onClick={() =>
                                                  setTempUploadedImages(
                                                    (prev) =>
                                                      prev.filter(
                                                        (_, idx) => idx !== i,
                                                      ),
                                                  )
                                                }
                                              >
                                                ×
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="text-muted small mb-3">
                                          Showing images uploaded in 'General
                                          Product Information'
                                        </p>
                                        <div className="row g-3">
                                          {allProductImages?.map((img) => (
                                            <div className="col-3" key={img}>
                                              <div className="position-relative border rounded p-1 hover-shadow cursor-pointer">
                                                <img
                                                  src={img.url}
                                                  alt="prod"
                                                  className="img-fluid rounded"
                                                />
                                                <input
                                                  type="checkbox"
                                                  checked={tempSelectedImages.some(
                                                    (x) =>
                                                      x.filename ===
                                                      img.filename,
                                                  )}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setTempSelectedImages(
                                                        (prev) => [
                                                          ...prev,
                                                          img,
                                                        ],
                                                      );
                                                    } else {
                                                      setTempSelectedImages(
                                                        (prev) =>
                                                          prev.filter(
                                                            (x) =>
                                                              x.filename !==
                                                              img.filename,
                                                          ),
                                                      );
                                                    }
                                                  }}
                                                  className="position-absolute top-0 end-0 m-2 shadow"
                                                  style={{
                                                    width: "20px",
                                                    height: "20px",
                                                  }}
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
                                    type="button"
                                    className="btn btn-secondary px-4"
                                    onClick={() => setShowImageModal(false)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary px-4 shadow-sm"
                                    onClick={() => {
                                      setVariations((prev) =>
                                        prev.map((v) =>
                                          v.tempId === activeVarId
                                            ? {
                                                ...v,
                                                variationImages:
                                                  tempUploadedImages,
                                                existingImages:
                                                  tempSelectedImages,
                                              }
                                            : v,
                                        ),
                                      );
                                      setShowImageModal(false);
                                    }}
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
                                    {sizeModal.mode === "add"
                                      ? "Add New Size"
                                      : "Rename Size"}
                                  </h6>
                                  <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                      setSizeModal({
                                        ...sizeModal,
                                        show: false,
                                      })
                                    }
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
                                      setSizeModal({
                                        ...sizeModal,
                                        value: e.target.value,
                                      })
                                    }
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSaveSize()
                                    }
                                    placeholder="e.g. 15, 2.5ct, Large"
                                  />
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                  <button
                                    type="button"
                                    className="btn btn-light btn-sm fw-bold px-3"
                                    onClick={() =>
                                      setSizeModal({
                                        ...sizeModal,
                                        show: false,
                                      })
                                    }
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm fw-bold px-3 shadow-sm"
                                    onClick={handleSaveSize}
                                  >
                                    {sizeModal.mode === "add"
                                      ? "Create"
                                      : "Update"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-3 row">
                        <div className="col-md-10 offset-md-2">
                          <div className="row mb-10">
                            <div className="col ms-auto">
                              <div className="d-flex flex-reverse flex-wrap gap-2">
                                <a
                                  className="btn btn-danger"
                                  onClick={() => Navigate("/showProduct")}
                                >
                                  {" "}
                                  <i className="fas fa-window-close"></i>{" "}
                                  Cancel{" "}
                                </a>
                                <button
                                  type="button"
                                  className="btn btn-success"
                                  onClick={handleSubmit}
                                >
                                  {" "}
                                  <i className="fas fa-save"></i> Save{" "}
                                </button>
                              </div>
                            </div>
                          </div>
                          <AlertBox
                            status={productAddStatus}
                            statusMessage={statusMessage}
                          />
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
    </>
  );
};

export default AddProduct;

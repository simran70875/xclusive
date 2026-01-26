import { useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Select from "react-select";
import { useSelector } from "react-redux";
import AlertBox from "../../../../Components/AlertComp/AlertBox";
import Modal from "react-modal";

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

let url = process.env.REACT_APP_API_URL;

const EditProduct = () => {
  const adminToken = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: adminToken,
      "Content-Type": "application/json",
    },
  };
  const Navigate = useNavigate();
  const selectedProductData = useSelector(
    (state) => state?.ProductDataChange?.payload,
  );

  const [productData, setProductData] = useState({});
  const [productName, setProductName] = useState("");
  const [SKUCode, setSKUCode] = useState("");
  const [productImage, setProductImage] = useState();
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [data, setData] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [description, setDescription] = useState("");
  const [productAddStatus, setProductAddStatus] = useState();
  const [statusMessage, setStatusMessage] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [variations, setVariations] = useState();

  const [activeVarId, setActiveVarId] = useState();
  const [activeMetalSizeId, setActiveMetalSizeId] = useState();
  const [activeDiamondSizeId, setActiveDiamondSizeId] = useState();

  const currentVar = variations?.find((v) => v?._id === activeVarId);
  const currentMetalSize =
    currentVar?.metalSizes?.find((s) => s._uiId === activeMetalSizeId) ||
    currentVar?.metalSizes[0];

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
    currentVar?.diamondSizes?.find((s) => s._uiId === activeDiamondSizeId) ||
    currentVar?.diamondSizes[0];

  const [qualityCost, setQualityCost] = useState(0);
  const QualityTotalCost = (
    (Number(qualityCost) || 0) +
    (Number(currentDiamondSize?.diamondCharges?.labour) || 0) +
    (Number(currentDiamondSize?.diamondCharges?.making) || 0)
  ).toFixed(2);

  const totalProductCost =
    (Number(MetalTotalCost()) || 0) + (Number(QualityTotalCost) || 0);

  useEffect(() => {
    console.log("variations ", variations);
  }, [variations]);

  useEffect(() => {
    async function getProduct() {
      try {
        const res = await axios.get(
          `${url}/product/get/${selectedProductData?._id}`,
          {
            headers: {
              Authorization: `${adminToken}`,
            },
          },
        );
        setProductData(res?.data?.products || {});
      } catch (error) {
        console.log(error);
      }
    }
    getProduct();
  }, [selectedProductData]);

  useEffect(() => {
    setProductName(productData?.Product_Name);
    setSKUCode(productData?.SKU_Code);
    setDescription(productData?.Description || "");

    if (Array.isArray(productData?.Category)) {
      const selectedCategoriesIds = productData.Category.map((category) => ({
        value: category?._id,
        label: category?.Category_Name,
      }));
      setSelectedCategories(selectedCategoriesIds);
    }

    setSelectedBrand(
      brandOptions?.find((b) => b.dataId === productData?.Brand_Name?._id),
    );

    setSelectedCollection({
      dataId: productData?.Collections?._id,
      label: productData?.Collections?.Collections,
    });

    setPreviewImages(productData?.Product_Images || []);
    const productVariation = productData?.Variation;
    setVariations(productVariation);
  }, [productData]);

  useEffect(() => {
    if (variations) {
      setActiveVarId(variations[0]?._id);
      setActiveMetalSizeId(variations[0]?.metalSizes[0]?._uiId);
      setActiveDiamondSizeId(variations[0]?.diamondSizes[0]?._uiId);
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("Product_Name", productName);
      formData.append("SKU_Code", SKUCode.trim().toUpperCase());

      /* ---------- NEW IMAGES ---------- */
      productImage?.forEach((img) => {
        formData.append("images", img);
      });

      /* ---------- OLD IMAGES ---------- */
      formData.append("existingImages", JSON.stringify(previewImages));

      /* ---------- CATEGORY ---------- */
      selectedCategories.forEach((cat) => {
        formData.append("Category[]", cat.value);
      });

      if (selectedBrand?.dataId) {
        formData.append("Brand_Name", selectedBrand.dataId);
      }

      if (selectedCollection?.dataId) {
        formData.append("Collections", selectedCollection.dataId);
      }

      formData.append("Description", description);

      const response = await axios.patch(
        `${url}/product/update/${selectedProductData?._id}`,
        formData,
        {
          headers: {
            Authorization: adminToken,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.type === "success") {
        setProductAddStatus("success");
        setStatusMessage("Product updated successfully");
        Navigate("/showProduct");
      }
    } catch (err) {
      console.error(err);
      setProductAddStatus("error");
      setStatusMessage("Product not updated!");
    } finally {
      setIsSubmitting(false);
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

  // get all category
  useEffect(() => {
    async function fetchCategoryData() {
      try {
        const categoryResponse = await axios.get(`${url}/category/get`, {
          headers: {
            Authorization: `${adminToken}`,
          },
        });
        const options = categoryResponse?.data?.category?.map((option) => ({
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

  // get all brand ,collections
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

  const removeOldImage = (index) => {
    const updated = [...previewImages];
    updated.splice(index, 1);
    setPreviewImages(updated);
  };

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

  function calculateDiamondDerived(diamondRow, diamondRates) {
    const { shape, mmSize, stones, selectedQuality } = diamondRow;

    if (!shape || shape.toLowerCase() !== "round" || !mmSize || !stones) {
      return null;
    }

    const master = findRoundDiamondMaster(mmSize, diamondRates);
    if (!master) return null;

    const avgCaratPerStone =
      (master.caratWeightFrom + master.caratWeightTo) / 2;

    const totalCrt = avgCaratPerStone * Number(stones);

    // normalize qualities
    const normalizedRates = {};
    Object.entries(master.qualityRates || {}).forEach(([k, v]) => {
      normalizedRates[k.toLowerCase().trim()] = v;
    });

    const qualityVariants = Object.entries(normalizedRates).map(
      ([quality, rate]) => ({
        quality,
        pricePerCrt: rate,
        finalPrice: Number((rate * totalCrt).toFixed(2)),
        active: quality === selectedQuality,
      }),
    );

    const selected =
      qualityVariants.find((q) => q.active) || qualityVariants[0];

    return {
      avgCaratPerStone: Number(avgCaratPerStone.toFixed(4)),
      totalCrt: Number(totalCrt.toFixed(3)),
      qualityVariants,
      selectedFinalPrice: selected?.finalPrice || 0,
    };
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
      _id: id, // frontend only
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

  // --- CALCULATION LOGIC ---
  const calculateTotal = (data) => {
    return data.map((v) => {
      // Always calculate based on FIRST active size
      const metalSize =
        v?.metalSizes?.find((s) => s.active) || v?.metalSizes?.[0];
      const diamondSize =
        v?.diamondSizes?.find((s) => s.active) || v?.diamondSizes?.[0];

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

      if (v?.diamondInvolved && diamondSize) {
        const diamondSubtotal =
          diamondSize.diamondComponents?.reduce(
            (acc, d) => acc + (d.qualityVariants?.[0]?.finalPrice || 0),
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

    duplicated._id = newId;
    duplicated.variationName = `${variation.variationName} (Copy)`;

    setVariations((prev) => calculateTotal([...prev, duplicated]));
    setActiveVarId(newId);
  };

  const handleDeleteVariation = (_id, e) => {
    e.stopPropagation();

    if (variations.length === 1) {
      alert("At least one variation is required.");
      return;
    }

    const filtered = variations.filter((v) => v?._id !== _id);
    setVariations(calculateTotal(filtered));

    if (activeVarId === _id && filtered.length) {
      setActiveVarId(filtered[0]._id);
      setActiveMetalSizeId(filtered[0].metalSizes[0]._uiId);
      setActiveDiamondSizeId(filtered[0].diamondSizes[0]._uiId);
    }
  };

  const updateField = (field, value) => {
    setVariations((prev) =>
      calculateTotal(
        prev.map((v) => {
          if (v?._id !== activeVarId) return v;

          if (field === "diamondInvolved" && value === true) {
            return {
              ...v,
              diamondInvolved: true,
              diamondSizes:
                v?.diamondSizes?.length > 0
                  ? v?.diamondSizes
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
          if (v?._id !== activeVarId) return v;

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
      v?._id === activeVarId
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
      if (v?._id === activeVarId) {
        const filtered = v[key].filter((s) => s._uiId !== sizeId);
        return { ...v, [key]: filtered };
      }
      return v;
    });

    setVariations(calculateTotal(updated));
    // Switch active tab if we deleted the current one
    const remaining = updated.find((v) => v?._id === activeVarId)[key];
    if (type === "metal" && activeMetalSizeId === sizeId)
      setActiveMetalSizeId(remaining[0]._uiId);
    if (type === "diamond" && activeDiamondSizeId === sizeId)
      setActiveDiamondSizeId(remaining[0]._uiId);
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
          v?._id === activeVarId
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
          v?._id === activeVarId
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
        if (v?._id !== activeVarId) return v;

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
        if (v?._id !== activeVarId) return v;

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
        if (v?._id !== activeVarId) return v;

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
      variationName: v?.variationName,
      variationStock: v?.variationStock,
      diamondInvolved: v?.diamondInvolved,

      metalSizes: v?.metalSizes?.map((s) => ({
        sizeLabel: s.sizeLabel,
        active: s.active,
        metalComponents: s.metalComponents,
        metalCharges: s.metalCharges,
      })),

      diamondSizes: v?.diamondSizes?.map((s) => ({
        sizeLabel: s.sizeLabel,
        active: s.active,
        diamondComponents: s.diamondComponents,
        diamondCharges: s.diamondCharges,
      })),

      existingImages: v?.existingImages,
    };
  }

  const hasVariationImages = (v) => {
    return (
      (v?.variationImages && v?.variationImages.length > 0) ||
      (v?.existingImages && v?.existingImages.length > 0)
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

  const getPreviewSrc = (img) => {
    if (img instanceof File) return URL.createObjectURL(img);
    if (img?.url) return img.url;
    if (img?.path) return `${process.env.REACT_APP_API_URL}/${img.path}`;
    return "";
  };

  useEffect(() => {
    if (!variations || !diamondRates?.length) return;

    setVariations((prev) =>
      prev.map((v) => {
        if (!v.diamondInvolved) return v;

        return {
          ...v,
          diamondSizes: v.diamondSizes.map((size) => ({
            ...size,
            diamondComponents: size.diamondComponents.map((d) => {
              if (
                typeof d.shape === "string" &&
                d.shape.toLowerCase() === "round" &&
                Number(d.mmSize) > 0 &&
                Number(d.stones) > 0
              ) {
                const calc = calculateRoundDiamondFrontend(d, diamondRates);
                if (calc) {
                  return {
                    ...d,
                    avgCaratPerStone: calc.avgCaratPerStone,
                    totalCrt: calc.totalCrt,
                    qualityVariants: calc.qualityVariants,
                  };
                }
              }
              return d;
            }),
          })),
        };
      }),
    );
  }, [diamondRates]);

  return (
    <>
      <div className="main-content">
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box d-flex align-items-center justify-content-between">
                  <h4 className="mb-0">Edit Product</h4>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
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
                          SKU Code:
                        </label>
                        <div className="col-md-10">
                          <input
                            required
                            className="form-control"
                            type="text"
                            id="example-text-input"
                            value={SKUCode}
                            onChange={(e) => {
                              setSKUCode(e.target.value);
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
                            required
                            value={selectedCategories} // Change this to selectedCategories
                            onChange={(selectedOptions) => {
                              setSelectedCategories(selectedOptions); // Change this to setSelectedCategories
                            }}
                            options={categoryOptions}
                            styles={customStyles}
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
                        <label className="col-md-2 col-form-label">
                          Product Images:
                          <div className="imageSize">
                            (W-971 X H-1500, W-1295 X H-2000, W-1618 X H-2500)
                          </div>
                        </label>

                        <div className="col-md-10">
                          {/* --- Upload New Images --- */}
                          <input
                            className="form-control"
                            type="file"
                            multiple
                            onChange={(e) => {
                              setProductImage(Array.from(e.target.files));
                            }}
                          />

                          {/* --- Preview Existing Images --- */}
                          <div className="fileupload_img col-md-10 mt-3 d-flex gap-2 flex-wrap">
                            {previewImages?.map((image, index) => (
                              <div key={index} style={{ position: "relative" }}>
                                <img
                                  src={`${process.env.REACT_APP_API_URL}/${image.path}`}
                                  alt="product"
                                  height={100}
                                  width={100}
                                  style={{ borderRadius: 6 }}
                                />

                                {/* Remove old image */}
                                <button
                                  type="button"
                                  onClick={() => removeOldImage(index)}
                                  style={{
                                    position: "absolute",
                                    top: -8,
                                    right: -8,
                                    background: "red",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: 22,
                                    height: 22,
                                    cursor: "pointer",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}

                            {/* --- Preview Newly Added Images --- */}
                            {productImage?.map((file, index) => {
                              if (!(file instanceof File)) return null;

                              return (
                                <img
                                  key={index}
                                  src={URL.createObjectURL(file)}
                                  height={100}
                                  width={100}
                                  style={{ borderRadius: 6 }}
                                  alt="new"
                                />
                              );
                            })}
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
                                <li className="nav-item" key={v?._id}>
                                  <div
                                    className={`nav-link fw-bold d-flex align-items-center gap-2 ${activeVarId === v?._id ? "active bg-primary text-white shadow-sm" : "text-secondary bg-light"}`}
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "5px",
                                      borderRadius: "8px 8px 0 0",
                                    }}
                                    onClick={() => {
                                      setActiveVarId(v?._id);
                                      setActiveMetalSizeId(
                                        v?.metalSizes[0]._uiId,
                                      );
                                      setActiveDiamondSizeId(
                                        v?.diamondSizes[0]._uiId,
                                      );
                                    }}
                                  >
                                    {v?.variationName}
                                    <div className="d-flex gap-1 ms-2">
                                      <Copy
                                        size={14}
                                        className={
                                          activeVarId === v?._id
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
                                          activeVarId === v?._id
                                            ? "text-white-50"
                                            : "text-danger"
                                        }
                                        onClick={(e) =>
                                          handleDeleteVariation(v?._id, e)
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
                                  value={currentVar?.variationName}
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
                                    ...currentVar?.variationImages,
                                  ]);
                                  setTempSelectedImages([
                                    ...currentVar?.existingImages,
                                  ]);
                                  setShowImageModal(true);
                                }}
                              >
                                <ImageIcon size={18} /> Manage Variation Images
                                ({currentVar?.variationImages.length})
                              </button>
                            </div>

                            <div className="d-flex gap-2 mt-2 flex-wrap">
                              {/* Existing Images */}
                              {currentVar?.existingImages?.map((img, i) => (
                                <img
                                  key={i}
                                  src={img.url}
                                  height={50}
                                  className="rounded border"
                                />
                              ))}

                              {/* Newly Uploaded */}
                              {currentVar?.variationImages?.map((img, i) => {
                                if (!(img instanceof File)) return null;

                                return (
                                  <img
                                    key={i}
                                    src={URL.createObjectURL(img)}
                                    height={50}
                                    className="rounded border"
                                    alt="variation"
                                  />
                                );
                              })}
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
                                  {currentVar?.metalSizes?.map((s) => (
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
                                        {(() => {
                                          const { rate, cost } =
                                            calculateMetalPriceFrontend(
                                              m,
                                              metalRates,
                                            );

                                          return (
                                            <>
                                              <td>
                                                <span className="fw-bold">
                                                  £{rate}
                                                </span>
                                              </td>
                                              <td className="text-end fw-bold">
                                                £{cost}
                                              </td>
                                            </>
                                          );
                                        })()}

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
                                checked={currentVar?.diamondInvolved}
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

                            {currentVar?.diamondInvolved && (
                              <div className="animate__animated animate__fadeIn mb-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <h6 className="fw-bold mb-0 text-info">
                                    <Gem size={18} className="me-2" />
                                    DIAMOND COMPONENTS
                                  </h6>
                                  <div className="d-flex gap-2 bg-light p-1 rounded border">
                                    {currentVar?.diamondSizes?.map((s) => (
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
                                          {(() => {
                                            const derived =
                                              calculateDiamondDerived(
                                                d,
                                                diamondRates,
                                              );
                                            if (!derived) return null;

                                            return (
                                              <>
                                                <td>
                                                  {derived.avgCaratPerStone.toFixed(
                                                    4,
                                                  )}
                                                </td>
                                                <td>
                                                  {derived.totalCrt.toFixed(3)}
                                                </td>
                                                <td style={{ width: "250px" }}>
                                                  <div className="row g-2">
                                                    {derived.qualityVariants.map(
                                                      (q, qIdx) => (
                                                        <div
                                                          key={qIdx}
                                                          className="col-6"
                                                          onClick={() =>
                                                            updateComponent(
                                                              "diamond",
                                                              idx,
                                                              "selectedQuality",
                                                              q.quality,
                                                            )
                                                          }
                                                        >
                                                          <div
                                                            className={`border rounded p-2 ${
                                                              q.active
                                                                ? "border-success bg-light"
                                                                : "border-light"
                                                            }`}
                                                          >
                                                            <strong className="small">
                                                              {q.quality}
                                                            </strong>
                                                            <div className="small text-muted">
                                                              Per Ct: £
                                                              {q.pricePerCrt}
                                                            </div>
                                                            <div className="fw-bold text-success">
                                                              £{q.finalPrice}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      ),
                                                    )}
                                                  </div>
                                                </td>
                                              </>
                                            );
                                          })()}

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
                                    Manage Images: {currentVar?.variationName}
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
                                          {tempUploadedImages.map((img, i) => {
                                            if (!(img instanceof File))
                                              return null;
                                            return (
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
                                            );
                                          })}
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
                                          v?._id === activeVarId
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
                                  className="btn btn-success"
                                  type="submit"
                                >
                                  {" "}
                                  <i className="fas fa-save"></i> Save{" "}
                                </button>
                              </div>
                            </div>
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
        <AlertBox status={productAddStatus} statusMessage={statusMessage} />
      </div>
    </>
  );
};

export default EditProduct;

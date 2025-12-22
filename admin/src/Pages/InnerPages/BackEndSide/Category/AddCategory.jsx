import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Select from "react-select/creatable";
import defualtImage from "../../../../resources/assets/images/add-image.png";
import AlertBox from "../../../../Components/AlertComp/AlertBox";

let url = process.env.REACT_APP_API_URL;

const AddCategory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Receive categories passed via Navigate
  const passedCategories = location?.state || [];

  // Flatten categories to get all possible parent options
  const flattenCategories = (categories) => {
    const result = [];
    const traverse = (cats) => {
      cats.forEach((cat) => {
        result.push({ value: cat._id, label: cat.Category_Name });
        if (cat.children && cat.children.length > 0) {
          traverse(cat.children);
        }
      });
    };
    traverse(categories);
    return result;
  };

  const categoryOptions = flattenCategories(passedCategories);

  // Form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [categorySecImage, setCategorySecImage] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [categoryAddStatus, setCategoryAddStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleCategoryChange = (selected) => {
    setSelectedParent(selected ? selected.value : null);
  };

  const getCategoryLabel = () => {
    if (!selectedParent) {
      return "Main"; // No parent selected
    }

    // Find the selected parent in passedCategories
    const findParentDepth = (categories, parentId, depth = 1) => {
      for (const cat of categories) {
        if (cat._id === parentId) return depth;
        if (cat.children && cat.children.length) {
          const childDepth = findParentDepth(cat.children, parentId, depth + 1);
          if (childDepth) return childDepth;
        }
      }
      return null;
    };

    const depth = findParentDepth(passedCategories, selectedParent);

    if (depth === 1) return "Sub Category";
    if (depth === 2) return "Sub Sub Category";
    return "Sub Category"; // fallback
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryName || !categoryImage) {
      setCategoryAddStatus("error");
      setStatusMessage("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("Category_Name", categoryName);
    formData.append("image", categoryImage);
    formData.append("secImage", categorySecImage);
    formData.append("Category_Label", getCategoryLabel());
    if (selectedParent) formData.append("Parent_Category", selectedParent);

    try {
      const adminToken = localStorage.getItem("token");
      const response = await axios.post(`${url}/category/add`, formData, {
        headers: { Authorization: `${adminToken}` },
      });

      if (response.data.type === "success") {
        setCategoryAddStatus(response.data.type);
        setStatusMessage(response.data.message);

        // Reset form
        setCategoryName("");
        setCategoryImage(null);
        setCategorySecImage(null);
        setSelectedParent(null);

        setTimeout(() => navigate("/showCategory"), 900);
      } else {
        setCategoryAddStatus(response.data.type);
        setStatusMessage(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setCategoryAddStatus("error");
      setStatusMessage("Category not added!");
    }
  };

  // Auto-hide alert
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategoryAddStatus("");
      setStatusMessage("");
    }, 1500);

    return () => clearTimeout(timer);
  }, [categoryAddStatus, statusMessage]);

  return (
    <div className="main-content dark">
      <div className="page-content">
        <div className="container-fluid">
          <h4 className="mb-4">Add Category</h4>
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {/* Category Name */}
                <div className="mb-3 row">
                  <label className="col-md-2 col-form-label">
                    Category Name:
                  </label>
                  <div className="col-md-10">
                    <input
                      required
                      className="form-control"
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Parent Category */}
                <div className="mb-3 row">
                  <label className="col-md-2 col-form-label">
                    Parent Category:
                  </label>
                  <div className="col-md-10">
                    <Select
                      name="parentCategory"
                      value={
                        categoryOptions.find(
                          (opt) => opt.value === selectedParent
                        ) || null
                      }
                      onChange={handleCategoryChange}
                      options={categoryOptions}
                      isClearable
                      placeholder="Select Parent Category"
                      className="w-full md:w-20rem"
                    />
                    <small className="text-muted">
                      Leave empty if this is a top-level category
                    </small>
                  </div>
                </div>

                {/* Primary Image */}
                <div className="mb-3 row">
                  <label className="col-md-2 col-form-label">
                    Category Image:
                    <div className="imageSize">(Recommended: 1000x1000)</div>
                  </label>
                  <div className="col-md-10">
                    <input
                      required
                      className="form-control"
                      type="file"
                      onChange={(e) => setCategoryImage(e.target.files[0])}
                    />
                    <div className="fileupload_img col-md-10 mt-3">
                      <img
                        src={
                          categoryImage
                            ? URL.createObjectURL(categoryImage)
                            : defualtImage
                        }
                        alt="category"
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Image */}
                <div className="mb-3 row">
                  <label className="col-md-2 col-form-label">
                    Secondary Category Image:
                    <div className="imageSize">(Recommended: 856x200)</div>
                  </label>
                  <div className="col-md-10">
                    <input
                      className="form-control"
                      type="file"
                      onChange={(e) => setCategorySecImage(e.target.files[0])}
                    />
                    <div className="fileupload_img col-md-10 mt-3">
                      <img
                        src={
                          categorySecImage
                            ? URL.createObjectURL(categorySecImage)
                            : defualtImage
                        }
                        alt="category"
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="row mb-10">
                  <div className="col ms-auto">
                    <div className="d-flex flex-reverse flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => navigate("/showCategory")}
                      >
                        <i className="fas fa-window-close"></i> Cancel
                      </button>
                      <button type="submit" className="btn btn-success">
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
      <AlertBox status={categoryAddStatus} statusMessage={statusMessage} />
    </div>
  );
};

export default AddCategory;

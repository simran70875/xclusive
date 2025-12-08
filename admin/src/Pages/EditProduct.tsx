import { useEffect, useState } from "react";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import Select from "../components/form/input/SelectField";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS } from "../utils/config";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useCategoryData } from "../hooks/useCategoryData";
import { useBrandData } from "../hooks/useBrandData";
import { useLocation, useNavigate } from "react-router";
import { useProductDetail } from "../hooks/useProductDetail";

export interface ProductFormData {
    _id?: string;
    Code: string;
    Description: string;
    Pack: number;
    rrp: number;
    GrpSupplier: string;
    GrpSupplierCode: string;
    Manufacturer: string;
    ManufacturerCode: string;
    ISPCCombined: number;
    VATCode: number;
    Brand: {
        _id: string;
        Brand: string;
    };
    ExtendedCharacterDesc: string;
    CatalogueCopy: string;
    ImageRef: string;
    Category1: {
        _id: string;
        Category1: string;
    };
    Category2: {
        _id: string;
        Category2: string;
        Category1: string;
    };
    Category3: {
        _id: string;
        Category3: string;
        Category1: string;
        Category2: string;
    };
    Style: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export const emptyProduct: ProductFormData = {
    Code: "",
    Description: "",
    Pack: 0,
    rrp: 0,
    GrpSupplier: "",
    GrpSupplierCode: "",
    Manufacturer: "",
    ManufacturerCode: "",
    ISPCCombined: 0,
    VATCode: 0,
    Brand: {
        _id: "",
        Brand: "",
    },
    ExtendedCharacterDesc: "",
    CatalogueCopy: "",
    ImageRef: "",
    Category1: {
        _id: "",
        Category1: "",
    },
    Category2: {
        _id: "",
        Category2: "",
        Category1: "",
    },
    Category3: {
        _id: "",
        Category3: "",
        Category1: "",
        Category2: "",
    },
    Style: "",
    isActive: true,
};



const EditProductPage = () => {
    const location = useLocation();
    const { productId } = location.state || {};
    const { product: currentProduct } = useProductDetail(productId);

    console.log("currentProduct   ", currentProduct);

    const [product, setProduct] = useState<ProductFormData>(emptyProduct);



    // Set default form values when product is fetched
    useEffect(() => {
        if (currentProduct) {
            const formattedProduct: ProductFormData = {
                ...emptyProduct,
                ...currentProduct,
            };
            setProduct(formattedProduct);
            setSelectedTopCategory(currentProduct.Category1._id);
            setSelectedSubCategory(currentProduct.Category2._id);
        }
    }, [currentProduct]);

    const handleChange = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        setProduct((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const [selectedTopCategory, setSelectedTopCategory] = useState<string | undefined>();
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>();

    const {
        categories,
        subCategories,
        subChildCategories,
    } = useCategoryData(selectedTopCategory, selectedSubCategory);


    const { brands } = useBrandData();


    const transformedProduct = {
        ...product,
        Brand: product.Brand?._id || null,
        Category1: product.Category1?._id || null,
        Category2: product.Category2?._id || null,
        Category3: product.Category3?._id || null,
    };


    const {
        loading: editLoading,
        error,
        refetch: editProductRequest,
    } = useAxios({
        url: `${API_PATHS.EDIT_PRODUCT}/${productId}`,
        method: "put",
        body: transformedProduct,
        manual: true,
    });

    const navigate = useNavigate();
    const handleSubmit = async () => {
        await editProductRequest();
        if (!error) {
            navigate("/products");
            setProduct(emptyProduct);
        }
    };

    return (
        <div className="py-6">


            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium dark:text-white">
                        Edit Product Details
                    </h2>
                </div>

                <div className="space-y-6">

                    <div className="border p-4 rounded-md shadow-sm space-y-6 bg-white dark:bg-gray-900">

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <Label>Category 1</Label>
                                <Select
                                    name="Category1"
                                    value={product.Category1?._id || ""}
                                    onChange={(val) => {
                                        if (typeof val === "string") {
                                            const selected = categories?.find((cat) => cat._id === val);
                                            if (selected) {
                                                handleChange("Category1", selected);
                                                setSelectedTopCategory(selected._id);
                                                // reset lower categories
                                                handleChange("Category2", emptyProduct.Category2);
                                                handleChange("Category3", emptyProduct.Category3);
                                            }
                                        }
                                    }}

                                    placeholder="Select Category 1"
                                    options={categories?.map((cat) => ({
                                        label: cat.Category1,
                                        value: cat._id,
                                    })) || []}
                                    searchable
                                />
                            </div>
                            <div className="flex flex-col">
                                <Label>Category 2</Label>
                                <Select
                                    name="Category2"
                                    value={product.Category2?._id || ""}
                                    onChange={(val) => {
                                        if (typeof val === "string") {
                                            const selected = subCategories?.find((cat) => cat._id === val);
                                            if (selected) {
                                                handleChange("Category2", selected);
                                                setSelectedSubCategory(selected._id);
                                                handleChange("Category3", emptyProduct.Category3); // reset
                                            }
                                        }
                                    }}
                                    placeholder="Select Category 2"
                                    options={subCategories?.map((cat) => ({
                                        label: cat.Category2,
                                        value: cat._id,
                                    })) || []}
                                    searchable
                                />

                            </div>
                            <div className="flex flex-col">
                                <Label>Category 3</Label>
                                <Select
                                    name="Category3"
                                    value={product.Category3?._id || ""}
                                    onChange={(val) => {
                                        if (typeof val === "string") {
                                            const selected = subChildCategories?.find((cat) => cat._id === val);
                                            if (selected) {
                                                handleChange("Category3", selected);
                                            }
                                        }
                                    }}
                                    placeholder="Select Category 3"
                                    options={subChildCategories?.map((cat) => ({
                                        label: cat.Category3,
                                        value: cat._id,
                                    })) || []}
                                    searchable
                                />

                            </div>
                            <div className="flex flex-col">
                                <Label>Brand</Label>
                                <Select
                                    name="Brand"
                                    value={product.Brand?._id || ""}
                                    onChange={(val) => {
                                        if (typeof val === "string") {
                                            const selected = brands?.find(item => item._id === val);
                                            if (selected) {
                                                handleChange("Brand", selected);
                                            }
                                        }
                                    }}
                                    placeholder="Select Brand"
                                    options={brands?.map((brand) => ({
                                        label: brand.Brand,
                                        value: brand._id,
                                    })) || []}
                                    searchable
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
                            {(
                                [
                                    { label: "Code", field: "Code" },
                                    { label: "Title", field: "Description" },
                                    { label: "Pack", field: "Pack" },
                                    { label: "RRP", field: "rrp" },
                                    { label: "Supplier", field: "GrpSupplier" },
                                    { label: "Supplier Code", field: "GrpSupplierCode" },
                                    { label: "Manufacturer", field: "Manufacturer" },
                                    { label: "Manufacturer Code", field: "ManufacturerCode" },
                                    { label: "ISPCCombined", field: "ISPCCombined" },
                                    { label: "VAT Code", field: "VATCode" },
                                    { label: "Extended Character Desc", field: "ExtendedCharacterDesc" },

                                    { label: "Image Ref", field: "ImageRef" },
                                    { label: "Style", field: "Style" },
                                    { label: "Description", field: "CatalogueCopy" },
                                ] as { label: string; field: keyof ProductFormData }[]
                            ).map(({ label, field }) => (
                                <div key={field}>

                                    {field === "CatalogueCopy" ? (
                                        <div className="flex flex-col col-span-full mb-10">
                                            <Label>
                                                {label}
                                                <span className="text-error-500">*</span>
                                            </Label>
                                            <ReactQuill
                                                theme="snow"
                                                value={product[field] as string}
                                                onChange={(value) => handleChange(field, value)}
                                                placeholder={`Enter ${label}`}
                                                style={{ height: "300px" }}
                                            />
                                        </div>
                                    ) : (
                                        <div key={field} className="flex flex-col">
                                            <Label>
                                                {label}
                                                <span className="text-error-500">*</span>
                                            </Label>
                                            <Input
                                                type={typeof product[field] === "number" ? "number" : "text"}
                                                value={String(product[field])}
                                                onChange={(e) =>
                                                    handleChange(
                                                        field,
                                                        typeof product[field] === "number"
                                                            ? parseFloat(e.target.value) || 0
                                                            : e.target.value
                                                    )
                                                }
                                                id={label}
                                                name={label}
                                                placeholder={`Enter ${label}`}
                                            />
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>




                    </div>

                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button onClick={() => navigate("/products")} variant="outline">
                    Cancel
                </Button>
                <Button disabled={editLoading ? true : false} onClick={handleSubmit} variant="primary" >
                    Edit Product
                </Button>
            </div>
        </div>
    );
};

export default EditProductPage;

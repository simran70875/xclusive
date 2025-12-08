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
import { useNavigate } from "react-router";

interface ProductFormData {
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
    Brand: string;
    ExtendedCharacterDesc: string;
    CatalogueCopy: string;
    ImageRef: string;
    Category1: string;
    Category2: string;
    Category3: string;
    Style: string;
    isActive: boolean;
}

const emptyProduct: ProductFormData = {
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
    Brand: "",
    ExtendedCharacterDesc: "",
    CatalogueCopy: "",
    ImageRef: "",
    Category1: "",
    Category2: "",
    Category3: "",
    Style: "",
    isActive: true,
};

const AddProductPage = () => {
    const [product, setProduct] = useState<ProductFormData[]>([emptyProduct]);

    const handleChange = <K extends keyof ProductFormData>(
        index: number,
        field: K,
        value: ProductFormData[K]
    ) => {
        const newProduct = [...product];
        newProduct[index][field] = value;
        setProduct(newProduct);
    };

    const [selectedTopCategory, setSelectedTopCategory] = useState<string | undefined>();
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | undefined>();

    const {
        categories,
        subCategories,
        subChildCategories,
    } = useCategoryData(selectedTopCategory, selectedSubCategory);
    const { brands } = useBrandData();

    useEffect(() => {
        console.log("product ==> ", product);
    }, [product])

    const {
        loading: addLoading,
        error,
        refetch: addProductRequest,
    } = useAxios({
        url: API_PATHS.ADD_PRODUCT,
        method: "post",
        body: product[0],
        manual: true,
    });

    const navigate = useNavigate();
    const handleSubmit = async () => {
        await addProductRequest();
        if (!error) {
            navigate("/products");
            setProduct([emptyProduct]);
        }
    };

    return (
        <div className="py-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-5">
                Add New Product
            </h1>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium dark:text-white">
                        Add Product Details
                    </h2>
                </div>

                <div className="space-y-6">
                    {product.map((product, index) => (
                        <div
                            key={index}
                            className="border p-4 rounded-md shadow-sm space-y-6 bg-white dark:bg-gray-900"
                        >

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex flex-col">
                                    <Label>Category 1</Label>
                                    <Select
                                        name="Category1"
                                        value={product.Category1}
                                        onChange={(val) => {
                                            if (typeof val === "string") {
                                                handleChange(index, "Category1", val);
                                                setSelectedTopCategory(val);
                                                handleChange(index, "Category2", "");
                                                handleChange(index, "Category3", "");
                                            }
                                        }}
                                        placeholder="Select Category 1"
                                        options={
                                            categories?.map((cat) => ({
                                                label: cat.Category1,
                                                value: cat._id,
                                            })) || []
                                        }
                                        searchable
                                    />

                                </div>

                                <div className="flex flex-col">
                                    <Label>Category 2</Label>


                                    <Select
                                        name="Category2"
                                        value={product.Category2}
                                        onChange={(val) => {
                                            if (typeof val === "string") {
                                                handleChange(index, "Category2", val);
                                                setSelectedSubCategory(val);
                                                handleChange(index, "Category3", "");
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
                                    <Label>Category 2</Label>

                                    <Select
                                        name="Category3"
                                        value={product.Category3}
                                        onChange={(val) => {
                                            if (typeof val === "string") {
                                                handleChange(index, "Category3", val);

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
                                        value={product.Brand}
                                        onChange={(val) => {
                                            if (typeof val === "string") {
                                                handleChange(index, "Brand", val);

                                            }
                                        }}


                                        placeholder="Select Brand"
                                        options={
                                            brands?.map((brand) => ({
                                                label: brand.Brand,
                                                value: brand._id,
                                            })) || []
                                        }
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
                                                    onChange={(value) => handleChange(index, field, value)}
                                                    placeholder={`Enter ${label}`}
                                                    style={{ height: "300px" }} // 👈 adjust height as needed
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
                                                            index,
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
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button onClick={() => setProduct([emptyProduct])} variant="outline">
                    Cancel
                </Button>
                <Button disabled={addLoading ? true : false} onClick={handleSubmit} variant="primary" >
                    Submit Product
                </Button>
            </div>
        </div>
    );
};

export default AddProductPage;

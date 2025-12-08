import { useCallback, useState } from "react";
import { Frown, Pencil, X } from "lucide-react";
import Button from "../components/ui/button/Button";
import { useAxios } from "../hooks/useAxios";
import { API_PATHS, IMAGE_URL } from "../utils/config";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";
import DropzoneComponent from "../components/form/form-elements/DropZone";
import ConfirmModal from "../components/common/ConfirmModal";
import { Switch } from "@mui/material";
import { useCategoryData } from "../hooks/useCategoryData";

interface Category {
    _id: string;
    image?: string;
    "Image Ref"?: string;
    Category1?: string;
    Category2?: string;
    Category3?: string;
    top?: boolean
}

export interface CategoryType {
    _id: string;
    Category1: string;
    icon: string;
    image: string;
    Categories2: {
        _id: string;
        label: string;
        Categories3: {
            _id: string;
            Category3: string;
        }[];
    }[];
    allCategories3: {
        _id: string;
        Category3: string;
    }[];
}

interface CategoryColumnProps {
    title: string;
    categories: Category[] | null;
    selectedParent?: string;
    categoryType?: string;
    onSelect?: (cat: { _id: string, Category: string }) => void;
    onAdd?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onMark?: () => void;
    selectedFile?: any;
    setSelectedFile?: any;
    categoryName?: string;
    setCategoryName?: (name: string) => void;
    top?: boolean;
    setTop?: (name: boolean) => void;
}

const CategoryColumn = ({
    title,
    categories,
    categoryType,
    selectedParent,
    onSelect,
    onAdd,
    onMark,
    onDelete,
    selectedFile,
    setSelectedFile,
    categoryName,
    setCategoryName,
    onEdit,
    setTop
}: CategoryColumnProps) => {


    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [deleteCategory, setDeleteCategory] = useState<any | null>(null); // the category to delete
    const [markTopCategory, setMarkTopCategory] = useState<any | null>(null);

    const isEditing = editIndex !== null;


    const handleDrop = (files: File[]) => {
        if (files.length > 0) {
            setSelectedFile(files[0]); // ✅ Real browser File
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 w-full">

            <div className="flex items-center justify-between">

                <h2 className="text-lg font-semibold mb-4">{title}</h2>

                {selectedParent && (
                    <div className="text-center text-[17px] text-gray-600 dark:text-gray-300 mb-4">
                        <span className="font-semibold text-orange-600">{selectedParent}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center mb-2">
                <input
                    type="text"
                    placeholder={`Add ${title}`}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 mr-2"
                    value={categoryName || ""}
                    onChange={(e) => setCategoryName?.(e.target.value)}
                />


                <Button onClick={() => { isEditing ? onEdit?.() : onAdd?.() }} size="sm">
                    {isEditing ? "Edit" : "Add"}
                </Button>

            </div>

            {
                categoryType != "child" && <DropzoneComponent
                    onDrop={handleDrop}
                    accept={{
                        "image/*": [".jpg", ".jpeg", ".png"],
                    }}
                    label="Upload Category Image"
                    helperText="Only .jpg, .jpeg, or .png files are supported"
                    previewFile={selectedFile}
                />
            }


            <div className="space-y-3 mt-4 pt-4 border-t">
                <p className="text-sm mb-4">Added Categories</p>
                {categories && categories.length > 0 ? categories.map((cat, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition"
                    >
                        <div
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={
                                categoryType !== 'child'
                                    ? () => {
                                        if (editIndex === i) return;
                                        onSelect?.({
                                            _id: cat._id,
                                            Category: (categoryType === "top" ? cat.Category1 : categoryType === "sub" ? cat.Category2 : cat.Category3) || ""
                                        })
                                    }
                                    : undefined
                            }
                        >
                            <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">

                                {
                                    categoryType === "child" ? <div className="w-full h-full object-cover bg-yellow-300 flex items-center justify-center uppercase text-xl">{cat.Category3 ? cat.Category3[0] : ""} </div> :
                                        <img
                                            src={cat.image?.startsWith("http")
                                                ? cat.image
                                                : `${IMAGE_URL}/${cat.image}`}
                                            alt="Category"
                                            className="w-full h-full object-cover"
                                        />
                                }

                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {categoryType === "top" ? cat.Category1 : categoryType === "sub" ? cat.Category2 : cat.Category3}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {categoryType === "top" ? "Top Category" : categoryType === "sub" ? "Sub Category" : "Child Category"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2">
                            {
                                categoryType == "top" && <div className="flex items-center">
                                    <p className="text-[10px] text-center">Mark Top: </p>
                                    <Switch
                                        checked={cat.top}
                                        onChange={() => {
                                            onSelect?.({
                                                _id: cat._id,
                                                Category: (categoryType === "top" ? cat.Category1 : categoryType === "sub" ? cat.Category2 : cat.Category3) || ""
                                            })
                                            setMarkTopCategory({
                                                ...cat, // Pass the full category including top value
                                                Category: cat.Category1 || cat.Category2 || cat.Category3 // for description
                                            });
                                        }}
                                        size="small"
                                    />
                                </div>
                            }


                            <Pencil
                                size={16}
                                className="text-gray-500 hover:text-blue-600 cursor-pointer"
                                onClick={() => {
                                    onSelect?.({
                                        _id: cat._id,
                                        Category: (categoryType === "top" ? cat.Category1 : categoryType === "sub" ? cat.Category2 : cat.Category3) || ""
                                    });
                                    setEditIndex(i);
                                    setCategoryName?.(
                                        categoryType === "top"
                                            ? cat.Category1 ?? ""
                                            : categoryType === "sub"
                                                ? cat.Category2 ?? ""
                                                : cat.Category3 ?? ""
                                    );

                                    setSelectedFile(cat.image || (IMAGE_URL + "/" + cat.image))
                                    // setImagePreview(cat.image || null);
                                    // setEditingOldName(cat.name);
                                }}
                            />
                            <X
                                size={16}
                                className="text-red-500 hover:text-red-700 cursor-pointer w-6 h-6 p-1 bg-amber-200 rounded-full"
                                onClick={() => {
                                    onSelect?.({
                                        _id: cat._id,
                                        Category: (categoryType === "top" ? cat.Category1 : categoryType === "sub" ? cat.Category2 : cat.Category3) || ""
                                    });
                                    setDeleteCategory(cat);
                                }}
                            />
                        </div>
                    </div>
                )) : <div className="flex flex-col items-center justify-center text-center p-6 py-10 rounded-2xl bg-gray-50">
                    <div className="mb-3 animate-bounce"><Frown className="w-5 h-5 text-gray-400" /> </div>
                    <h2 className="text-sm font-semibold text-gray-700">No Categories Available</h2>
                    <p className="text-sm text-gray-500 mt-1">Add a category to begin organizing.</p>
                </div>}


                {/* Confirm Delete Modal */}
                <ConfirmModal
                    open={!!deleteCategory}
                    onClose={() => setDeleteCategory(null)}
                    onConfirm={() => {
                        onDelete?.();
                        setDeleteCategory(null);
                    }}
                    title="Confirm Delete Agent"
                    description={`Are you sure you want to delete ${categoryName}?`}
                />

                <ConfirmModal
                    open={!!markTopCategory}
                    onClose={() => setMarkTopCategory(null)}
                    onConfirm={() => {
                        // Toggle the value — don't just set it to true
                        setTop?.(!markTopCategory?.top);
                        onMark?.(); // This should trigger the actual update (e.g., calling markTop())
                        setMarkTopCategory(null);
                    }}
                    title={`Confirm ${markTopCategory?.top ? 'Unmark' : 'Mark'} Top Category`}
                    description={`Are you sure you want to ${markTopCategory?.top ? 'remove' : 'mark'} "${markTopCategory?.Category1}" as a top category?`}
                />

            </div>
        </div>
    );
};


export default function ManageCategoriesPage() {
    const { adminToken } = useAuth();
    const [selectedTopCategory, setSelectedTopCategory] = useState<{ _id: string, Category: string } | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<{ _id: string, Category: string } | null>(null);
    const [selectedSubChildCategory, setSelectedSubChildCategory] = useState<{ _id: string, Category: string } | null>(null);

    const {
        categories,
        subCategories,
        subChildCategories,
        // loadingCategories,
        // loadingSubCategories,
        // loadingSubChildCategories,
        refetch,
        subCategoriesRefetch,
        subChildCategoriesRefetch,
    } = useCategoryData(selectedTopCategory?._id, selectedSubCategory?._id);

    const [top, setTop] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState<{
        top: File | null;
        sub: File | null;
        child: File | null;
    }>({
        top: null,
        sub: null,
        child: null,
    });


    const getSelectedFile = (type: 'top' | 'sub' | 'child') => selectedFiles[type];

    const setFileForType = (type: 'top' | 'sub' | 'child', file: File | null) => {
        setSelectedFiles((prev) => ({
            ...prev,
            [type]: file,
        }));
    };

    const [topCategoryName, setTopCategoryName] = useState<string>("");
    const [subCategoryName, setSubCategoryName] = useState<string>("");
    const [subChildCategoryName, setSubChildCategoryName] = useState<string>("");

    // //get all users
    // const {
    //     data: categories,
    //     refetch,
    // } = useAxios<CategoryType[]>({
    //     url: `${API_PATHS.CATEGORIES}`,
    //     method: "get",
    // });

    // //get all sub categories
    // const {
    //     data: subCategories,
    //     refetch: subCategoriesRefetch,
    // } = useAxios<CategoryType[]>({
    //     url: selectedTopCategory ? `${API_PATHS.SUB_CATEGORIES}?Category1=${selectedTopCategory?._id}` : API_PATHS.SUB_CATEGORIES,
    //     method: "get",
    // });

    // //get all sub chils categories
    // const {
    //     data: subChildCategories,
    //     refetch: subChildCategoriesRefetch,
    // } = useAxios<CategoryType[]>({
    //     url: selectedSubCategory ? `${API_PATHS.SUB_CHILD_CATEGORIES}?Category2=${selectedSubCategory?._id}` : API_PATHS.SUB_CHILD_CATEGORIES,
    //     method: "get",
    // });

    // ADD_CATEGORY
    const {
        refetch: addTopCategory,
    } = useAxios({
        url: API_PATHS.ADD_CATEGORY,
        method: "post",
        manual: true, // very important
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        }
    });

    // ADD_SUB_CATEGORY
    const {
        refetch: addSubCategory,
    } = useAxios({
        url: API_PATHS.ADD_SUB_CATEGORY,
        method: "post",
        manual: true, // very important
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        }
    });

    // ADD_SUB_CHILD_CATEGORY
    const {
        refetch: addSubChildCategory,
    } = useAxios({
        url: API_PATHS.ADD_SUB_CHILD_CATEGORY,
        method: "post",
        body: {
            Category1: selectedTopCategory && selectedTopCategory!._id,
            Category2: selectedSubCategory && selectedSubCategory!._id,
            Category3: subChildCategoryName
        },
        manual: true,
    });


    // EDIT_CATEGORY
    const {
        refetch: editTopCategory,
    } = useAxios({
        url: selectedTopCategory ? `${API_PATHS.ADD_CATEGORY}/${selectedTopCategory._id}` : "",
        method: "put",
        manual: true, // very important
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        }
    });

    // ADD_EDIT_CATEGORY
    const {
        refetch: editSubCategory,
    } = useAxios({
        url: selectedSubCategory ? `${API_PATHS.ADD_SUB_CATEGORY}/${selectedSubCategory._id}` : "",
        method: "put",
        manual: true, // very important
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            Authorization: adminToken ? `Bearer ${adminToken}` : "",
        }
    });

    // EDIT_SUB_CHILD_CATEGORY
    const {
        refetch: editSubChildCategory,
    } = useAxios({
        url: selectedSubChildCategory ? `${API_PATHS.ADD_SUB_CHILD_CATEGORY}/${selectedSubChildCategory._id}` : "",
        method: "put",
        body: {
            Category3: subChildCategoryName
        },
        manual: true,
    });


    const {
        refetch: markTopCategory,
    } = useAxios({
        url: selectedTopCategory ? `${API_PATHS.MARK_TOP}/${selectedTopCategory!._id}/top` : "",
        method: "put",
        body: {
            top: top
        },
        manual: true,
    });

    const markTop = async () => {
        await markTopCategory();
        refetch();
    }

    const handleAddTop = async () => {
        const file = selectedFiles["top"];
        if (!topCategoryName || !file) {
            toast.error("Category Name and image are required");
            return;
        }

        const formData = new FormData();
        formData.append("Category1", topCategoryName);
        formData.append("image", file);

        await addTopCategory({ body: formData });
        setTopCategoryName("");
        setFileForType("top", null);
        refetch();
    };

    const handleAddSub = async () => {
        const file = selectedFiles["sub"];
        if (!subCategoryName || !file) {
            toast.error("Sub Category Name and image are required");
            return;
        }

        if (!selectedTopCategory) {
            toast.error("Please Select Top category first")
        }

        const formDataToSend = new FormData();
        formDataToSend.append("Category1", selectedTopCategory!._id);
        formDataToSend.append("Category2", subCategoryName);
        formDataToSend.append("image", file);

        // Optional debug
        for (let [key, value] of formDataToSend.entries()) {
            console.log(key, value);
        }

        await addSubCategory({ body: formDataToSend });

        setSubCategoryName("");
        setFileForType("sub", null);
        subCategoriesRefetch();
    };

    const handleAddSubSub = async () => {
        // const file = selectedFiles["child"];
        if (!subChildCategoryName) {
            toast.error("Child Category Name is required");
            return;
        }

        if (!selectedTopCategory) {
            toast.error("Please Select Top category first")
        }

        if (!selectedSubCategory) {
            toast.error("Please Select Sub category first")
        }


        await addSubChildCategory();

        setSubChildCategoryName("");
        subChildCategoriesRefetch();
    };

    const handleEditTop = async () => {
        const file = selectedFiles["top"];
        if (!topCategoryName || !file) {
            toast.error("Category Name and image are required");
            return;
        }

        const formData = new FormData();
        formData.append("Category1", topCategoryName);
        formData.append("image", file);

        await editTopCategory({ body: formData });
        setTopCategoryName("");
        setFileForType("top", null);
        refetch();
    };

    const handleEditSub = async () => {
        const file = selectedFiles["sub"];
        if (!subCategoryName || !file) {
            toast.error("Sub Category Name and image are required");
            return;
        }

        if (!selectedTopCategory) {
            toast.error("Please Select Top category first")
        }

        const formDataToSend = new FormData();
        formDataToSend.append("Category2", subCategoryName);
        formDataToSend.append("image", file);

        // Optional debug
        for (let [key, value] of formDataToSend.entries()) {
            console.log(key, value);
        }

        await editSubCategory({ body: formDataToSend });

        setSubCategoryName("");
        setFileForType("sub", null);
        subCategoriesRefetch();
    };

    const handleEditSubSub = async () => {

        if (!subChildCategoryName) {
            toast.error("Child Category Name is required");
            return;
        }


        await editSubChildCategory();
        subChildCategoriesRefetch();
    };

    //========================== Delete top cat
    const {
        refetch: deleteTopCategory,
    } = useAxios({
        url: selectedTopCategory ? `${API_PATHS.DELETE_TOP}/${selectedTopCategory._id}` : "",
        method: "delete",
        manual: true,
    });

    const handleDeleteTop = async () => {
        if (!selectedTopCategory) return;
        await deleteTopCategory();
        refetch();
    }


    //==========================  Delete sub cat
    const {
        refetch: deleteSubCategory,
    } = useAxios({
        url: selectedSubCategory ? `${API_PATHS.DELETE_SUB}/${selectedSubCategory._id}` : "",
        method: "delete",
        manual: true,
    });

    const handleDeleteSub = async () => {
        if (!selectedSubCategory) return;
        await deleteSubCategory();
        subCategoriesRefetch();
    };

    //==========================  Delete sub child cat
    const {
        refetch: deleteSubChildCategory,
    } = useAxios({
        url: selectedSubChildCategory ? `${API_PATHS.DELETE_SUB_CHILD}/${selectedSubChildCategory._id}` : "",
        method: "delete",
        manual: true,
    });

    const handleDeleteSubSub = async () => {
        if (!selectedSubChildCategory) return;
        await deleteSubChildCategory();
        subChildCategoriesRefetch();
    };

    const handleSelectTopCategory = useCallback((cat: { _id: string, Category: string }) => {
        setSelectedTopCategory(cat);
        setSelectedSubCategory(null);
    }, []);


    const handleSelectSubCategory = useCallback((cat: { _id: string, Category: string }) => {
        setSelectedSubCategory(cat);
        setSelectedSubChildCategory(null);
    }, []);

    const handleSelectSubChildCategory = useCallback((cat: { _id: string, Category: string }) => {
        setSelectedSubChildCategory(cat);
    }, []);


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Manage Categories
                    </h2>
                    <div className="relative ml-4">
                        <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
                            <svg
                                className="fill-gray-500 dark:fill-gray-400"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                                    fill=""
                                />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search Category, sub category or child sub category..."
                            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-yellow-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-yellow-800 xl:w-[430px]"
                        />

                        <button className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-[7px] py-[4.5px] text-xs -tracking-[0.2px] text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                            <span> ⌘ </span>
                            <span> K </span>
                        </button>
                    </div>
                </div>
                {/* <Button variant="outline" size="sm"

                // onClick={() => setCsvModalOpen(true)}


                >
                    Upload CSV
                </Button> */}
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CategoryColumn
                    title="Top Categories"
                    categories={categories || []}
                    categoryType="top"
                    onAdd={handleAddTop}
                    onEdit={handleEditTop}
                    onDelete={handleDeleteTop}
                    onSelect={handleSelectTopCategory}
                    selectedFile={getSelectedFile("top")}
                    setSelectedFile={(file: any) => setFileForType("top", file)}
                    categoryName={topCategoryName}
                    setCategoryName={setTopCategoryName}
                    top={top}
                    setTop={setTop}
                    onMark={markTop}
                />

                <CategoryColumn
                    title="Sub Categories"
                    categories={subCategories || []}
                    categoryType="sub"
                    onAdd={handleAddSub}
                    onEdit={handleEditSub}
                    onDelete={handleDeleteSub}
                    onSelect={handleSelectSubCategory}
                    selectedFile={getSelectedFile("sub")}
                    setSelectedFile={(file: any) => setFileForType("sub", file)}
                    categoryName={subCategoryName}
                    setCategoryName={setSubCategoryName}
                    selectedParent={selectedTopCategory?.Category}
                />

                <CategoryColumn
                    title="Sub Child Categories"
                    categories={subChildCategories || []}
                    categoryType="child"
                    onAdd={handleAddSubSub}
                    onEdit={handleEditSubSub}
                    onDelete={handleDeleteSubSub}
                    onSelect={handleSelectSubChildCategory}
                    selectedFile={getSelectedFile("child")}
                    setSelectedFile={(file: any) => setFileForType("child", file)}
                    categoryName={subChildCategoryName}
                    setCategoryName={setSubChildCategoryName}
                    selectedParent={selectedSubCategory?.Category}
                />


            </div>
        </div>
    );
}

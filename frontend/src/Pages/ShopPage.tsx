import { useState } from "react";
import { Checkbox } from "../components/checkbox";
import useProducts from "../hooks/useProduct";
import ProductGrid from "../layouts/ProductGrid";
import useCategories from "../hooks/useCat";
import { useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { API_PATHS } from "../utils/config";
import useFetch from "../hooks/useFetch";

interface brandType {
  Brand: string,
  _id: string
}

const ShopPage = () => {
  const [page, setPage] = useState(1);
  const limit = 9;

  const location = useLocation();
  const { category1, category2 } = location.state || {};

  const [selectedCategories1, setSelectedCategories1] = useState<string[]>([]);
  const [selectedCategories2, setSelectedCategories2] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Determine which category1 to use
  const effectiveCategory1 =
    selectedCategories1.length > 0
      ? selectedCategories1
      : selectedCategories2.length > 0
        ? undefined // User only selected second-level category
        : category1;

  const effectiveCategory2 =
    selectedCategories2.length > 0
      ? selectedCategories2
      : selectedCategories1.length > 0
        ? undefined // User only selected first-level category
        : category2;


  const effectiveBrand = selectedBrands.length ? selectedBrands : undefined;

  const { products, productLoading, totalPages } = useProducts({
    page,
    limit,
    category1: effectiveCategory1,
    category2: effectiveCategory2,
    brand: effectiveBrand,
  });


  const handleCheckboxChange = (
    category: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setPage(1);
    if (selected.includes(category)) {
      setSelected(selected.filter((item) => item !== category));
    } else {
      setSelected([...selected, category]);
    }
  };

  const { categories, categoryLoading } = useCategories();


  const url = API_PATHS.GET_BRANDS;
  const { data, loading } = useFetch<brandType[]>(url);

  // Inside ShopPage component, add this:
  const [openCategoryIds, setOpenCategoryIds] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setOpenCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };



  return (
    <div className="container-padding px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
      {/* Sidebar Filters */}
      <aside className="space-y-8">
        {/* Categories */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">CATEGORIES</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {categoryLoading
              ?  // Skeleton Loader UI
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 pb-2 animate-pulse">
                  <div className="w-7 h-7 bg-gray-300 rounded" />
                  <div className="w-full h-7 bg-gray-300 rounded" />
                </div>
              ))
              : categories.map((cat) => {
                const isOpen = openCategoryIds.includes(cat._id);
                return (
                  <div key={cat._id}>
                    <div
                      className="flex items-center gap-2 pb-2 cursor-pointer"
                      onClick={() => toggleCategory(cat._id)}
                    >
                      {isOpen ? (
                        <ChevronDown size={16} className="text-gray-700" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-700" />
                      )}
                      <Checkbox
                        id={cat._id}
                        checked={selectedCategories1.includes(cat._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCheckboxChange(
                            cat._id,
                            selectedCategories1,
                            setSelectedCategories1
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        className="text-gray-700"
                        htmlFor={cat._id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cat.Category1}
                      </label>
                    </div>

                    {isOpen &&
                      cat?.Categories2?.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-2 pb-2 pl-8"
                        >
                          <Checkbox
                            id={item._id}
                            checked={selectedCategories2.includes(item._id)}
                            onChange={() =>
                              handleCheckboxChange(
                                item._id,
                                selectedCategories2,
                                setSelectedCategories2
                              )
                            }
                          />
                          <label className="text-gray-700" htmlFor={item._id}>
                            {item.label}
                          </label>
                        </div>
                      ))}
                  </div>
                );
              })}
          </div>
        </div>


        <div>
          <h3 className="font-semibold text-gray-800 mb-4">BRANDS</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {loading
              ?  // Skeleton Loader UI
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2 pb-2 animate-pulse">
                  <div className="w-7 h-7 bg-gray-300 rounded" />
                  <div className="w-full h-7 bg-gray-300 rounded" />
                </div>
              ))
              : data?.map((item: any) => (
                <div key={item._id} className="flex items-center gap-2 pb-2">
                  <Checkbox id={item.Brand} checked={selectedBrands.includes(item._id)} onChange={() =>
                    handleCheckboxChange(
                      item._id,
                      selectedBrands,
                      setSelectedBrands
                    )
                  } />
                  <label className="text-gray-700" htmlFor={item.Brand}>
                    {item.Brand}
                  </label>
                </div>
              ))}
          </div>
        </div>


      </aside>

      {/* Product Grid */}
      <main className="md:col-span-3">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-600">
            Showing Page <span className="span-word">{page}</span> of
            <span className="span-word"> {totalPages}</span>
          </span>
          {/* <div className="flex items-center">
            <span className="text-sm pr-5 text-gray-600">Sort By: </span>
            <select className="border border-gray-300 text-sm p-4 text-gray-700">
              <option>Most Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div> */}
        </div>


        <>
          <ProductGrid products={products ?? []} loading={productLoading} gridCols={3} />

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="px-4 py-2">{`Page ${page} of ${totalPages}`}</span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>

      </main>
    </div>
  );
};

export default ShopPage;

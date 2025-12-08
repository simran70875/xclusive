import React, { useState } from "react";
import OrangeOutlineButton from "../../components/Button/OrangeOutlineButton";
import { ArrowRight } from "lucide-react";
import BrandLayout from "../../layouts/BrandLayout";
import { useNavigate, useParams } from "react-router-dom";
import NoResults from "../../components/NoResults";
import InnerImageZoom from "react-inner-image-zoom";
import 'react-inner-image-zoom/lib/styles.min.css';
import axios from "axios";
import { API_PATHS } from "../../utils/config";
import type { ProductType } from "../HomePage";
import useFetch from "../../hooks/useFetch";
import { getUserId } from "../../utils/createGuestUserId";


interface ProductDetailsPageProps {
  refreshCart: () => void;
}

const ProjectDetails = ({ refreshCart }: ProductDetailsPageProps) => {
  const [activeTab, setActiveTab] = useState<"description" | "technical">(
    "description"
  );

  const [quantity, setQuantity] = useState<number>(1);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value)); // Prevent values less than 1
    setQuantity(value);
  };

  const { productId } = useParams();

  const url = `${API_PATHS.GET_PRODUCT}/${productId}`;
  const { data, loading } = useFetch<ProductType>(url);
  const product = data;


  console.log(product)

  const navigate = useNavigate();

  // Add product to cart (send to backend)
  async function handleAddToCart() {
    const userId = getUserId();

    try {
      const response = await axios.post(API_PATHS.ADD_TO_CART, {
        userId,
        productId: product?._id,
        quantity
      });

      if (response) {
        navigate("/cart");
      }

      refreshCart();
    } catch (error) {
      console.log("Cart error:", error);
    }
  }

  const ProductDetailSkeleton = () => {
    return (
      <div className="container-padding section-space grid grid-cols-1 lg:grid-cols-2 gap-10 animate-pulse">
        {/* Left: Image Section */}
        <div>
          <div className="w-full h-[400px] bg-gray-200 rounded" />
          <div className="flex gap-2 mt-4">
            <div className="w-24 h-24 bg-gray-200 rounded p-1" />
          </div>
        </div>

        {/* Right: Details Section */}
        <div>
          <div className="w-3/4 h-6 bg-gray-200 rounded mb-4" />
          <div className="w-1/3 h-4 bg-gray-200 rounded mb-6" />

          <div className="mb-4">
            <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-6 h-6 bg-gray-200 rounded mb-2" />
          </div>

          <div className="mb-6">
            <div className="w-32 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-10 bg-gray-200 rounded" />
          </div>

          <div className="flex gap-4 mb-4">
            <div className="w-40 h-10 bg-gray-200 rounded" />
            <div className="w-40 h-10 bg-gray-200 rounded" />
          </div>

          <div className="space-y-2 mb-6">
            <div className="w-3/4 h-4 bg-gray-200 rounded" />
            <div className="w-2/3 h-4 bg-gray-200 rounded" />
            <div className="w-1/2 h-4 bg-gray-200 rounded" />
          </div>

          <div className="w-40 h-12 bg-gray-300 rounded" />
        </div>
      </div>
    );
  };

  return (
    <div>
      {loading ? <><ProductDetailSkeleton /></> : !product ? (
        <div className="container-padding section-space">
          <NoResults />
        </div>
      ) : (
        <>
          <div className="container-padding section-space grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              {/* Zoomable main image */}
              <InnerImageZoom
                src={product?.ImageRef}
                zoomSrc={product?.ImageRef} // High-res image if different; same here
                // alt={product?.Description}
                zoomType="hover"
                zoomScale={1.5}
                className="w-full h-auto object-contain"
              />

              {/* Thumbnail */}
              <div className="mt-4">
                <img
                  src={product?.ImageRef}
                  alt="Thumbnail"
                  className="w-24 h-24 object-contain border p-1 mt-4"
                />
              </div>
            </div>

            {/* Right Section - Details */}
            <div>
              <h1 className="text-2xl font-semibold">
                {product?.Style ? `${product.Style} - ` : ""}
                {product?.Description}

              </h1>
              <p className="text-gray-600 mb-4">{product?.Brand?.Brand}</p>

              <div className="mb-5">
                <p className="font-semibold text-sm text-gray-700">Available Options:</p>
                <p className="text-xs text-gray-500 mt-2">
                  Please ensure you specify your preferred color and size options when requesting a quotation or submitting an order. This helps our team process your request efficiently and ensures you receive the correct products. For workplace safety or compliance items, double-check your required specifications before confirming.
                </p>

                {/* Color Options */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-500 border border-gray-300 shadow-sm"></span>
                    <span className="w-6 h-6 rounded-full bg-blue-500 border border-gray-300 shadow-sm"></span>
                    <span className="w-6 h-6 rounded-full bg-green-500 border border-gray-300 shadow-sm"></span>
                    <span className="w-6 h-6 rounded-full bg-yellow-400 border border-gray-300 shadow-sm"></span>
                  </div>
                  <span className="text-sm text-gray-600">Multiple color choices available</span>
                </div>

                {/* Size Options */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex gap-2">
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <span
                        key={size}
                        className="px-2 py-1 text-xs rounded border border-gray-300 shadow-sm bg-gray-100"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">All standard sizes available</span>
                </div>
              </div>



              <div className="my-10 flex items-center">
                 <p className="font-semibold text-sm text-gray-700">Quantity:</p>

                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  min={1}
                  onChange={handleQuantityChange}
                  className="ml-3 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>

              {/* Tabs */}
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`px-4 py-2 font-medium ${activeTab === "description"
                    ? "border-b-2 border-pink-500 text-pink-500"
                    : ""
                    }`}
                >
                  Description & Features
                </button>
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`px-4 py-2 font-medium ${activeTab === "technical"
                    ? "border-b-2 border-pink-500 text-pink-500"
                    : ""
                    }`}
                >
                  Technical Info
                </button>
              </div>

              {activeTab === "description" && (
                <div className="mb-5">
                  <div
                    className="app-text-normal text-xs my-html-content"
                    dangerouslySetInnerHTML={{ __html: product?.CatalogueCopy }}
                  />
                </div>
              )}

              {activeTab === "technical" && (
                <div className="app-text-normal text-xs">
                  <p className="font-semibold mt-4">Technical Details</p>
                  <p>
                    <strong>Brand:</strong> {product?.Brand?.Brand}
                  </p>
                  <p>
                    <strong>Manufacturer:</strong> {product?.Manufacturer}
                  </p>
                  <p>
                    <strong>Manufacturer Code:</strong>{" "}
                    {product?.ManufacturerCode}
                  </p>
                  {/* <p>
                    <strong>RRP:</strong> £{product?.rrp?.toFixed(2)}
                  </p> */}
                  <p>
                    <strong>Pack Size:</strong> {product?.Pack}
                  </p>
                  <p>
                    <strong>Category:</strong> {product?.Category1?.Category1} /{" "}
                    {product?.Category2?.Category2}
                  </p>
                </div>
              )}




              <OrangeOutlineButton
                className="mt-10"
                label="Add to Cart"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => handleAddToCart()}
              />
            </div>
          </div>
          <BrandLayout />
        </>
      )}
    </div>
  );
};

export default ProjectDetails;

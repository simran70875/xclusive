import OrangeOutlineButton from "../components/Button/OrangeOutlineButton";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import type { ProductType } from "./HomePage";
import { ArrowRight, Trash } from "lucide-react";
import { API_PATHS } from "../utils/config";
import axios from "axios";
import NoResults from "../components/NoResults";
import { getUserId } from "../utils/createGuestUserId";

export interface CartItem {
  _id: string;
  product: ProductType;
  quantity: number;
}

const CartPage = () => {
  const userId = getUserId();
  const navigate = useNavigate();
  const { data, fetchData, loading } = useFetch<{ _id: string; userId: string; items: CartItem[] }[]>(API_PATHS.GET_CART, { userId });

  // Unwrap the cart items from the first cart in the array
  const cartItems = data?.[0]?.items ?? [];

  console.log("cart items ", data)

  const handleQuantityChange = async (productId: string, quantity: number) => {
    try {

      const response = await axios.put(API_PATHS.UPDATE_CART, {
        userId: userId,
        productId: productId,
        quantity: quantity
      });

      if (response.data) {
        fetchData();
        // toast.success(response.data.message);
      }

    } catch (error) {
      console.log("cart update error ", error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {

      const response = await axios.delete(API_PATHS.REMOVE_CART_ITEM, {
        data: {
          productId: productId,
          userId: userId,
        },
      });


      if (response.data) {
        fetchData();
        // toast.success(response.data.message);
      }

    } catch (error) {
      console.log("cart update error ", error);
    }
  };

  const CartItemSkeleton = () => (
    <div className="flex items-center border border-gray-200 rounded-lg p-4 mb-4 gap-4 animate-pulse">
      <div className="w-24 h-24 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 bg-gray-200 rounded" />
        <div className="w-1/2 h-3 bg-gray-200 rounded" />
      </div>
      <div className="w-16 h-10 bg-gray-200 rounded" />
      <div className="w-5 h-5 bg-gray-200 rounded ml-4" />
    </div>
  );

  const SummarySkeleton = () => (
    <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-t lg:border-l lg:border-t-0 border-gray-200 animate-pulse">
      <div className="w-1/2 h-6 bg-gray-200 rounded mb-6" />
      <div className="w-full h-4 bg-gray-200 rounded mb-4" />
      <div className="w-full h-4 bg-gray-200 rounded mb-4" />
      <div className="w-full h-10 bg-gray-200 rounded mt-10" />
    </div>
  );


  return (
    <div className="container-padding section-space">
      <div className="bg-white overflow-hidden flex flex-col lg:flex-row border border-gray-200">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 p-6">
          <h2 className="text-2xl font-bold mb-6">Send Quotation</h2>

          {loading ? (
            <>
              <CartItemSkeleton />
              <CartItemSkeleton />
            </>
          ) : cartItems.length === 0 ? (
            <NoResults
              message="Your cart is empty"
              description="Browse products and add items to your cart to get started."
            />
          ) :
            <>
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center border border-gray-200 rounded-lg p-4 mb-4 gap-4 relative"
                >
                  <img
                    src={item.product.ImageRef}
                    alt={item.product.Description}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div
                    onClick={() => {
                      navigate(`/projectDetails/${item.product._id}`);
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <h4 className="text-lg font-medium text-gray-800">
                      {item.product.Description}
                    </h4>
                    <p className="text-sm text-gray-500">Code: {item.product.Style}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-500">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      defaultValue={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.product._id, parseInt(e.target.value))
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Delete Icon */}
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="text-red-500 hover:text-red-700 transition duration-150 ml-4"
                    title="Remove item"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </>
          }

          <div className="mt-4">
            <div
              onClick={() => {
                navigate("/shop");
              }}
              className="text-indigo-600 hover:underline text-sm cursor-pointer"
            >
              ← Continue Shopping
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-t lg:border-l lg:border-t-0 border-gray-200">
          <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

          {
            loading ? <SummarySkeleton /> : <>
              <div className="flex justify-between text-gray-700 text-lg mb-4 font-medium">
                <span>Total Products</span>
                <span className="text-yellow-600 font-bold">{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-gray-700 text-lg mb-4 font-medium">
                <span>Total Items Quantity</span>
                <span className="text-yellow-600 font-bold">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>

              {
                cartItems.length > 0 &&
                <OrangeOutlineButton
                  icon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => {
                    navigate("/sendQuotation", {
                      state: cartItems,
                    });
                  }}
                  className="mt-10"
                  label="Send a Quote"
                />
              }
            </>
          }


        </div>
      </div>
    </div>
  );
};

export default CartPage;



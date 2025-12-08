export const BASE_URL = "http://192.168.29.183:5000";
export const IMAGE_URL = "http://192.168.29.183:5000/static";

export const API_PATHS = {
  LOGIN: `${BASE_URL}/api/auth/login`,

  CATEGORIES: `${BASE_URL}/api/categories`,
  SUB_CATEGORIES: `${BASE_URL}/api/categories/sub-categories`,
  SUB_CHILD_CATEGORIES: `${BASE_URL}/api/categories/sub-child-categories`,
  ADD_CATEGORY: `${BASE_URL}/api/categories/category`,
  ADD_SUB_CATEGORY: `${BASE_URL}/api/categories/sub-category`,
  ADD_SUB_CHILD_CATEGORY: `${BASE_URL}/api/categories/sub-child-category`,
  DELETE_TOP: `${BASE_URL}/api/categories/category`,
  DELETE_SUB: `${BASE_URL}/api/categories/sub-category`,
  DELETE_SUB_CHILD: `${BASE_URL}/api/categories/sub-child-category`,
  MARK_TOP: `${BASE_URL}/api/categories/top-category`,

  PRODUCTS: `${BASE_URL}/api/products/allProducts`,
  PRODUCTS_COUNT: `${BASE_URL}/api/products/productCount`,
  PRODUCT_VISIBILITY: `${BASE_URL}/api/products/visibility`,
  PRODUCT_DELETE: `${BASE_URL}/api/products/product`,
  GET_PRODUCT: `${BASE_URL}/api/products/get-product`,
  ADD_PRODUCT: `${BASE_URL}/api/products/add`,
  EDIT_PRODUCT: `${BASE_URL}/api/products/edit`,

  MARK_TOP_PRODUCT : `${BASE_URL}/api/products/topSelling`,


  TOP_BANNER: `${BASE_URL}/api/banner/banners`,
  EDIT_BANNER: `${BASE_URL}/api/banner`,
  ADD_BANNER: `${BASE_URL}/api/banner/add`,

  GET_FLOATING_BANNER: `${BASE_URL}/api/banner/getFloatingBannerAamin`,
  EDIT_FLOATING_BANNER: `${BASE_URL}/api/banner/updateFloatingBanner`,
  ADD_FLOATING_BANNER: `${BASE_URL}/api/banner/addFloatingBanner`,

  TOP_CATEGORIES: `${BASE_URL}/api/categories/top-categories`,
  GET_BRANDS: `${BASE_URL}/api/categories/brands`,

  PLACE_ORDER: `${BASE_URL}/api/order/request-quote`,
  GET_ALL_ORDERS: `${BASE_URL}/api/order/get-all-orders`,
  GET_ORDER: `${BASE_URL}/api/order/get-order`,
  EDIT_ORDER: `${BASE_URL}/api/order/edit-order`,
  EDIT_ORDER_STATUS: `${BASE_URL}/api/order`,

  SEND_INVOICE: `${BASE_URL}/api/order/send-invoice`,

  CREATE_ORDER: `${BASE_URL}/api/order/create-order`,

  GET_QUERIES: `${BASE_URL}/api/query/all-user-query`,

  UPLOAD_PRODUCTS_CSV: `${BASE_URL}/api/products/upload-csv`,

  //agents
  AGENTS: `${BASE_URL}/api/agent`,
  ADD_AGENT: `${BASE_URL}/api/agent/add`,
  DELETE_AGENT: `${BASE_URL}/api/agent`,
  EDIT_AGENT: `${BASE_URL}/api/agent`,

  // /QUERIES
  QUERIES: `${BASE_URL}/api/query/queries`,

  //USERS
  USERS: `${BASE_URL}/api/auth/users`,
  EDIT_USER: `${BASE_URL}/api/auth/user`,
  DELETE_USER: `${BASE_URL}/api/auth/user`,

  USERS_COUNT: `${BASE_URL}/api/auth/usersCount`,

  //BRANDS
  BRANDS: `${BASE_URL}/api/categories/brands`,
  ADD_BRAND: `${BASE_URL}/api/categories/brand`,
  DELETE_BRAND: `${BASE_URL}/api/categories/brand`,

  EDIT_PROFILE: `${BASE_URL}/api/auth/edit`,
  CHANGE_PASSWORD: `${BASE_URL}/api/auth/change-password`,

  COMPARE_ORDERS: `${BASE_URL}/api/order/compare-orders`,
  MONTHLY_PROFITS: `${BASE_URL}/api/order/monthly-profits`,
  AGENTS_PROFIT: `${BASE_URL}/api/order/agent-monthly-profits`,
};

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import user from "./Features/User/User";
import order from "./Features/Order/Order";
import banner from "./Features/Banner/Banner";
import setting from "./Features/Setting/Setting";
import product from "./Features/Product/Product";
import addCart from "./Features/AddCart/AddCart";
import address from "./Features/Address/Address";
import category from "./Features/Category/Category";
import wishList from "./Features/WishList/WishList";
import walletCoins from "./Features/Wallet&Coins/WalletCoins";
import popUp from "./Features/Banner/getPopUpBanner";

const reducers = combineReducers({
  user: user,
  order: order,
  banner: banner,
  product: product,
  addCart: addCart,
  address: address,
  category: category,
  wishList: wishList,
  setting: setting,
  walletCoins: walletCoins,
  popUp: popUp,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user","popUp"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export default store;

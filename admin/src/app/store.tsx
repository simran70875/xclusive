// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist"
import storage from "redux-persist/lib/storage" // uses localStorage

import { combineReducers } from "redux"

const rootReducer = combineReducers({
  auth: authReducer,
})

// Configure persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // only persist auth slice
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

// Create the persistor
export const persistor = persistStore(store)

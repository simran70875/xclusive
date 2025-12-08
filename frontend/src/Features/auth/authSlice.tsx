import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../types/auth";

const initialState: AuthState = {
    userId: null,
    user: null,
    token: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<{ user: User; token: string, userId: string }>) {
            state.user = action.payload.user
            state.token = action.payload.token
            state.userId = action.payload.userId
        },
        logout(state) {
            state.user = null
            state.token = null
            state.userId = null
        },
    },
});


export const { loginSuccess, logout } = authSlice.actions   //export actions
export default authSlice.reducer //export reducer
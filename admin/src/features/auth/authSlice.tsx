import { AuthState, User } from "../../types/auth";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState: AuthState = {
    adminUser: null,
    adminToken: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<{ adminUser: User; adminToken: string }>) {
            state.adminUser = action.payload.adminUser
            state.adminToken = action.payload.adminToken
        },
        logout(state) {
            state.adminUser = null
            state.adminToken = null
        },
    },
});


export const { loginSuccess, logout } = authSlice.actions   //export actions
export default authSlice.reducer //export reducer
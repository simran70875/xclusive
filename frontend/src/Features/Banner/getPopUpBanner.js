import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  opened: false,
};

export const popUpSlice = createSlice({
  name: "popUp",
  initialState,
  reducers: {
    IsOpened: (state) => {
      state.opened = true; 
    },
    IsClosed: (state) => {
      state.opened = false;
    },
  },
});

export const { IsOpened, IsClosed} = popUpSlice.actions;

export default popUpSlice.reducer;

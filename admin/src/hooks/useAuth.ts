// src/hooks/useAuth.ts
import { useSelector } from "react-redux"
import { RootState } from "../app/hooks"


export const useAuth = () => useSelector((state: RootState) => state.auth)

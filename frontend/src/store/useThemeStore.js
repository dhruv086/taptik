import {create} from "zustand"

export const useThemeStore = create((set)=>({
  theme:localStorage.getItem("chat-theme")||"coffe",
  setTheme:(theme)=>set({theme}),
}))
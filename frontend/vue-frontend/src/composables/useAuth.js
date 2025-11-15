import { jwtDecode } from "jwt-decode";
import { useNavStore } from "@/stores/navStore";


// 🔐 Composable to manage authentication state
export function useAuth() {
  const navStore = useNavStore();

  function initializeAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
      navStore.setRole("guest");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Backend returns numeric role → convert it
      const roleString = decoded.role === 1 ? "guide" : "traveller";

      navStore.setRole(roleString);

    } catch (err) {
      console.error("Invalid token:", err);
      navStore.setRole("guest");
      localStorage.removeItem("token");
    }
  }

  return { initializeAuth };
}

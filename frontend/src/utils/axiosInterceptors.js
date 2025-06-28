import axios from "axios";

// Variable to store the navigate function
let navigate = null;

// Function to set the navigate function
export const setNavigateFunction = (navigateFunc) => {
  navigate = navigateFunc;
  //   console.log("🔧 Global axios navigate function set:", typeof navigateFunc);
  //   console.log("🔧 Navigate function details:", navigateFunc);
};

// Create axios interceptor to handle rate limit errors globally
export const setupAxiosInterceptors = () => {
  // Clear any existing interceptors first
  if (axios.interceptors.response.handlers) {
    axios.interceptors.response.handlers.length = 0;
  }

  console.log("Setting up axios interceptors...");

  // Response interceptor to handle rate limit errors
  const interceptor = axios.interceptors.response.use(
    (response) => {
      console.log("Axios interceptor - successful response:", response.status);
      return response;
    },
    (error) => {
      console.log("=== AXIOS INTERCEPTOR TRIGGERED ===");
      console.log("Full error object:", error);
      console.log("Error response:", error.response);
      console.log("Error status:", error.response?.status);
      console.log("Error data:", error.response?.data);
      console.log("Error message:", error.message);
      console.log("Navigate function available:", !!navigate);

      // Check if it's a rate limit error (status 429)
      if (error.response?.status === 429) {
        console.log(
          "🚨 GLOBAL AXIOS: RATE LIMIT DETECTED (status 429), REDIRECTING..."
        );
        console.log("Rate limit response data:", error.response.data);

        const userType = error.response.data?.userType;
        console.log("User type detected:", userType);

        // Only redirect if this is detected as a browser user
        if (userType === "browser" || !userType) {
          console.log("🌐 Browser user detected - performing redirect");

          try {
            window.location.href = "/rate-limit";
            console.log(
              "✅ GLOBAL AXIOS: window.location.href redirect attempted"
            );
          } catch (e) {
            console.error("❌ GLOBAL AXIOS: window.location.href failed:", e);
          }

          // Also try React Router navigate if available
          if (navigate) {
            console.log("GLOBAL AXIOS: Also trying React Router navigate");
            try {
              navigate("/rate-limit");
              console.log("✅ GLOBAL AXIOS: React Router navigate attempted");
            } catch (e) {
              console.error(
                "❌ GLOBAL AXIOS: React Router navigate failed:",
                e
              );
            }
          }
        } else {
          // For terminal/API users, just log the information
          console.log(
            "🖥️ Terminal/API user rate limited - no redirect performed"
          );
          console.log("ℹ️ Help URL:", error.response.data?.helpUrl);
          console.log("📞 Contact:", error.response.data?.contact);
          console.log("💡 Message:", error.response.data?.message);
        }

        return Promise.reject(error);
      }

      // Check for rate limit in error message or response data
      const responseData = error.response?.data;
      let errorMessage = "";

      if (typeof responseData === "string") {
        errorMessage = responseData;
      } else if (responseData) {
        errorMessage = responseData.error || responseData.message || "";
      }

      // Also check the error message itself
      errorMessage = errorMessage || error.message || "";

      console.log(
        "Checking error message for 'too many requests':",
        errorMessage
      );

      if (
        typeof errorMessage === "string" &&
        errorMessage.toLowerCase().includes("too many requests")
      ) {
        console.log("🚨 RATE LIMIT MESSAGE DETECTED, REDIRECTING...");
        if (navigate) {
          console.log("Using React Router navigate");
          navigate("/rate-limit");
        } else {
          console.log("Using window.location.href");
          window.location.href = "/rate-limit";
        }
        return Promise.reject(error);
      }

      // Check for network errors that might indicate rate limiting
      if (
        error.code === "ERR_NETWORK" ||
        error.message.includes("Network Error")
      ) {
        console.log("Network error detected, might be rate limiting");
        // Don't redirect on network errors as they could be other issues
      }

      console.log("=== NO RATE LIMIT DETECTED, CONTINUING ===");
      // For other errors, just return the error
      return Promise.reject(error);
    }
  );

  console.log("Axios interceptor set up with ID:", interceptor);
};

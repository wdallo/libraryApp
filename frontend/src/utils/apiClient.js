import axios from "axios";

console.log("🔧 Setting up API client...");

// Variable to store the navigate function
let navigateFunction = null;

// Function to set the navigate function for apiClient
export const setApiClientNavigate = (navigateFunc) => {
  navigateFunction = navigateFunc;
  //   console.log("🔧 API Client navigate function set:", typeof navigateFunc);
  //   console.log("🔧 API Client navigate function details:", navigateFunc);
};

// Create a custom axios instance with interceptors
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

console.log("🔧 API client base URL:", import.meta.env.VITE_API_URL);

// Set up response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Client Success:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log("🚨 API CLIENT ERROR INTERCEPTED!");
    console.log("Error object:", error);
    console.log("Response:", error.response);
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);
    console.log("Config:", error.config);
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);

    // Check for rate limit - either HTTP 429 or network-level rate limiting
    if (error.response?.status === 429) {
      console.log("🔴 HTTP 429 RATE LIMIT DETECTED! REDIRECTING NOW...");
      console.log("Rate limit response data:", error.response.data);

      const userType = error.response.data?.userType;
      console.log("User type detected:", userType);

      // Only redirect if this is detected as a browser user
      if (userType === "browser" || !userType) {
        console.log("🌐 Browser user detected - performing redirect");

        // Try immediate redirect with window.location first to test
        console.log("🚨 FORCING IMMEDIATE REDIRECT FOR TESTING");
        try {
          window.location.href = "/rate-limit";
          console.log("✅ window.location.href redirect attempted");
        } catch (e) {
          console.error("❌ window.location.href failed:", e);
        }

        // Also try React Router navigate if available
        if (navigateFunction) {
          console.log("Also trying React Router navigate to /rate-limit");
          try {
            navigateFunction("/rate-limit");
            console.log("✅ React Router navigate attempted");
          } catch (e) {
            console.error("❌ React Router navigate failed:", e);
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
    // Check for network-level rate limiting (when response is undefined)
    else if (
      !error.response &&
      (error.code === "ERR_NETWORK" || error.message.includes("Network Error"))
    ) {
      console.log("🔴 NETWORK-LEVEL RATE LIMIT DETECTED! REDIRECTING NOW...");
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);

      // Try immediate redirect with window.location first
      console.log("🚨 FORCING IMMEDIATE REDIRECT FOR NETWORK ERROR");
      try {
        window.location.href = "/rate-limit";
        console.log(
          "✅ window.location.href redirect attempted for network error"
        );
      } catch (e) {
        console.error("❌ window.location.href failed:", e);
      }

      // Also try React Router navigate if available
      if (navigateFunction) {
        console.log("Also trying React Router navigate for network error");
        try {
          navigateFunction("/rate-limit");
          console.log("✅ React Router navigate attempted for network error");
        } catch (e) {
          console.error("❌ React Router navigate failed:", e);
        }
      }

      return Promise.reject(error);
    }
    // Check for any error that might be rate limiting based on message
    else if (
      !error.response &&
      error.message &&
      error.message.toLowerCase().includes("failed")
    ) {
      console.log(
        "🔴 POTENTIAL RATE LIMIT (FAILED REQUEST) DETECTED! REDIRECTING NOW..."
      );
      console.log("Error details:", {
        code: error.code,
        message: error.message,
        response: error.response,
      });

      // Try immediate redirect
      console.log("🚨 FORCING REDIRECT FOR FAILED REQUEST");
      try {
        window.location.href = "/rate-limit";
        console.log(
          "✅ window.location.href redirect attempted for failed request"
        );
      } catch (e) {
        console.error("❌ window.location.href failed:", e);
      }

      return Promise.reject(error);
    } else {
      console.log(
        "Not a rate limit error - Status:",
        error.response?.status,
        "Code:",
        error.code,
        "Message:",
        error.message
      );
    }

    return Promise.reject(error);
  }
);

console.log("🔧 API client interceptors set up");

export default apiClient;

const axios = require("axios");

async function testRateLimiting() {
  console.log("Testing rate limiting with different user agents...\n");

  // Test with terminal user agent
  try {
    console.log("Making requests with terminal user agent...");
    for (let i = 1; i <= 12; i++) {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/test-rate-limit",
          {
            headers: {
              "User-Agent": "MyTerminalApp/1.0",
            },
          }
        );
        console.log(`Request ${i} - Success:`, response.data.detectedAs);
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.log(`Request ${i} - Rate Limited!`);
          console.log("Status:", error.response.status);
          console.log(
            "Response Data:",
            JSON.stringify(error.response.data, null, 2)
          );
          break;
        } else {
          console.log(`Request ${i} - Error:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testRateLimiting();

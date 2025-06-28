const http = require("http");

function testHelpPage() {
  console.log("🔍 Testing Help Page Accessibility for Terminal Users");
  console.log("=====================================================\n");

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/rate-limits.html",
    method: "GET",
    headers: {
      "User-Agent": "curl/8.0.0",
    },
  };

  const req = http.request(options, (res) => {
    console.log(`📄 Response Status: ${res.statusCode}`);
    console.log(`📋 Content-Type: ${res.headers["content-type"]}`);
    console.log(`📏 Content-Length: ${res.headers["content-length"]}\n`);

    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      if (res.statusCode === 200) {
        console.log("✅ Help page is accessible!");
        console.log("📝 Page content preview:");
        console.log("------------------------");
        // Show first 500 characters
        console.log(data.substring(0, 500) + "...");
        console.log("------------------------\n");
        console.log(
          "💡 Terminal users who hit rate limits will be directed to this page!"
        );
      } else if (res.statusCode === 429) {
        console.log(
          "🔴 Rate limit is still active - this is expected after DDoS simulation"
        );
        console.log("⏳ Wait for rate limit to reset and try again");
      } else {
        console.log(`❌ Unexpected status: ${res.statusCode}`);
        console.log("Response:", data);
      }
    });
  });

  req.on("error", (err) => {
    console.error("❌ Error accessing help page:", err.message);
  });

  req.end();
}

// Test the help page
testHelpPage();

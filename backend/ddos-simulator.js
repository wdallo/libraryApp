const http = require("http");

// Function to make HTTP requests
function makeRequest(userAgent, requestNumber) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: "/api/test-rate-limit",
      method: "GET",
      headers: {
        "User-Agent": userAgent,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            requestNumber,
            status: res.statusCode,
            userAgent,
            data: parsed,
          });
        } catch (e) {
          resolve({
            requestNumber,
            status: res.statusCode,
            userAgent,
            data: data,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject({
        requestNumber,
        userAgent,
        error: err.message,
      });
    });

    req.end();
  });
}

// Function to simulate DDoS attack
async function simulateDDoS() {
  console.log("🚨 SIMULATING DDoS ATTACK 🚨");
  console.log("================================\n");

  // Test with terminal user agent first
  console.log("📱 Testing with TERMINAL user agent:");
  console.log("User-Agent: MyDDoSBot/1.0\n");

  const terminalUserAgent = "MyDDoSBot/1.0";

  for (let i = 1; i <= 20; i++) {
    try {
      const result = await makeRequest(terminalUserAgent, i);

      if (result.status === 200) {
        console.log(
          `✅ Request ${i}: SUCCESS - Detected as: ${result.data.detectedAs}`
        );
      } else if (result.status === 429) {
        console.log(`🔴 Request ${i}: RATE LIMITED (429)`);
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
        console.log(`   Help URL: ${result.data.helpUrl}`);
        console.log(`   Message: ${result.data.message}`);
        break;
      } else {
        console.log(`⚠️  Request ${i}: Status ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ Request ${i}: ERROR - ${error.error}`);
    }

    // Small delay to avoid overwhelming
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log("\n" + "=".repeat(50));
  console.log("Waiting 5 seconds before testing browser user agent...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Test with browser user agent
  console.log("\n🌐 Testing with BROWSER user agent:");
  console.log(
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\n"
  );

  const browserUserAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

  for (let i = 1; i <= 20; i++) {
    try {
      const result = await makeRequest(browserUserAgent, i);

      if (result.status === 200) {
        console.log(
          `✅ Request ${i}: SUCCESS - Detected as: ${result.data.detectedAs}`
        );
      } else if (result.status === 429) {
        console.log(`🔴 Request ${i}: RATE LIMITED (429)`);
        console.log(`   Response: ${JSON.stringify(result.data, null, 2)}`);
        console.log(`   User Type: ${result.data.userType}`);
        console.log(
          "   📝 Note: Browser users would be redirected to /rate-limit page"
        );
        break;
      } else {
        console.log(`⚠️  Request ${i}: Status ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ Request ${i}: ERROR - ${error.error}`);
    }

    // Small delay to avoid overwhelming
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log("\n🏁 DDoS simulation completed!");
}

// Function to simulate rapid concurrent requests (more realistic DDoS)
async function simulateConcurrentDDoS() {
  console.log("\n🚨 SIMULATING CONCURRENT DDoS ATTACK 🚨");
  console.log("==========================================\n");

  const userAgents = [
    "MyDDoSBot/1.0",
    "EvilBot/2.0",
    "AttackBot/3.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "curl/8.0.0",
  ];

  // Create many concurrent requests
  const promises = [];

  for (let i = 1; i <= 50; i++) {
    const userAgent = userAgents[i % userAgents.length];
    promises.push(makeRequest(userAgent, i));
  }

  console.log("🔥 Launching 50 concurrent requests...");

  try {
    const results = await Promise.allSettled(promises);

    let successCount = 0;
    let rateLimitedCount = 0;
    let errorCount = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        const res = result.value;
        if (res.status === 200) {
          successCount++;
          console.log(`✅ Request ${res.requestNumber}: SUCCESS`);
        } else if (res.status === 429) {
          rateLimitedCount++;
          console.log(`🔴 Request ${res.requestNumber}: RATE LIMITED`);
          if (res.data.userType) {
            console.log(`   User Type: ${res.data.userType}`);
            if (res.data.helpUrl) {
              console.log(`   Help URL: ${res.data.helpUrl}`);
            }
          }
        }
      } else {
        errorCount++;
        console.log(`❌ Request ${index + 1}: ERROR`);
      }
    });

    console.log("\n📊 RESULTS SUMMARY:");
    console.log(`✅ Successful requests: ${successCount}`);
    console.log(`🔴 Rate limited requests: ${rateLimitedCount}`);
    console.log(`❌ Error requests: ${errorCount}`);
    console.log(
      `📝 Rate limiting is ${rateLimitedCount > 0 ? "WORKING" : "NOT WORKING"}`
    );
  } catch (error) {
    console.error("DDoS simulation failed:", error);
  }
}

// Run both simulations
async function runAllTests() {
  await simulateDDoS();
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await simulateConcurrentDDoS();
}

runAllTests().catch(console.error);

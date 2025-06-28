const http = require("http");
const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
  console.log("🚨 AGGRESSIVE DDoS SIMULATION 🚨");
  console.log("=================================\n");

  const numCPUs = os.cpus().length;
  console.log(`💻 Spawning ${numCPUs} worker processes for maximum load...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.send({ workerId: i });
  }

  let completedWorkers = 0;
  let totalRequests = 0;
  let totalRateLimited = 0;
  let totalErrors = 0;

  cluster.on("message", (worker, message) => {
    if (message.type === "results") {
      totalRequests += message.totalRequests;
      totalRateLimited += message.rateLimited;
      totalErrors += message.errors;
      completedWorkers++;

      console.log(
        `Worker ${message.workerId} completed: ${message.totalRequests} requests, ${message.rateLimited} rate limited`
      );

      if (completedWorkers === numCPUs) {
        console.log("\n📊 FINAL RESULTS:");
        console.log(`🔥 Total requests sent: ${totalRequests}`);
        console.log(`🔴 Rate limited: ${totalRateLimited}`);
        console.log(`❌ Errors: ${totalErrors}`);
        console.log(
          `✅ Success rate: ${(
            ((totalRequests - totalRateLimited - totalErrors) / totalRequests) *
            100
          ).toFixed(2)}%`
        );
        console.log(
          `🛡️  Rate limiting effectiveness: ${(
            (totalRateLimited / totalRequests) *
            100
          ).toFixed(2)}%`
        );

        process.exit(0);
      }
    }
  });

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Worker process
  let workerId = 0;

  process.on("message", (msg) => {
    if (msg.workerId !== undefined) {
      workerId = msg.workerId;
      startAttack();
    }
  });

  function makeRequest(userAgent, requestNumber) {
    return new Promise((resolve) => {
      const options = {
        hostname: "localhost",
        port: 3000,
        path: "/api/test-rate-limit",
        method: "GET",
        headers: {
          "User-Agent": userAgent,
        },
        timeout: 5000,
      };

      const req = http.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            requestNumber,
            status: res.statusCode,
            userAgent,
            success: res.statusCode === 200,
            rateLimited: res.statusCode === 429,
          });
        });
      });

      req.on("error", () => {
        resolve({
          requestNumber,
          userAgent,
          success: false,
          rateLimited: false,
          error: true,
        });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({
          requestNumber,
          userAgent,
          success: false,
          rateLimited: false,
          error: true,
        });
      });

      req.end();
    });
  }

  async function startAttack() {
    const userAgents = [
      "AttackBot/1.0",
      "DDoSBot/2.0",
      "EvilScript/3.0",
      "Mozilla/5.0 (Malicious Browser)",
      "curl/8.0.0 (automated)",
      `Worker${workerId}Bot/1.0`,
    ];

    const promises = [];
    const requestsPerWorker = 100;

    console.log(
      `🔥 Worker ${workerId} launching ${requestsPerWorker} rapid requests...`
    );

    // Launch many requests with minimal delay
    for (let i = 1; i <= requestsPerWorker; i++) {
      const userAgent = userAgents[i % userAgents.length];
      promises.push(makeRequest(userAgent, i));

      // Very small delay to create realistic rapid-fire requests
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }

    const results = await Promise.allSettled(promises);

    let totalRequests = results.length;
    let rateLimited = 0;
    let errors = 0;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const res = result.value;
        if (res.rateLimited) rateLimited++;
        if (res.error) errors++;
      } else {
        errors++;
      }
    });

    // Send results back to master
    process.send({
      type: "results",
      workerId,
      totalRequests,
      rateLimited,
      errors,
    });
  }
}

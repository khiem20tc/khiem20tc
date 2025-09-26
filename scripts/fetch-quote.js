const https = require("https");
const fs = require("fs");
const path = require("path");

async function fetchRandomQuote() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.adviceslip.com",
      port: 443,
      path: "/advice",
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          resolve(response.slip.advice);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

async function updateReadme() {
  try {
    const quote = await fetchRandomQuote();
    const readmePath = path.join(__dirname, "..", "README.md");

    // Read current README
    let readmeContent = fs.readFileSync(readmePath, "utf8");

    // Quote section template
    const quoteSection = `### 💭 Random Quote of the Day

\`\`\`
"${quote}"
\`\`\`

`;

    // Check if quote section already exists
    const quoteRegex =
      /### 💭 Random Quote of the Day[\s\S]*?(?=### Background)/;

    if (quoteRegex.test(readmeContent)) {
      // Replace existing quote section
      readmeContent = readmeContent.replace(quoteRegex, quoteSection);
    } else {
      // Add quote section after the greeting
      const greetingRegex = /(## Hi👋 I'm Khiem[\s\S]*?### Background  💪)/;
      readmeContent = readmeContent.replace(
        greetingRegex,
        `$1\n${quoteSection}`
      );
    }

    // Write updated README
    fs.writeFileSync(readmePath, readmeContent, "utf8");
    console.log("✅ Random quote updated successfully!");
    console.log(`📝 Quote: "${quote}"`);
  } catch (error) {
    console.error("❌ Error updating quote:", error.message);
    process.exit(1);
  }
}

updateReadme();

import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import fs from "fs";

// Initialize client with your credentials and region
const client = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Check if PDF file exists
const pdfPath = process.argv[2] || "credit_report.pdf";

if (!fs.existsSync(pdfPath)) {
  console.error(`❌ File not found: ${pdfPath}`);
  console.log("Usage: node testTextract.js <path-to-pdf>");
  process.exit(1);
}

// Read your PDF file
const fileBytes = fs.readFileSync(pdfPath);
console.log(`📄 Loaded PDF: ${pdfPath} (${(fileBytes.length / 1024).toFixed(2)} KB)`);

// Send to AWS Textract
const command = new AnalyzeDocumentCommand({
  Document: { Bytes: fileBytes },
  FeatureTypes: ["TABLES", "FORMS"]
});

try {
  console.log("🔄 Sending to AWS Textract...");
  const response = await client.send(command);
  
  console.log("✅ Textract response received!");
  console.log(`📊 Total blocks found: ${response.Blocks?.length || 0}`);
  
  // Extract and display LINE blocks (readable text)
  const textLines = response.Blocks
    ?.filter(block => block.BlockType === "LINE")
    .map(block => block.Text)
    .slice(0, 20); // First 20 lines
  
  console.log("\n📝 First 20 lines of extracted text:");
  console.log("=====================================");
  textLines?.forEach((line, i) => console.log(`${i + 1}. ${line}`));
  
  console.log("\n💾 Full response saved to textract-output.json");
  fs.writeFileSync("textract-output.json", JSON.stringify(response, null, 2));
  
} catch (err) {
  console.error("❌ Textract request failed:", err.message);
  console.error("Error details:", err);
}

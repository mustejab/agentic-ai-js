import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { SerpAPI } from "langchain/tools";

// Setup for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve the index.html for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// LLM Setup
const model = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo" // Or "gpt-4" if you have access
});

const tools = [
  new SerpAPI(process.env.SERP_API_KEY, {
    location: "Australia",
  }),
];

// Route: POST /agent
app.post("/agent", async (req, res) => {
  const { goal } = req.body;

  try {
    console.log("Received goal:", goal);

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: "zero-shot-react-description",
      verbose: true,
    });

    const result = await executor.call({ input: goal });
    console.log("Agent Result:", result);
    res.json({ result: result.output });
  } catch (error) {
    console.error("❌ Agent Error:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: `Agent execution failed: ${error.message}` });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

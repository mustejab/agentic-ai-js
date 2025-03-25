import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "langchain/llms/openai";
import { SerpAPI } from "langchain/tools";

const app = express();
app.use(cors());
app.use(express.json());

const model = new OpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const tools = [
  new SerpAPI(process.env.SERP_API_KEY, {
    location: "Australia",
  })
];

app.post('/agent', async (req, res) => {
  const { goal } = req.body;

  try {
    const executor = await initializeAgentExecutorWithOptions(
      tools,
      model,
      {
        agentType: "zero-shot-react-description",
        verbose: true,
      }
    );

    const result = await executor.call({ input: goal });
    res.json({ result: result.output });
  } catch (error) {
    console.error("Agent error:", error);
    res.status(500).json({ error: "Agent execution failed." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

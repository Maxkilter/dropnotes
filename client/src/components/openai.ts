// @ts-nocheck
import { Configuration, OpenAIApi } from "openai";

const apiKey = "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";

class OpenAI {
  constructor() {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }
  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });
      return response.data.choices[0].message;
    } catch (e) {
      console.error("Error while chat GPT: ", e.message);
    }
  }
}

export const openai = new OpenAI();

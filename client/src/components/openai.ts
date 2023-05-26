// @ts-nocheck
import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";

class OpenAI {
  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey: "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",
    });
    this.openai = new OpenAIApi(configuration);
  }

  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

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

  async transcription(filePath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filePath),
        "whisper-1"
      );
      return response.data.text;
    } catch (e) {
      console.error("Error while transcription: ", e.message);
    }
  }
}

export const openai = new OpenAI();

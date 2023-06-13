import { Configuration, OpenAIApi } from "openai";

const apiKey = "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";

class CustomFormData extends FormData {
  getHeaders() {
    return {};
  }
}

export const chatRoles = {
  ASSISTANT: "assistant",
  USER: "user",
  SYSTEM: "system",
};

class OpenAI {
  constructor() {
    const configuration = new Configuration({
      apiKey,
      formDataCtor: CustomFormData,
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

  async transcription(audioFile) {
    try {
      const response = await this.openai.createTranscription(
        audioFile,
        "whisper-1"
      );
      return response.data.text;
    } catch (e) {
      console.error("Error while transcription: ", e.message);
    }
  }
}

export const openai = new OpenAI();

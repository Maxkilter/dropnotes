const config = require("config");
const { Configuration, OpenAIApi } = require("openai");
const { createReadStream } = require("fs");

class OpenAI {
  constructor(apiKey) {
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

  async transcription(audioFilePath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(audioFilePath),
        "whisper-1"
      );
      return response.data.text;
    } catch (e) {
      console.error("Error while transcription: ", e.message);
    }
  }
}

const openai = new OpenAI(config.get("apiKey"));

module.exports = openai;

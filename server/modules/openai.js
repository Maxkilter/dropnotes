const { Configuration, OpenAIApi } = require("openai");
const { createReadStream } = require("fs");

const GPT_MODELS = {
  GPT_3_5_TURBO: "gpt-3.5-turbo",
  GPT_4o: "gpt-4o",
  GPT_4o_MINI: "gpt-4o-mini",
};

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
        model: GPT_MODELS.GPT_4o_MINI,
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
        "whisper-1",
      );
      return response.data.text;
    } catch (e) {
      console.error("Error while transcription: ", e.message);
    }
  }
}

const openai = new OpenAI(process.env.API_KEY);

module.exports = openai;

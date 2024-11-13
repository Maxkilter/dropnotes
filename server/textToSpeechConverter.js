const jwt = require("jsonwebtoken");
const axios = require("axios");

const { CLIENT_EMAIL, PRIVATE_KEY } = process.env;

const languages = {
  english: {
    languageCode: "en-US",
    name: "en-US-Standard-A",
  },
  ukrainian: {
    languageCode: "uk-UA",
    name: "uk-UA-Standard-A",
  },
  russian: {
    languageCode: "ru-RU",
    name: "ru-RU-Standard-A",
  },
  french: {
    languageCode: "fr-FR",
    name: "fr-FR-Standard-A",
  },
  german: {
    languageCode: "de-DE",
    name: "de-DE-Standard-A",
  },
  italian: {
    languageCode: "it-IT",
    name: "it-IT-Standard-A",
  },
  polish: {
    languageCode: "pl-PL",
    name: "pl-PL-Standard-A",
  },
  portuguese: {
    languageCode: "pt-PT",
    name: "pt-PT-Standard-A",
  },
  spanish: {
    languageCode: "es-ES",
    name: "es-ES-Standard-A",
  },
  slovak: {
    languageCode: "sk-SK",
    name: "sk-SK-Standard-A",
  },
  turkish: {
    languageCode: "tr-TR",
    name: "tr-TR-Standard-A",
  },
};

class TextToSpeechConverter {
  getVoiceParameters(lang) {
    return languages[lang] || languages["english"];
  }
  async getToken() {
    const token = jwt.sign(
      {
        iss: CLIENT_EMAIL,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://www.googleapis.com/oauth2/v4/token",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        iat: Math.floor(Date.now() / 1000),
      },
      PRIVATE_KEY,
      { algorithm: "RS256" }
    );

    const response = await axios.post(
      "https://www.googleapis.com/oauth2/v4/token",
      {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: token,
      }
    );
    return response.data.access_token;
  }

  async textToSpeech(text, voiceParameters) {
    try {
      const url = "https://texttospeech.googleapis.com/v1/text:synthesize";

      const data = {
        input: { text },
        voice: {
          languageCode: voiceParameters.languageCode,
          name: voiceParameters.name,
        },
        audioConfig: { audioEncoding: "MP3" },
      };

      const accessToken = await this.getToken();

      const response = await axios({
        url,
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.audioContent;
    } catch (e) {
      console.error("Error while text to speech", e.message);
    }
  }
}

const textToSpeechConverter = new TextToSpeechConverter();

module.exports = textToSpeechConverter;

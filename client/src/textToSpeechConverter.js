import jwt from "jsonwebtoken";
import axios from "axios";
import keys from "./keys.json";

const client_email = keys.client_email;
const private_key = keys.private_key;

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
    return languages[lang];
  }
  async getToken() {
    const token = jwt.sign(
      {
        iss: client_email,
        scope: "https://www.googleapis.com/auth/cloud-platform",
        aud: "https://www.googleapis.com/oauth2/v4/token",
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        iat: Math.floor(Date.now() / 1000),
      },
      private_key,
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

      return Buffer.from(response.data.audioContent, "base64");
    } catch (e) {
      console.error("Error while text to speech", e.message);
    }
  }
}

export const textToSpeechConverter = new TextToSpeechConverter();

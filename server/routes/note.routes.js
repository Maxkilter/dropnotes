const { Router } = require("express");
const Note = require("../models/Note");
const authMiddleware = require("../middleware/auth.middleware");
const openai = require("../modules/openai.js");
const textToSpeechConverter = require("../modules/textToSpeechConverter.js");
const multer = require("multer");
const fs = require("fs");
const { unlink } = require("fs/promises");
const { resolve } = require("path");

const upload = multer({ dest: "records/" });
const router = Router();

const removeFile = async (filePath) => {
  try {
    return await unlink(filePath);
  } catch (e) {
    console.error("Error while removing file: ", e.message);
  }
};

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;

    const note = new Note({
      title,
      body,
      owner: req.user.userId,
    });

    await note.save();

    return res.status(201).json({ note });
  } catch (e) {
    console.error(`Error occurred while creating a note: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Error occurred while creating a note" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const chatResponse = await openai.chat(req.body.data);
    return res.json(chatResponse);
  } catch (e) {
    console.error(`Error while chat completion: ${e.message}`);
    return res.status(500).json({ message: `Error while chat completion` });
  }
});

router.post("/transcription", upload.single("audio"), async (req, res) => {
  try {
    const oldPath = req.file.path;
    const newPath = `${req.file.path}.mp3`;
    fs.rename(oldPath, newPath, (err) => {
      if (err) console.error("Error while renaming audio file");
    });
    const mp3Path = resolve(
      __dirname,
      "../records",
      `${req.file.filename}.mp3`
    );

    if (mp3Path) {
      const text = await openai.transcription(mp3Path);
      await removeFile(mp3Path);
      return res.json(text);
    }

    return res.json("");
  } catch (e) {
    console.error(`Error while voice to text request: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Error while voice to text request" });
  }
});
router.post("/speech", async (req, res) => {
  try {
    const { text, lang } = req.body.data;
    const voiceParameters = textToSpeechConverter.getVoiceParameters(lang);
    const speech = await textToSpeechConverter.textToSpeech(
      text,
      voiceParameters
    );
    return res.json(speech);
  } catch (e) {
    console.error(`Error while voice to text request: ${e.message}`);
    return res
      .status(500)
      .json({ message: `Error while text to speech request` });
  }
});

router.get("/search/:query", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      owner: req.user.userId,
      $text: { $search: req.params.query },
    }).sort({ date: -1 });
    return res.json(notes);
  } catch (e) {
    console.error(`Error while searching notes: ${e.message}`);
    return res.status(500).json({ message: "Error occurred while searching" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await Note.find({
      owner: req.user.userId,
    }).sort({ date: -1 });
    return res.status(200).json(notes);
  } catch (e) {
    console.error(`Error while fetching notes: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Error occurred while fetching notes" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    return res.status(200).json(note);
  } catch (e) {
    console.error(`Error occurred while fetching a note: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Error occurred while fetching a note" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body);
    return res.status(200).json(note);
  } catch (e) {
    console.error(`Error while updating note: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Error occurred while updating a note" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    return res.json(200);
  } catch (e) {
    console.error(`Error while deleting note: ${e.message}`);
    return res
      .status(500)
      .json({ message: "Error occurred while deleting a note" });
  }
});

module.exports = router;

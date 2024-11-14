const { Router } = require("express");
const Note = require("../models/Note");
const authMid = require("../middleware/auth.middleware");
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

router.post("/create", authMid, async (req, res) => {
  try {
    const { title, body } = req.body;

    const note = new Note({
      title,
      body,
      owner: req.user.userId,
    });

    await note.save();

    res.status(201).json({ note });
  } catch (e) {
    res.status(500).json({ message: "Error occurred while creating a note" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const chatResponse = await openai.chat(req.body.data);
    res.json(chatResponse);
  } catch (e) {
    res
      .status(500)
      .json({ message: `Error while chat completion: ${e.message}` });
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

    res.json("");
  } catch (e) {
    res
      .status(500)
      .json({ message: `Error while voice to text request: ${e.message}` });
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
    res.json(speech);
  } catch (e) {
    res
      .status(500)
      .json({ message: `Error while text to speech request: ${e.message}` });
  }
});

router.get("/search/:query", authMid, async (req, res) => {
  try {
    const notes = await Note.find({
      owner: req.user.userId,
      $text: { $search: req.params.query },
    }).sort({ date: -1 });
    res.json(notes);
  } catch (e) {
    res.status(500).json({ message: "Error occurred while searching" });
  }
});

router.get("/", authMid, async (req, res) => {
  try {
    const notes = await Note.find({
      owner: req.user.userId,
    }).sort({ date: -1 });
    res.json(notes);
  } catch (e) {
    res.status(500).json({ message: "Error occurred while fetching notes" });
  }
});

router.get("/:id", authMid, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    res.json(note);
  } catch (e) {
    res.status(500).json({ message: "Error occurred while fetching a note" });
  }
});

router.put("/:id", authMid, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body);
    res.json(note);
  } catch (e) {
    res.status(500).json({ message: "Error occurred while updating a note" });
  }
});

router.delete("/:id", authMid, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json(200);
  } catch (e) {
    res.status(500).json({ message: "Error occurred while deleting a note" });
  }
});

module.exports = router;

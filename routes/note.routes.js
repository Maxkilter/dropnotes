const { Router } = require("express");
const router = Router();
const Note = require("../models/Note");
const authMid = require("../middleware/auth.middleware");

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

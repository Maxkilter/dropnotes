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
    res.status(500).json({ message: "Something went wrong, try again :-(" });
  }
});

router.get("/", authMid, async (req, res) => {
  try {
    const notes = await Note.find({ owner: req.user.userId });
    res.json(notes);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again :-(" });
  }
});

router.get("/:id", authMid, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    res.json(note);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again :-(" });
  }
});

router.delete("/:id", authMid, async (req, res) => {
  try {
    await Note.findByIdAndRemove(req.params.id);
    res.json(200);
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again :-(" });
  }
});

module.exports = router;

const express = require("express");

// Load the word list from the server-side file
const wordList = require("./data/six_letter_words.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static("public"));

const getWordForToday = () => {
  const today = new Date();
  const startDate = new Date("2024-01-01"); // Example start date
  const dayCount = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const index = dayCount % wordList.length;

  console.log("Selected word index:", index);
  console.log("Selected word:", wordList[index]);

  return wordList[index];
};

app.get("/word", (req, res) => {
  try {
    const word = getWordForToday();
    if (!word) {
      throw new Error("No word found");
    }
    console.log("Sending word:", word);
    console.log("Sending word list:", wordList); // Log the word list
    res.json({ word, wordList }); // Send both the word and the full word list
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

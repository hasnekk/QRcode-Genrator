const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the 'public' directory
// Adjust this to the correct folder where your assets (HTML, CSS, JS) are located
app.use(express.static(path.resolve(__dirname, "../")));

// Fallback for all unknown routes to serve index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../index.html"));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

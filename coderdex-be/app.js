require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const pokemonRouter = require("./routes/pokemon.api")

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // http://localhost:5000/images/1.jpg
app.use("/pokemons", pokemonRouter)

app.get("/", (req, res) => res.send("Coderdex API is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

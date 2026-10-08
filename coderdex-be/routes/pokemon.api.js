const express = require("express");
const fs = require("fs");
const router = express.Router();

const sendError = (res, status, message) =>
  res.status(status).json({ errors: { message } });

const loadPokemon = () => JSON.parse(fs.readFileSync("db.json", "utf-8"));

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flying",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];

// GET /pokemons?page=1&limit=20&search=bulb&type=grass
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { search, type } = req.query; // why not query.search and query.type ???

  let result = loadPokemon().data;

  if (search) {
    result = result.filter(
      (p) => p.name.includes(search.toLowerCase()) || p.id === parseInt(search),
    );
  }

  if (type) {
    result = result.filter((p) => p.types.includes(type.toLowerCase()));
  }

  const totalPokemons = result.length;
  const start = (page - 1) * limit; //
  const data = result.slice(start, start + limit);

  res.status(200).json({ data, totalPokemons });
});

router.get("/:id", (req, res) => {
  const getId = parseInt(req.params.id);
  const result = loadPokemon().data;
  const index = result.findIndex((e) => e.id === getId); // use map() doesnt tell where it in an rr, use findIndex to know the position, from that load previous and next
  const pokemon = result[index];

  if (index === -1) return sendError(res, 404, "Pokemon not found");

  let previousPokemon = result[index - 1];
  let nextPokemon = result[index + 1];

  if (index === 0) {
    previousPokemon = result[result.length - 1];
  } else if (index === result.length - 1) {
    nextPokemon = result[0];
  }

  res.status(200).json({ data: { pokemon, previousPokemon, nextPokemon } });
});

router.post("/", (req, res) => {
  let { id, name, types, url } = req.body;
  const db = loadPokemon();
  const pokemons = db.data;

  types = types.filter((type) => type !== ""); // Remove any empty strings (e.g., ["fire", ""] becomes ["fire"])

  if (!id || !name || !types || !url)
    return sendError(res, 400, "Missing required data.");

  if (types.length > 2 || types.length < 1) {
    return sendError(res, 400, "Pokémon can only have one or two types.");
  }

  const typesValid = types.every((type) =>
    pokemonTypes.includes(type.toLowerCase()),
  );
  if (!typesValid) return sendError(res, 400, "Pokémon's type is invalid.");

  const checkExist = pokemons.some(
    (pokemon) => pokemon.id === parseInt(id) || pokemon.name === name,
  );
  if (checkExist) return sendError(res, 400, "The Pokémon is exist.");

  const newPokemon = { id: parseInt(id), name, types, url };
  pokemons.push(newPokemon);
  db.totalPokemons = pokemons.length;

  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
  res.status(200).json({ data: newPokemon });
});

module.exports = router;

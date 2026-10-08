const fs = require("fs");
const csv = require("csvtojson");

const createData = async () => {
  // 1. Read CSV file
  const rawData = await csv().fromFile("public/Pokemon.csv");

  // 2. Read all image filenames in public/images
  const imageFiles = fs.readdirSync("public/images");

  const pokemonList = [];
  const seenIds = new Set();

  for (let row of rawData) {
    const id = parseInt(row["#"]);

    // Only keep Gen 1 - 6 (IDs 1 to 721) and skip duplicates (Mega evolutions)
    if (id < 1 || id > 721 || seenIds.has(id)) {
      continue;
    }

    // Find the matching image file in public/images
    const imageFile = imageFiles.find(
      (file) =>
        file === `${id}.jpg` ||
        file === `${id}.png` ||
        file.startsWith(`${id}-`),
    );

    // If no image exists, skip
    if (!imageFile) {
      continue;
    }

    // Types array (lowercase)
    const types = [row["Type 1"].toLowerCase()];
    if (row["Type 2"]) {
      types.push(row["Type 2"].toLowerCase());
    }

    pokemonList.push({
      id: id,
      name: row["Name"].toLowerCase(),
      types: types,
      url: `http://localhost:5000/images/${imageFile}`,
    });

    seenIds.add(id);
  }

  // 3. Format according to README requirement
  const finalData = {
    data: pokemonList,
    totalPokemons: pokemonList.length,
  };

  // 4. Save to db.json (or pokemons.json)
  fs.writeFileSync("db.json", JSON.stringify(finalData, null, 2));
  console.log(
    `Successfully created db.json with ${pokemonList.length} Pokémon!`,
  );
};

// Execute the function
createData();

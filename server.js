const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Load API key
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
console.log("Loaded API Key:", SPOONACULAR_API_KEY ? "✅ Key Loaded" : "❌ No Key Found");

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/get-recipes', async (req, res) => {
  let { ingredients } = req.body;
  console.log('Received ingredients:', ingredients);

  // Ensure it's a proper list
  const ingredientList = Array.isArray(ingredients) ? ingredients.join(',') : ingredients;

  const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
    ingredientList
  )}&number=5&apiKey=${SPOONACULAR_API_KEY}`;

  try {
    const apiRes = await fetch(apiUrl);
    const recipes = await apiRes.json();

    // Debug log
    console.log("Spoonacular response:", recipes);

    // Check if response is array
    if (!Array.isArray(recipes)) {
      return res.status(500).json({
        error: "Spoonacular API did not return a recipe list",
        details: recipes
      });
    }

    // Fetch details
    const recipeDetails = await Promise.all(
      recipes.map(async (recipe) => {
        const infoRes = await fetch(
          `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}`
        );
        const info = await infoRes.json();
        return {
          title: recipe.title,
          image: recipe.image,
          sourceUrl: info.sourceUrl
        };
      })
    );

    res.json(recipeDetails);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ingredientForm");
  const input = document.getElementById("ingredients");
  const resultsDiv = document.getElementById("results");

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // 🚫 Stop page from reloading

    const ingredients = input.value.trim();

    if (!ingredients) {
      resultsDiv.innerHTML = `<p>Please enter some ingredients.</p>`;
      return;
    }

    resultsDiv.innerHTML = `<p>Loading recipes for "${ingredients}"...</p>`;

    try {
      const response = await fetch('/get-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients })
      });

      const data = await response.json();
      resultsDiv.innerHTML = ""; // clear loading text

      if (!Array.isArray(data) || data.length === 0) {
        resultsDiv.innerHTML = `<p>No recipes found for "${ingredients}"</p>`;
        return;
      }

      // 🧠 Optional: input.value = ""; // Clear input AFTER success

      data.forEach((recipe) => {
        resultsDiv.innerHTML += `
          <div class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}">
            <div class="recipe-title">${recipe.title}</div>
            <a href="${recipe.sourceUrl}" target="_blank">View Recipe</a>
          </div>
        `;
      });

    } catch (err) {
      console.error('Error fetching recipes:', err);
      resultsDiv.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    }
  });
});

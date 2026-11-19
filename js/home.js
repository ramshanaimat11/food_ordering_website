document.addEventListener("DOMContentLoaded", function () {

    // Home Page Search Functionality
    const searchInput = document.querySelector(".nav-search input");
    const foodCards = document.querySelectorAll(".home-food-card");

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchValue = searchInput.value.toLowerCase().trim();

            foodCards.forEach(function (card) {

                const foodName = card.querySelector("h3").textContent.toLowerCase();
                const foodDescription = card.querySelector("p").textContent.toLowerCase();

                if (
                    foodName.includes(searchValue) ||
                    foodDescription.includes(searchValue)
                ) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }

            });

        });

    }

    // Category Navigation
    const categoryCards = document.querySelectorAll(".home-category-card");

    categoryCards.forEach(function (card) {

        card.addEventListener("click", function () {
            window.location.href = "menu.html";
        });

    });

});
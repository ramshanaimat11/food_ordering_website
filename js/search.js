const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const recentTagsContainer = document.getElementById("recentSearchTags");

let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || ["Smash Burger", "Pepperoni Pizza", "Poke Bowl"];

function renderRecentTags() {
    recentTagsContainer.innerHTML = "";
    recentSearches.forEach((term, index) => {
        const tag = document.createElement("span");
        tag.className = "recent-tag";
        tag.innerHTML = `
            <span onclick="triggerRecent('${term}')">${term}</span>
            <i class="fas fa-times" onclick="deleteRecent(${index})"></i>
        `;
        recentTagsContainer.appendChild(tag);
    });
}

searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value.toLowerCase().trim();
    clearSearchBtn.style.display = currentSearch ? "block" : "none";
    renderMenu();
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchInput.value.trim()) {
        const val = searchInput.value.trim();
        if (!recentSearches.includes(val)) {
            recentSearches.unshift(val);
            if (recentSearches.length > 5) recentSearches.pop();
            localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
            renderRecentTags();
        }
    }
});

clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    currentSearch = "";
    clearSearchBtn.style.display = "none";
    renderMenu();
});

function triggerRecent(term) {
    searchInput.value = term;
    currentSearch = term.toLowerCase();
    clearSearchBtn.style.display = "block";
    renderMenu();
}

function deleteRecent(idx) {
    recentSearches.splice(idx, 1);
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    renderRecentTags();
}

renderRecentTags();
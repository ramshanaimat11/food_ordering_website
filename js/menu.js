// Menu Page JavaScript - Connected with MySQL & PHP Backend

let menuItems = [];
let cart = JSON.parse(sessionStorage.getItem("foodCart")) || [];
let currentCategory = "All";
let currentSort = "popular";
let searchQuery = "";
let selectedDish = null;

document.addEventListener("DOMContentLoaded", () => {
    fetchMenuFromDatabase();
    setupEventListeners();
    updateCartUI();
    renderRecentSearches();
});

// Fetch Menu from PHP/MySQL API
async function fetchMenuFromDatabase() {
    const foodGrid = document.getElementById("foodGrid");
    foodGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 30px;">Loading fresh menu...</p>`;

    try {
        const response = await fetch("../php/get_menu.php");
        const data = await response.json();

        if (data.status === "success" && data.items.length > 0) {
            menuItems = data.items;
            renderMenu();
        } else {
            foodGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No menu items found in database.</p>`;
        }
    } catch (error) {
        console.error("Error fetching menu:", error);
        foodGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">Failed to connect to database. Make sure XAMPP Apache & MySQL are running.</p>`;
    }
}

function formatPrice(amount) {
    return "Rs. " + Math.round(Number(amount)).toLocaleString();
}

function renderMenu() {
    const foodGrid = document.getElementById("foodGrid");
    const itemCountText = document.getElementById("itemCountText");

    let filtered = menuItems.filter(item => {
        const matchesCat = currentCategory === "All" || item.category === currentCategory;
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    if (currentSort === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (currentSort === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    itemCountText.textContent = `Showing ${filtered.length} item${filtered.length !== 1 ? "s" : ""}`;
    foodGrid.innerHTML = "";

    if (filtered.length === 0) {
        foodGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 30px;">No dishes matched your search.</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "food-card";
        card.innerHTML = `
            <div class="card-img-wrap">
                <span class="food-badge">${item.badge || "Fresh"}</span>
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="card-body">
                <div class="card-meta">
                    <span class="cat-label">${item.category}</span>
                    <span class="rating"><i class="fas fa-star"></i> ${item.rating} • ${item.prepTime}</span>
                </div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="card-footer">
                    <span class="price">${formatPrice(item.price)}</span>
                    <button class="add-btn" onclick="openCustomizeModal(${item.id})">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
        foodGrid.appendChild(card);
    });
}

function setupEventListeners() {
    document.querySelectorAll(".cat-pill").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".cat-pill").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.dataset.category;
            document.getElementById("menuHeading").textContent =
                currentCategory === "All" ? "All Menu Items" : `${currentCategory} Menu`;
            renderMenu();
        });
    });

    document.getElementById("sortSelect").addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderMenu();
    });

    const searchInput = document.getElementById("searchInput");
    const clearSearch = document.getElementById("clearSearch");

    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        clearSearch.style.display = searchQuery ? "block" : "none";
        renderMenu();
    });

    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchQuery.length > 1) {
            saveRecentSearch(searchQuery);
        }
    });

    clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearch.style.display = "none";
        renderMenu();
    });

    document.getElementById("closeModal").addEventListener("click", () => {
        document.getElementById("itemModal").classList.remove("active");
    });

    document.getElementById("modalAddBtn").addEventListener("click", addSelectedDishToCart);

    document.getElementById("openCartDrawer").addEventListener("click", () => {
        document.getElementById("cartDrawer").classList.add("open");
        document.getElementById("drawerOverlay").classList.add("open");
    });

    const closeDrawer = () => {
        document.getElementById("cartDrawer").classList.remove("open");
        document.getElementById("drawerOverlay").classList.remove("open");
    };

    document.getElementById("closeCartDrawer").addEventListener("click", closeDrawer);
    document.getElementById("drawerOverlay").addEventListener("click", closeDrawer);
}

function openCustomizeModal(id) {
    selectedDish = menuItems.find(item => item.id === id);
    if (!selectedDish) return;

    document.getElementById("modalImg").src = selectedDish.image;
    document.getElementById("modalTitle").textContent = selectedDish.name;
    document.getElementById("modalPrice").textContent = formatPrice(selectedDish.price);
    document.getElementById("modalDesc").textContent = selectedDish.description;
    document.getElementById("specialNote").value = "";
    document.querySelector('input[name="size"][value="0"]').checked = true;

    document.getElementById("itemModal").classList.add("active");
}

function addSelectedDishToCart() {
    if (!selectedDish) return;

    const extraCost = Number(document.querySelector('input[name="size"]:checked').value);
    const sizeLabel = extraCost > 0 ? "Large Meal" : "Regular";
    const note = document.getElementById("specialNote").value.trim();
    const finalPrice = selectedDish.price + extraCost;

    const existingIndex = cart.findIndex(
        c => c.id === selectedDish.id && c.size === sizeLabel && c.note === note
    );

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: selectedDish.id,
            name: selectedDish.name,
            price: finalPrice,
            image: selectedDish.image,
            size: sizeLabel,
            note: note,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    document.getElementById("itemModal").classList.remove("active");
    showToast(`${selectedDish.name} added to cart!`);
}

function saveCart() {
    sessionStorage.setItem("foodCart", JSON.stringify(cart));
}

function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("navCartCount").textContent = totalQty;

    const drawerList = document.getElementById("drawerItemsList");
    drawerList.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {
        drawerList.innerHTML = `<p style="text-align:center; color:#777; margin-top:40px;">Your cart is empty.</p>`;
    } else {
        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            const row = document.createElement("div");
            row.className = "drawer-item";
            row.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="drawer-item-info">
                    <h4>${item.name}</h4>
                    <small>${item.size}${item.note ? " • " + item.note : ""}</small>
                    <div class="drawer-item-bottom">
                        <span>${formatPrice(item.price * item.quantity)}</span>
                        <div class="qty-controls">
                            <button onclick="changeDrawerQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="changeDrawerQty(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
            `;
            drawerList.appendChild(row);
        });
    }

    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    document.getElementById("drawerSubtotal").textContent = formatPrice(subtotal);
    document.getElementById("drawerTax").textContent = formatPrice(tax);
    document.getElementById("drawerTotal").textContent = formatPrice(total);
}

function changeDrawerQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
}

function saveRecentSearch(term) {
    let recent = JSON.parse(sessionStorage.getItem("recentSearches")) || [];
    recent = [term, ...recent.filter(r => r.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    sessionStorage.setItem("recentSearches", JSON.stringify(recent));
    renderRecentSearches();
}

function renderRecentSearches() {
    const bar = document.getElementById("recentSearchBar");
    const tags = document.getElementById("recentSearchTags");
    const recent = JSON.parse(sessionStorage.getItem("recentSearches")) || [];

    if (recent.length === 0) {
        bar.style.display = "none";
        return;
    }

    bar.style.display = "flex";
    tags.innerHTML = recent
        .map(term => `<button class="recent-tag" onclick="applyRecentSearch('${term}')">${term}</button>`)
        .join("");
}

function applyRecentSearch(term) {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = term;
    searchQuery = term;
    document.getElementById("clearSearch").style.display = "block";
    renderMenu();
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}
const menuItems = [
    {
        id: 101,
        name: "Smoky Double Smash Burger",
        category: "Burger",
        price: 850,
        rating: 4.9,
        prepTime: "20 min",
        badge: "🔥 Bestseller",
        desc: "Double flame-grilled beef patties, aged cheddar, caramelized onions, smoky house sauce.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
    },
    {
        id: 102,
        name: "Wood-Fired Pepperoni Pizza",
        category: "Pizza",
        price: 1650,
        rating: 4.8,
        prepTime: "25 min",
        badge: "⭐ Chef's Choice",
        desc: "Hand-tossed sourdough crust, San Marzano tomato sauce, mozzarella, crispy beef pepperoni.",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500"
    },
    {
        id: 103,
        name: "Grilled Salmon Poke Bowl",
        category: "Asian",
        price: 1450,
        rating: 4.9,
        prepTime: "15 min",
        badge: "🥗 Fresh",
        desc: "Teriyaki glazed Atlantic salmon, sushi rice, avocado, edamame, sesame dressing.",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500"
    },
    {
        id: 104,
        name: "Crispy Zinger Fillet Burger",
        category: "Burger",
        price: 650,
        rating: 4.7,
        prepTime: "18 min",
        badge: "⚡ Popular",
        desc: "Crunchy spiced chicken breast, iceberg lettuce, jalapeños, creamy garlic mayo.",
        image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?w=500"
    },
    {
        id: 105,
        name: "Margherita Basil Pizza",
        category: "Pizza",
        price: 1350,
        rating: 4.6,
        prepTime: "22 min",
        badge: "🌿 Classic",
        desc: "Fresh buffalo mozzarella, sweet basil leaves, extra virgin olive oil, rich tomato base.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500"
    },
    {
        id: 106,
        name: "Mediterranean Avocado Salad",
        category: "Healthy",
        price: 950,
        rating: 4.8,
        prepTime: "12 min",
        badge: "💚 Low Cal",
        desc: "Hass avocado, cherry tomatoes, feta cheese, cucumber, roasted chickpeas, lemon vinaigrette.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
    },
    {
        id: 107,
        name: "Dragon Tempura Sushi Roll",
        category: "Asian",
        price: 1550,
        rating: 4.9,
        prepTime: "20 min",
        badge: "🍣 Top Rated",
        desc: "8 pcs crispy prawn tempura roll topped with sliced avocado and sweet eel glaze.",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500"
    },
    {
        id: 108,
        name: "Molten Chocolate Lava Cake",
        category: "Desserts",
        price: 550,
        rating: 4.9,
        prepTime: "15 min",
        badge: "🍫 Sweet Treat",
        desc: "Warm Belgian dark chocolate cake with a gooey center, served with vanilla bean ice cream.",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500"
    }
];

let currentCategory = "All";
let currentSearch = "";
let selectedModalItem = null;

const foodGrid = document.getElementById("foodGrid");
const sortSelect = document.getElementById("sortSelect");

function formatPrice(amount) {
    return `Rs. ${Math.round(amount).toLocaleString()}`;
}

// Render Menu Cards
function renderMenu() {
    let filtered = menuItems.filter(item => {
        const matchesCat = currentCategory === "All" || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(currentSearch) ||
                              item.desc.toLowerCase().includes(currentSearch) ||
                              item.category.toLowerCase().includes(currentSearch);
        return matchesCat && matchesSearch;
    });

    const sortBy = sortSelect.value;
    if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

    document.getElementById("itemCountText").textContent = `Showing ${filtered.length} items`;
    foodGrid.innerHTML = "";

    if (filtered.length === 0) {
        foodGrid.innerHTML = `<p style="color:#9ca3af; grid-column: 1/-1; text-align:center; padding:40px;">No dishes matched your search. Try another keyword!</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "food-card";
        card.innerHTML = `
            <div class="card-img-wrap" onclick="openItemModal(${item.id})">
                <img src="${item.image}" alt="${item.name}">
                <span class="card-badge">${item.badge}</span>
            </div>
            <div class="card-body">
                <div class="card-title-row">
                    <h3 onclick="openItemModal(${item.id})">${item.name}</h3>
                    <span class="card-price">${formatPrice(item.price)}</span>
                </div>
                <p class="card-desc">${item.desc}</p>
                <div class="card-meta">
                    <span>⭐ ${item.rating} • ${item.prepTime}</span>
                    <div class="card-actions">
                        <button class="customize-btn" onclick="openItemModal(${item.id})">Customize</button>
                        <button class="quick-add-btn" onclick="addToCart(${item.id}, 0, 'Regular')">+ Add</button>
                    </div>
                </div>
            </div>
        `;
        foodGrid.appendChild(card);
    });
}

// Category Filtering
document.querySelectorAll(".cat-pill").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".cat-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCategory = btn.dataset.category;
        document.getElementById("menuHeading").textContent = currentCategory === "All" ? "All Menu Items" : `${currentCategory} Menu`;
        renderMenu();
    });
});

sortSelect.addEventListener("change", renderMenu);

// Customization Modal
function openItemModal(id) {
    selectedModalItem = menuItems.find(i => i.id === id);
    document.getElementById("modalImg").src = selectedModalItem.image;
    document.getElementById("modalTitle").textContent = selectedModalItem.name;
    document.getElementById("modalPrice").textContent = formatPrice(selectedModalItem.price);
    document.getElementById("modalDesc").textContent = selectedModalItem.desc;
    document.getElementById("specialNote").value = "";
    document.getElementById("itemModal").classList.add("active");
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("itemModal").classList.remove("active");
});

document.getElementById("modalAddBtn").addEventListener("click", () => {
    const extraPrice = parseFloat(document.querySelector('input[name="size"]:checked').value);
    const sizeLabel = extraPrice > 0 ? "Large Meal" : "Regular";
    const note = document.getElementById("specialNote").value.trim();
    addToCart(selectedModalItem.id, extraPrice, sizeLabel, note);
    document.getElementById("itemModal").classList.remove("active");
});

// Add to Cart & Live Drawer Update
function addToCart(id, extraPrice = 0, size = "Regular", note = "") {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    const item = menuItems.find(i => i.id === id);
    const finalPrice = item.price + extraPrice;
    const cartKey = `${id}-${size}-${note}`;

    const existing = cart.find(c => c.cartKey === cartKey);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            cartKey,
            id: item.id,
            name: item.name,
            price: finalPrice,
            size,
            note,
            image: item.image,
            quantity: 1
        });
    }

    localStorage.setItem("foodCart", JSON.stringify(cart));
    updateLiveDrawer();
    showToast(`Added "${item.name}" to your cart!`);
}

// Slide-Over Cart Drawer Controls
const cartDrawer = document.getElementById("cartDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");

document.getElementById("openCartDrawer").addEventListener("click", () => {
    cartDrawer.classList.add("open");
    drawerOverlay.classList.add("active");
});

function closeDrawer() {
    cartDrawer.classList.remove("open");
    drawerOverlay.classList.remove("active");
}

document.getElementById("closeCartDrawer").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", closeDrawer);

function updateLiveDrawer() {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.getElementById("navCartCount").textContent = totalQty;

    const list = document.getElementById("drawerItemsList");
    list.innerHTML = "";

    if (cart.length === 0) {
        list.innerHTML = `<p style="color:#9ca3af; text-align:center; margin-top:40px;">Your cart is empty.</p>`;
    } else {
        cart.forEach((item, idx) => {
            list.innerHTML += `
                <div class="drawer-item">
                    <div>
                        <strong>${item.name}</strong>
                        <div style="font-size:12px; color:#9ca3af;">${item.size} ${item.note ? `• ${item.note}` : ""}</div>
                        <div style="color:#ff5722; font-weight:600;">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button onclick="updateDrawerQty(${idx}, -1)" style="padding:2px 8px;">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateDrawerQty(${idx}, 1)" style="padding:2px 8px;">+</button>
                    </div>
                </div>
            `;
        });
    }

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    document.getElementById("drawerSubtotal").textContent = formatPrice(subtotal);
    document.getElementById("drawerTax").textContent = formatPrice(tax);
    document.getElementById("drawerTotal").textContent = formatPrice(total);
}

function updateDrawerQty(index, delta) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    localStorage.setItem("foodCart", JSON.stringify(cart));
    updateLiveDrawer();
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}

renderMenu();
updateLiveDrawer();
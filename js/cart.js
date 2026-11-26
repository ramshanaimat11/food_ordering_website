// Cart Page JavaScript - Connected with PHP Promo Validation API

let cart = JSON.parse(sessionStorage.getItem("foodCart")) || [];
let discountPercent = 0;
let deliveryFee = 150;

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    setupCartEvents();
});

function formatPrice(amount) {
    return "Rs. " + Math.round(Number(amount)).toLocaleString();
}

function renderCart() {
    const container = document.getElementById("cartItemsContainer");
    const countEl = document.getElementById("totalItemsCount");

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px;">
                <i class="fas fa-shopping-basket" style="font-size: 40px; color: #ccc; margin-bottom: 12px;"></i>
                <h3>Your cart is empty</h3>
                <p style="color: #777; margin: 8px 0 18px;">Looks like you haven't added any dishes yet.</p>
                <a href="menu.html" class="primary-btn" style="display:inline-block; text-decoration:none;">Browse Menu</a>
            </div>
        `;
        updateBillSummary(0);
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        subtotal += lineTotal;

        const row = document.createElement("div");
        row.className = "cart-item-row";
        row.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="item-sub">${item.size}${item.note ? " • Note: " + item.note : ""}</p>
                <span class="unit-price">${formatPrice(item.price)} each</span>
            </div>
            <div class="cart-qty-box">
                <button onclick="updateQty(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQty(${index}, 1)">+</button>
            </div>
            <div class="cart-line-total">${formatPrice(lineTotal)}</div>
            <button class="remove-item-btn" onclick="removeItem(${index})"><i class="fas fa-trash"></i></button>
        `;
        container.appendChild(row);
    });

    updateBillSummary(subtotal);
}

function updateBillSummary(subtotal) {
    const activeDelivery = cart.length > 0 ? deliveryFee : 0;
    const tax = Math.round(subtotal * 0.08);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = Math.max(0, subtotal + activeDelivery + tax - discountAmount);

    document.getElementById("subtotalAmount").textContent = formatPrice(subtotal);
    document.getElementById("deliveryAmount").textContent = formatPrice(activeDelivery);
    document.getElementById("taxAmount").textContent = formatPrice(tax);

    const discountRow = document.getElementById("discountRow");
    if (discountAmount > 0) {
        discountRow.style.display = "flex";
        document.getElementById("discountAmount").textContent = "-" + formatPrice(discountAmount);
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("totalAmount").textContent = formatPrice(total);

    sessionStorage.setItem("orderSummary", JSON.stringify({
        subtotal: subtotal,
        deliveryFee: activeDelivery,
        tax: tax,
        discount: discountAmount,
        total: total
    }));
}

function setupCartEvents() {
    document.getElementById("clearCartBtn").addEventListener("click", () => {
        if (cart.length === 0) return;
        cart = [];
        sessionStorage.removeItem("foodCart");
        sessionStorage.removeItem("orderSummary");
        renderCart();
        showToast("Cart cleared!");
    });

    document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            deliveryFee = Number(e.target.value);
            renderCart();
        });
    });

    // Validate Promo Code from MySQL Backend
    document.getElementById("applyPromoBtn").addEventListener("click", async () => {
        const code = document.getElementById("promoInput").value.trim();
        const feedback = document.getElementById("promoFeedback");

        if (!code) {
            feedback.textContent = "Please enter a promo code.";
            feedback.style.color = "red";
            return;
        }

        try {
            const response = await fetch(`../php/check_promo.php?code=${encodeURIComponent(code)}`);
            const data = await response.json();

            if (data.status === "success") {
                discountPercent = data.discount_percent;
                feedback.textContent = data.message;
                feedback.style.color = "green";
                renderCart();
            } else {
                discountPercent = 0;
                feedback.textContent = data.message;
                feedback.style.color = "red";
                renderCart();
            }
        } catch (error) {
            feedback.textContent = "Server error verifying promo code.";
            feedback.style.color = "red";
        }
    });

    document.getElementById("proceedCheckoutBtn").addEventListener("click", () => {
        if (cart.length === 0) {
            showToast("Please add items to your cart first!");
            return;
        }
        window.location.href = "checkout.html";
    });
}

function updateQty(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    sessionStorage.setItem("foodCart", JSON.stringify(cart));
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    sessionStorage.setItem("foodCart", JSON.stringify(cart));
    renderCart();
    showToast("Item removed from cart.");
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
}
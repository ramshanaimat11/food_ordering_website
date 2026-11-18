let discountPercent = 0;

function renderCartPage() {
    const cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    const container = document.getElementById("cartItemsContainer");
    document.getElementById("totalItemsCount").textContent = cart.reduce((s, i) => s + i.quantity, 0);

    container.innerHTML = "";
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 0;">
                <p style="color:#9ca3af; margin-bottom:15px;">Your shopping cart is currently empty.</p>
                <a href="menu.html" class="primary-btn">Browse Delicious Food</a>
            </div>
        `;
        calculateBill(cart);
        return;
    }

    cart.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-row">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-row-info">
                    <h4>${item.name}</h4>
                    <small>Size: ${item.size} ${item.note ? `| Note: ${item.note}` : ""}</small>
                    <strong style="color:#ff5722;">$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                <div class="qty-controls">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>
                <button class="remove-item-btn" onclick="deleteCartItem(${index})"><i class="fas fa-trash"></i></button>
            </div>
        `;
    });

    calculateBill(cart);
}

function changeQty(index, delta) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    localStorage.setItem("foodCart", JSON.stringify(cart));
    renderCartPage();
}

function deleteCartItem(index) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("foodCart", JSON.stringify(cart));
    renderCartPage();
}

document.getElementById("clearCartBtn").addEventListener("click", () => {
    localStorage.removeItem("foodCart");
    renderCartPage();
});

document.querySelectorAll('input[name="deliveryType"]').forEach(radio => {
    radio.addEventListener("change", () => {
        const cart = JSON.parse(localStorage.getItem("foodCart")) || [];
        calculateBill(cart);
    });
});

function calculateBill(cart) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliverySelect = parseFloat(document.querySelector('input[name="deliveryType"]:checked').value);
    const deliveryFee = subtotal > 0 ? deliverySelect : 0;
    const tax = subtotal * 0.08;
    const discount = subtotal * discountPercent;
    const total = subtotal + deliveryFee + tax - discount;

    document.getElementById("subtotalAmount").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("deliveryAmount").textContent = `$${deliveryFee.toFixed(2)}`;
    document.getElementById("taxAmount").textContent = `$${tax.toFixed(2)}`;

    const discountRow = document.getElementById("discountRow");
    if (discountPercent > 0 && subtotal > 0) {
        discountRow.style.display = "flex";
        document.getElementById("discountAmount").textContent = `-$${discount.toFixed(2)}`;
    } else {
        discountRow.style.display = "none";
    }

    document.getElementById("totalAmount").textContent = `$${total.toFixed(2)}`;

    localStorage.setItem("orderSummary", JSON.stringify({
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        tax: tax.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2)
    }));
}

document.getElementById("applyPromoBtn").addEventListener("click", () => {
    const code = document.getElementById("promoInput").value.trim().toUpperCase();
    const feedback = document.getElementById("promoFeedback");

    if (code === "TASTY20") {
        discountPercent = 0.20;
        feedback.style.color = "#10b981";
        feedback.textContent = "Awesome! 20% discount applied.";
    } else if (code === "SAVE10") {
        discountPercent = 0.10;
        feedback.style.color = "#10b981";
        feedback.textContent = "10% discount applied!";
    } else {
        discountPercent = 0;
        feedback.style.color = "#ef4444";
        feedback.textContent = "Invalid promo code. Use TASTY20 or SAVE10.";
    }
    renderCartPage();
});

document.getElementById("proceedCheckoutBtn").addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    if (cart.length === 0) {
        alert("Please add at least one item to your cart before checkout!");
        return;
    }
    window.location.href = "checkout.html";
});

renderCartPage();
// Checkout Page JavaScript

document.addEventListener("DOMContentLoaded", function () {

    const checkoutForm = document.getElementById("checkoutForm");
    const checkoutItems = document.getElementById("checkoutItems");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    // Get Cart Data
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];

    // Get Order Summary
    let summary = JSON.parse(localStorage.getItem("orderSummary")) || {};

    // Currency Formatter
    function formatPrice(amount) {
        return "Rs. " + Number(amount).toFixed(2);
    }

    // Display Order Summary
    function renderCheckout() {

        checkoutItems.innerHTML = "";

        if (cart.length === 0) {
            checkoutItems.innerHTML =
                "<p>Your cart is empty. Please add food items first.</p>";

            checkoutTotal.textContent = formatPrice(0);
            placeOrderBtn.disabled = true;
            return;
        }

        placeOrderBtn.disabled = false;

        let subtotal = 0;

        cart.forEach(item => {

            const itemTotal = Number(item.price) * Number(item.quantity);
            subtotal += itemTotal;

            const itemDiv = document.createElement("div");
            itemDiv.className = "checkout-item";

            const itemName = document.createElement("span");
            itemName.textContent =
                `${item.name} x ${item.quantity}`;

            const itemPrice = document.createElement("strong");
            itemPrice.textContent = formatPrice(itemTotal);

            itemDiv.appendChild(itemName);
            itemDiv.appendChild(itemPrice);

            checkoutItems.appendChild(itemDiv);
        });

        // Calculate Bill
        const savedSubtotal = Number(summary.subtotal);

        if (!Number.isFinite(savedSubtotal) ||
            savedSubtotal !== subtotal) {
            summary.subtotal = subtotal.toFixed(2);
            summary.tax = (subtotal * 0.08).toFixed(2);
            summary.deliveryFee = "0.00";
            summary.discount = "0.00";
        }

        const tax = Number(summary.tax) || 0;
        const delivery = Number(summary.deliveryFee) || 0;
        const discount = Number(summary.discount) || 0;

        const total = subtotal + tax + delivery - discount;

        checkoutTotal.textContent = formatPrice(total);

        // Save Updated Summary
        summary.total = total.toFixed(2);

        localStorage.setItem(
            "orderSummary",
            JSON.stringify(summary)
        );

        // Display Bill Details
        const billDetails = document.createElement("div");
        billDetails.innerHTML = `
            <div class="checkout-item">
                <span>Subtotal</span>
                <strong>${formatPrice(subtotal)}</strong>
            </div>
            <div class="checkout-item">
                <span>Tax (8%)</span>
                <strong>${formatPrice(tax)}</strong>
            </div>
            <div class="checkout-item">
                <span>Delivery Charges</span>
                <strong>${formatPrice(delivery)}</strong>
            </div>
            <div class="checkout-item">
                <span>Discount</span>
                <strong>-${formatPrice(discount)}</strong>
            </div>
        `;

        checkoutItems.appendChild(billDetails);
    }

    // Place Order
    checkoutForm.addEventListener("submit", function (event) {

        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Customer Information
        const customer = {
            name: document.getElementById("customerName").value.trim(),
            email: document.getElementById("customerEmail").value.trim(),
            phone: document.getElementById("customerPhone").value.trim()
        };

        // Delivery Information
        const address = {
            street: document.getElementById("streetAddress").value.trim(),
            city: document.getElementById("city").value.trim(),
            postalCode: document.getElementById("postalCode").value.trim(),
            instructions: document.getElementById("deliveryInstructions").value.trim()
        };

        const paymentMethod = document.querySelector(
            'input[name="paymentMethod"]:checked'
        ).value;

        // Create Order
        const order = {
            orderId: "FH" + Date.now(),
            customer: customer,
            address: address,
            paymentMethod: paymentMethod,
            items: cart,
            summary: summary,
            orderDate: new Date().toLocaleString(),
            status: "Pending"
        };

        // Save Order in LocalStorage
        let orders = JSON.parse(localStorage.getItem("foodOrders")) || [];

        orders.push(order);

        localStorage.setItem(
            "foodOrders",
            JSON.stringify(orders)
        );

        // Clear Cart
        localStorage.removeItem("foodCart");
        localStorage.removeItem("orderSummary");

        alert(
            "Congratulations! Your order has been placed successfully."
        );

        // Redirect to Order History
        window.location.href = "order-history.html";
    });

    // Initial Render
    renderCheckout();

});
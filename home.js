document.addEventListener("DOMContentLoaded", function () {
    // Handle category selection
    const categoryItems = document.querySelectorAll(".category-item");
    categoryItems.forEach((item) => {
        item.addEventListener("click", function () {
            categoryItems.forEach((cat) => cat.classList.remove("active"));
            this.classList.add("active");
        });
    });

    // Handle wishlist toggling
    const wishlistButtons = document.querySelectorAll(".product-action-button:first-child");
    wishlistButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const icon = this.querySelector("i");
            icon.classList.toggle("far");
            icon.classList.toggle("fas");
        });
    });

    // Handle add to cart button click
    const addToCartButtons = document.querySelectorAll(".add-to-cart");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function () {
            showNotification("✔ Product added to cart successfully!");
        });
    });

    // Function to display notification at the top
    function showNotification(message) {
        let notification = document.createElement("div");
        notification.className = "notification";
        notification.innerHTML = `<span class="tick-icon">✔</span> ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }

    // Handle product image click to navigate to cart page
    const productImages = document.querySelectorAll(".product-image");
    productImages.forEach((image) => {
        image.addEventListener("click", function () {
            window.location.href = "cart.html";
        });
    });

    // Handle cart button click (Navigate to cart page)
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) {
        cartBtn.addEventListener("click", function () {
            window.location.href = "cart.html";
        });
    }

    // Handle profile button click (Navigate to profile page)
    const profileBtn = document.getElementById("profile-btn");
    if (profileBtn) {
        profileBtn.addEventListener("click", function () {
            window.location.href = "profile.html";
        });
    }
});

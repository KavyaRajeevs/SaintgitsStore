document.addEventListener("DOMContentLoaded", function () {
    const product = JSON.parse(localStorage.getItem("cartItem"));

    if (product) {
        // document.getElementById("product-image").src = product.image;
        document.getElementById("product-name").textContent = 'Premium Ergonomic Ballpoint Pen';
        document.getElementById("product-price").textContent = `Rs:20.00`;
        document.getElementById("product-description").textContent = "Experience effortless writing with our Premium Ergonomic Ballpoint Pen. Designed for comfort during extended use, this pen features a cushioned grip that reduces fatigue and enhances control.";
    }

    let quantity = 1;
    const quantityDisplay = document.getElementById("quantity");
    const increaseQtyButton = document.getElementById("increase-qty");
    const decreaseQtyButton = document.getElementById("decrease-qty");

    increaseQtyButton.addEventListener("click", function () {
        quantity++;
        quantityDisplay.textContent = quantity;
    });

    decreaseQtyButton.addEventListener("click", function () {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
        }
    });

    const wishlistButton = document.querySelector(".wishlist i");
    wishlistButton.addEventListener("click", function () {
        wishlistButton.classList.toggle("far");
        wishlistButton.classList.toggle("fas");
    });
});





home.js





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

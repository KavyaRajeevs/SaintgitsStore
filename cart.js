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

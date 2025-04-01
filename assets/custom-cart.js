import { mapData, updateMapStyles } from "./custom-map-utils.js";

document.addEventListener("DOMContentLoaded", () => {
    const buttonAddToCart = document.querySelector('button[type="submit"][name="add"].product-form__submit');
    const productForm = document.querySelector('form[action="/cart/add"]');

    buttonAddToCart.addEventListener("click", async (e) => {
        e.preventDefault();
        updateMapStyles(mapData);

        try {
            // 1. Récupérer les infos du produit
            const formData = new FormData(productForm);
            const variantId = formData.get('id');
            const quantity = formData.get('quantity') || 1;

            // 2. Ajouter au panier avec les propriétés
            const response = await fetch(window.Shopify.routes.root + "cart/add.js", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: [{
                        id: variantId,
                        quantity: parseInt(quantity),
                        properties: {
                            mapData: JSON.stringify(mapData)
                        }
                    }]
                }),
            });

            const data = await response.json();
            console.log("Réponse du panier:", data);

            // 3. Vérification
            const cartResponse = await fetch("/cart.js");
            const cartData = await cartResponse.json();
            console.log("Contenu actuel du panier:", cartData);

        } catch (error) {
            console.error("Erreur:", error);
        }
    });
});
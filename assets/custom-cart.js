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

            const notificationProduct = document.getElementById('cart-notification-product');
            if (notificationProduct) {
                notificationProduct.innerHTML = buildCartNotificationContent();
            }

            document.querySelector("#cart-notification").classList.add('active');

            // 3. Vérification
            const cartResponse = await fetch("/cart.js");
            const cartData = await cartResponse.json();
            console.log("Contenu actuel du panier:", cartData);

            document.querySelector("#cart-notification").classList.add('active');

        } catch (error) {
            console.error("Erreur:", error);
        }
    });
});

function buildCartNotificationContent() {
    // 1. Récupérer les éléments du DOM
    const productTitle = document.querySelector(".product__title > h1").textContent;
    const productImage = document.querySelector('.product__media-wrapper img')?.src || '';
    const optionNameChildOne = document.querySelector("variant-selects > fieldset:nth-child(1) > legend").textContent;
    const optionNameChildTwo = document.querySelector("variant-selects > fieldset:nth-child(2) > legend").textContent;
    const inputType = document.querySelector('.product-form__input input[name^="Type"]:checked');
    const labelType = document.querySelector(`label[for="${inputType.id}"]`);
    const type = labelType?.childNodes[0]?.nodeValue?.trim() || 'Taille non spécifiée';
    const inputSize = document.querySelector('.product-form__input input[name^="Taille"]:checked');
    const labelSize = document.querySelector(`label[for="${inputSize.id}"]`);
    const size = labelSize?.childNodes[0]?.nodeValue?.trim() || 'Taille non spécifiée';

    // 2. Générer le HTML
    return `
      <div class="cart-notification-product__image global-media-settings">
        <img src="${productImage.split('?')[0]}?width=140" 
             alt="${productTitle}" 
             width="70" height="70" loading="lazy">
      </div>
      <div>
        <h3 class="cart-notification-product__name h4">${productTitle}</h3>
        <dl>
        <div class="product-option">
            <dt>${optionNameChildOne}:</dt>
            <dd>${type}</dd>
        </div>
        <div class="product-option">
            <dt>${optionNameChildTwo}:</dt>
            <dd>${size}</dd>
        </div>
        </dl>
      </div>
    `;
}
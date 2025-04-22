import { mapData, updateMapStyles } from './custom-map-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const buttonAddToCart = document.querySelector('button[type="submit"][name="add"].product-form__submit');
    const productForm = document.querySelector('form[action="/cart/add"]');
    const quantityInput = document.querySelector('.quantity__input');

    buttonAddToCart.addEventListener('click', async (e) => {
        e.preventDefault();
        updateMapStyles(mapData);

        try {
            // 1. Récupérer les infos du produit
            const variantId = productForm.querySelector('input[name="id"]').value;
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            // 2. Ajouter au panier avec les propriétés
            const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [
                        {
                            id: variantId,
                            quantity: quantity,
                            properties: {
                                mapData: JSON.stringify(mapData),
                            },
                        },
                    ],
                }),
            });

            const data = await response.json();
            console.log('Réponse du panier:', data);

            // 3. Mettre à jour les sections du panier
            const sections = ['cart-notification-product', 'cart-notification-button', 'cart-icon-bubble'];
            const sectionsUrl = `${window.location.pathname}?sections=${sections.join(',')}`;

            const sectionsResponse = await fetch(sectionsUrl);
            const sectionsData = await sectionsResponse.json();

            // Mettre à jour l'icône du panier dans le header
            if (sectionsData['cart-icon-bubble']) {
                const cartIconBubble = document.querySelector('#cart-icon-bubble');
                const parser = new DOMParser();
                const newInnerHTML = parser
                    .parseFromString(sectionsData['cart-icon-bubble'], 'text/html')
                    .querySelector('#shopify-section-cart-icon-bubble').innerHTML;

                if (cartIconBubble && newInnerHTML) {
                    cartIconBubble.innerHTML = newInnerHTML;
                }
            }


            // Mettre à jour la notification du panier
            const notificationProduct = document.getElementById('cart-notification-product');
            if (notificationProduct) {
                notificationProduct.innerHTML = buildCartNotificationContent();
            }

            // Activer la notification
            const cartNotification = document.querySelector('#cart-notification');
            cartNotification.classList.add('active');

            // Publier l'événement de mise à jour du panier
            publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'custom-cart',
                cartData: data,
                variantId: variantId,
            });
        } catch (error) {
            console.error('Erreur:', error);
        }
    });
});

function buildCartNotificationContent() {
    // 1. Récupérer les éléments du DOM
    const productTitle = document.querySelector('.product__title > h1').textContent;
    const productImage = document.querySelector('.product__media-wrapper img')?.src || '';
    const optionNameChildOne = document.querySelector('variant-selects > fieldset:nth-child(1) > legend').textContent;
    const optionNameChildTwo = document.querySelector('variant-selects > fieldset:nth-child(2) > legend').textContent;
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

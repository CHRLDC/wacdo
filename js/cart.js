/**
 * cart.js
 * 
 * Fonctions pour le panier
 */

/**
 * Retourner l'objet Cart stocké dans sessionStorage ou un nouveau
 * @returns {Cart}
 */
function initializeCart() {
    let Cart = sessionStorage.getItem('Cart');
    if (Cart) {
        // Si Cart existe dans la session, le récupérer
        Cart = JSON.parse(Cart);
    } else {
        // Sinon, initialiser Cart
        Cart = {
            orderNumber: '',     // Numéro de commande unique
            placeNumber: '',    // Numéro de place 'Sur place'
            orderType: '',     // 'Sur place' ou 'A emporter'
            items: [],        // Liste des objet produits seuls sélectionnés
            menu: [],        // Liste des objet menus
            total: 0        // Montant total
        };
    }
    return Cart;
}

/**
 * Sauvegarder le panier dans sessionStorage
 */
function saveCartToSession() {
    sessionStorage.setItem('Cart', JSON.stringify(Cart));
}

/**
 * Mettre à jour l'affichage du panier après modification
 */
function updateCartDisplay() {
    // Récupérer le container
    let cartContainer = $('#cart');
    // Vider le contenu actuel du panier
    cartContainer.empty();
    // Toujours ajouter l'en-tête du panier
    cartContainer.append(generateCartHeader(Cart));
    // Vérifiez si le panier est vide
    if (Cart.menu.length === 0 && Cart.items.length === 0) {
        // Si le panier est vide, afficher le message de panier vide
        cartContainer.append(generateTextCartEmpty());
    } else {
        // Sinon, afficher les éléments du panier
        let ulContent = '<ul class="list-products">';
        ulContent += generateMenuItems(Cart);
        ulContent += generateCartItems(Cart);
        ulContent += '</ul>';
        // Insérer les éléments
        cartContainer.append(ulContent);
    }
    // Toujours ajouter le total du panier, même s'il est vide
    cartContainer.append(generateCartTotal(Cart));
    // Ajouter les événements pour la suppression d'items
    addRemoveEventHandlers(Cart, updateCartDisplay);
    // Sauvegarde l'état du panier dans sessionStorage
    saveCartToSession();
    // Mettre à jour le nombre de produits affiché sur le bouton panier (MS)
    displayNbProductsCart();
}


/**
 * Génère l'en-tête du panier avec les informations de la commande
 * @param {Object} Cart - Le panier
 * @returns {string} - Le HTML de l'en-tête du panier
 */
function generateCartHeader(Cart) {
    return `
    <div>
        <div class="logo-cart mAuto">
            <img src="./img/images/logo.png" alt="logo de wacdo">
        </div>
        <div class="flex justify-between align-center pT20 border-bottom mB20">
            <div>
                <p>Commande numéro</p>
                <div class="flex align-center">
                <p>${Cart.orderType}</p>
                ${Cart.orderType === 'Sur place' ? `<p>: <span class="fw-bold">${Cart.placeNumber}</span></p>` : ''}
                </div>
            </div>
            <div>
                <p class="order-number">${Cart.orderNumber}</p>
            </div>
        </div>
    </div>`;
}

/**
 * Génère l'affichage des menus dans le panier
 * @param {Object} Cart - Le panier
 * @returns {string} - Le HTML des menus dans le panier
 */
function generateMenuItems(Cart) {
    let menuItemsHtml = '';

    Cart.menu.forEach((menu, index) => {
        // Nettoyer le nom du menu (expression régulière pour supprimer le mot Menu+" ")
        let menuName = menu.name.replace(/^Menu\s*/i, '');
        let sizeText = menu.size === 'maxi' ? 'Maxi Best Of' : 'Best Of';

        // Accumuler le HTML généré dans la variable menuItemsHtml
        menuItemsHtml += `
        <li class="no-style-list mB20 flex justify-between">
            <div>
                    <p class="fw-bold title-cart-menu">1 Menu ${sizeText} ${menuName}</p>
                <ul class="mL30">
                    <li>${menu.accompaniment}</li>
                    <li>${menu.drink}</li>
                    <li>${menu.sauce}</li>
                </ul>
            </div>
            <div>
                <button class="remove-menu trash" data-index="${index}">
                    <img src="./img/images/trash.png" alt="Supprimer ${menuName} du panier" tabindex="0" role="button">
                </button>
            </div>
        </li>`;
    });

    return menuItemsHtml;
}


/**
 * Génère l'affichage des items dans le panier
 * @param {Object} Cart - le panier
 * @returns {string} - Le HTML des items dans le panier
 */
function generateCartItems(Cart) {
    let cartItemsHtml = '';

    Cart.items.forEach((item, index) => {
        cartItemsHtml += `
        <li class="no-style-list mB20 flex justify-between align-center">
            <div>
                <p class="fw-bold">${item.quantity} ${item.name} ${item.size ? `${item.size}` : ''}</p>
                <ul class="mL30">
                    ${item.sauce ? `<li>${item.sauce}</li>` : ''}
                </ul>
            </div>
            <div>
                <button class="remove-item trash" data-index="${index}">
                    <img src="./img/images/trash.png" alt="Supprimer ${item.name} du panier" tabindex="0" role="button">
                </button>
            </div>
        </li>`;
    });

    return cartItemsHtml;
}

/**
 * Génère l'affichage du panier vide
 * @returns {string} - Le HTML affichant que le panier est vide
 */
function generateTextCartEmpty() {
    return `
    <div class="list-products">
        <div class="flex justify-between align-center mB20">
            <div>
                <p>Votre panier est vide</p>
            </div>
        </div>
    </div>`;
}

/**
 * Calcule et génère l'affichage du total du panier
 * @param {Object} Cart - le panier
 * @returns {string} - Le HTML affichant le total du panier
 */
function generateCartTotal(Cart) {
    // Initialiser le total
    let total = 0;
    // Accumuler les prix des menus et prise en compte des majorations sur un menu maxi
    total += Cart.menu.reduce((total, menu) => {
        let menuTotal = menu.price;
        // Ajouter 0,50€ si la taille du menu est "maxi"
        if (menu.size === 'maxi') {
            menuTotal += 0.50;
        }
        return total + menuTotal;
    }, 0);

    // Acculuùer mes prix des menus et prise en compte des majorations sur une boisson en 50Cl
    total += Cart.items.reduce((total, item) => {
        let itemTotal = item.price * item.quantity;
        // Ajouter 0,50€ si la taille de l'item est "50cl"
        if (item.size === '50cl') {
            itemTotal += 0.50 * item.quantity;
        }
        return total + itemTotal;
    }, 0);

    // Mettre à jour le total dans l'objet Cart (remplacer le point par la virgule pour réspecter la maquette)
    Cart.total = total.toFixed(2).replace('.', ',');

    // Générer le HTML pour l'affichage du total
    return `
    <div>
        <div class="border-top pT20 flex justify-between mB20">
            <div class="total-text">
                <p>TOTAL</p>
                <p>(ttc)</p>
            </div>
            <p class="total-number">${Cart.total}€</p>
        </div>
        <div class="flex justify-between">
            <button id="give-up" class="btn-back">Abandon</button>
            <button id="pay" class="btn-cta">Payer</button>
        </div>
    </div>
    `;
}


/**
 * Ajoute les événements de suppression pour les élements dans le panier
 * @param {Object} Cart - Le panier
 * @param {Function} updateCartDisplay - La fonction pour mettre à jour l'affichage du panier
 * @returns {void}
 */
function addRemoveEventHandlers(Cart, updateCartDisplay) {
    $('.remove-menu').on('click', function () {
        let index = $(this).data('index');
        Cart.menu.splice(index, 1);
        updateCartDisplay();
        // Mettre à jour le nombre de produits affiché sur le bouton panier
        displayNbProductsCart();
    });
    $('.remove-item').on('click', function () {
        let index = $(this).data('index');
        Cart.items.splice(index, 1);
        updateCartDisplay();
        // Mettre à jour le nombre de produits affiché sur le bouton panier
        displayNbProductsCart();
    });
}

/**
 * Supprimer Cart dans le sessionStorage et rafraichir la page
 * @returns {void}
 */
function resetSession() {
    sessionStorage.removeItem('Cart');
    location.reload();
}

/**
 * Gérer l'affichage du panier en fonction de la taille de l'écran
 */
function mediaScreanCart() {
    // Vérifie que l'élément #order-choice n'est pas visible
    if ($('#order-choice').css('display') === 'none') {
        $('#MS-cart-btn').prop('disabled', false);
        if ($(window).width() < 1070) {
            $('#MS-cart-btn').removeClass('Dnone').addClass('Dblock');
            $('#cart').addClass('Dnone');
            $('body').removeClass('mCart');
        } else {
            $('#cart').removeClass('Dnone');
            $('#MS-cart-btn').addClass('Dnone').removeClass('Dblock');
            $('body').addClass('mCart');
        }
    }
}

// Ecouter le redimensionnement de la page pour adapter l'affichage du panier
$(window).on('resize', function () {
    mediaScreanCart();
});

// Fonction pour afficher le nombre de produits dans le bouton panier (MS)
function displayNbProductsCart() {
    // Récupérer l'objet Cart depuis sessionStorage ou l'initialiser
    let Cart = initializeCart();
    // Calculer le nombre de produits dans le panier
    let nbProductsCart = calculateNbProductsCart(Cart);
    // Vérifie si #cart est maintenant caché ou visible et change le texte en conséquence
    if ($('#cart').hasClass('Dnone')) {
        $('#MS-cart-btn').text('Voir mon panier (' + nbProductsCart + ')');
    } else {
        $('#MS-cart-btn').text('Reprendre ma commande');
    }
}

// Appeler la fonction au chargement de la page pour afficher le nombre de produits dans le panier
$(function () {
    displayNbProductsCart();
});

// Fonction pour calculer le nombre total de produits dans le panier
function calculateNbProductsCart(Cart) {
    let nbProductsCart = 0;
    // Additionner les quantités des items individuels
    Cart.items.forEach(function (item) {
        nbProductsCart += item.quantity;
    });
    // Additionner les quantités des menus
    Cart.menu.forEach(function (menu) {
        nbProductsCart += menu.quantity;
    });
    return nbProductsCart;
}

// Gestion du bouton panier dans écran MS
$('#MS-cart-btn').on('click', function () {
    // Afficher ou masquer le panier
    $(this).hide().show(0);
    $('#cart').toggleClass('Dnone');
    // Mettre à jour l'affichage du nombre de produits dans le panier
    displayNbProductsCart();
});


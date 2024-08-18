/**
 * app.js
 * 
 * Gestion des clics utilisateur (chemins de commandes)
 */

// Cache toutes les sections sauf #order-choice (1er écran)
$('section').not('#order-choice').hide();
// Initialiser le panier
let Cart = initializeCart();

/*
  ECOUTEURS D'EVENEMENTS SUR LES BOUTONS (CHOIX PROPOSES A L'UTILISATEUR)
*/

// Bouton "Sur place" et "A emporter"
$(document).on('click', '#sur-place, #a-emporter', function () {
    // Récupération le choix de l'utilisateur
    let choix = $(this).attr('id');
    // Commencer une nouvelle commande
    startOrder(choix);
    // Faire disparaitre le 1er écran et afficher la selection
    $('#order-choice').fadeOut(100);
    $('section').hide();
    //Gestion de l'affichage du panier (MS)
    mediaScreanCart();
    // Afficher les catégories
    toggleCategoriesCarousel(true);
});

// Quand l'utilisateur choisit une catégorie
$(document).on('click', '.category-button', function () {
    let categoryId = $(this).data('category-id');
    let categoryKey = categoryMap[categoryId];
    // Afficher les produits de la catégorie
    displayProducts(categoryKey, 'products-choice', './fragments/fragment-products.html');
    showSection('#products-choice');
    showTitle('#products-choice-title', categoryKey);
    // Gérer la sélection de la catégorie
    $('.category-button').removeClass('select-border');
    $(this).addClass('select-border');
});

// Bouton "Abandonner"
$(document).on('click', '#give-up', function () {
    // Demander confirmation à l'utilisateur
    if (confirm('Êtes-vous sûr de vouloir abandonner la commande ?')) {
        resetSession()
    }
});

// Bouton "Payer"
$(document).on('click', '#pay', function () {
    // Masquer les boutons de suppression des articles dans le panier
    $('.remove-item, .remove-menu').hide();
    // Alerter l'utilisateur si le panier est vide
    if (Cart.items.length === 0 && Cart.menu.length === 0) {
        alert('Veuillez ajouter un article au panier');
        return;
    }
    // Afficher la section de paiement et cacher les élements de commande
    showSection('#paiment');
    $('#pay').fadeOut(100);
    $('#MS-cart-btn').prop('disabled', true);
    toggleCategoriesCarousel(false);

});

// Quand l'utilisateur saisit son numero de paiement (pour exercice)
$(document).on('input', '#number-paiment', function () {
    // Vérifie si le champ contient au moins 2 chiffres
    if ($(this).val().length > 2) {
        // Active le bouton
        $('#send-paiment').prop('disabled', false);
    } else {
        // Désactive le bouton si le champ est vide
        $('#send-paiment').prop('disabled', true);
    }
});

// Bouton "send-paiment"
// Activer le bouton si un chiffre est saisi
$('#number-paiment').on('input', function () {
    if ($(this).val().length > 0) {
        $('#send-paiment').prop('disabled', false);
    } else {
        $('#send-paiment').prop('disabled', true);
    }
});

// Gérer la soumission du formulaire
$(document).on('submit', '#payment-form', function (event) {
    // Empêche le comportement par défaut du formulaire
    event.preventDefault();
    // Récupère la valeur du numéro de paiement
    const paymentNumber = $('#number-paiment').val();
    // Vérifie que la valeur contient que des chiffres (pas d'injection de code possible)
    if (!isInputSafe(paymentNumber)) {
        alert('Votre numéro de paiment doit contenir au moins 3 chiffres.');
        return;
    }
    // Effectue des vérifications sur le numéro de paiement
    if (isNaN(paymentNumber) || paymentNumber.length === 2) {
        alert('Votre numéro de paiment doit contenir au moins 3 chiffres.');
        return;
    }
    // Si le numéro de paiement est valide, continuer avec le processus
    if (Cart.orderType.startsWith('Sur place')) {
        showSection('#confirmation-sur-place');
    } else {
        showSection('#finish');
        sendApiOrder(); // Envoyer la commande à l'API
    }

    // Faire disparaître le panier
    $('#cart').fadeOut(100, function () {
        $('section').not('#MS-cart-btn').addClass('Dnone');
    });
});

// Bouton "finish-order"
$(document).on('click', '.finish-order', function () {
    // Si la commande est 'sur place'
    if (Cart.orderType.startsWith('Sur place')) {
        // Récupérer les 3 chiffres saisis dans les champs input
        let digit1 = $('input[name="digit1"]').val();
        let digit2 = $('input[name="digit2"]').val();
        let digit3 = $('input[name="digit3"]').val();

        // Vérifier que tous les chiffres sont bien remplis
        if (digit1 === '' || digit2 === '' || digit3 === '') {
            alert('Veuillez saisir les 3 chiffres du chevalet pour continuer.');
            return;
        }

        // Combiner les 3 chiffres en un seul nombre
        let chevaletNumber = digit1 + digit2 + digit3;

        // Vérifier la sécurité de l'entrée
        if (!isInputSafe(chevaletNumber)) {
            alert('Numéro de chevalet invalide. Veuillez entrer uniquement des chiffres.');
            return;
        }

        // Ajouter l'information au panier
        Cart.chevaletNumber = chevaletNumber;
    }

    // Envoyer la commande à l'API
    sendApiOrder();

    // Afficher la section de confirmation de fin de commande
    showSection('#finish');
});

// Bouton "new-order"
$('#new-order').on('click', function () {
    sessionStorage.removeItem('Cart');
    //actualiser l'application
    location.reload();
});

// Quand l'utilisateur choisit une boisson (hors menu)

// Initilisation des variables
let selectedDrinkSize = null;
let drinkQuantity = 1;

// Fonction pour vérifier si le bouton 'Ajouter à ma commande' du chemin boisson doit être activé
function toggleDrinkToCartButton() {
    if (selectedDrinkSize && drinkQuantity > 0) {
        $('.add-drink-cart').prop('disabled', false);
    } else {
        $('.add-drink-cart').prop('disabled', true);
    }
}

// Gérer la sélection de la taille de la boisson
$(document).on('click', '#drink-size-buttons div', function () {
    // Retirer la classe 'select-border' de tous les boutons de taille de boisson
    $('#drink-size-buttons div').removeClass('select-border');
    // Ajouter la classe 'select-border' au bouton cliqué
    $(this).addClass('select-border');
    // Mettre à jour la taille sélectionnée
    selectedDrinkSize = $(this).attr('id') === 'drink-size-30' ? '30cl' : '50cl';
    // Vérifier si le bouton "Ajouter à ma commande" doit être activé
    toggleDrinkToCartButton();
});

// Gérer la quantité de la boisson +
$(document).on('click', '.quantity-selector-increment', function () {
    drinkQuantity++;
    $('input[type="number"]').val(drinkQuantity);
    // Vérifier si le bouton "Ajouter à ma commande" doit être activé
    toggleDrinkToCartButton();
});
// Gérer la quantité de la boisson -
$(document).on('click', '.quantity-selector-decrement', function () {
    if (drinkQuantity > 1) {
        drinkQuantity--;
        $('input[type="number"]').val(drinkQuantity);
        // Vérifier si le bouton "Ajouter à ma commande" doit être activé
        toggleDrinkToCartButton();
    }
});

// Quand l'utilisateur clique sur "Ajouter à ma commande" (boisson)
$(document).on('click', '.add-drink-cart', function () {
    if (selectedDrinkSize) {
        // Mettre à jour les détails de la boisson sélectionnée
        detailsDrink.size = selectedDrinkSize;
        detailsDrink.quantity = drinkQuantity;
        // Ajouter la boisson au panier
        Cart.items.push({ ...detailsDrink });
        // Mettre à jour l'affichage du panier et revenir aux catégories
        updateCartDisplay();
        showSection('#products-choice');
        // Réinitialiser les sélections pour la prochaine boisson
        selectedDrinkSize = null;
        drinkQuantity = 1;
        $('input[type="number"]').val(drinkQuantity);
        $('#drink-size-buttons button').removeClass('select-border');
        // Désactiver à nouveau le bouton "Ajouter à ma commande"
        $('.add-drink-cart').prop('disabled', true);
    }
});

// Quand l'utilisateur choisit un produit "nuggets"

// Gestion de la sélection de la sauce pour les nuggets
let selectedSauceAlone = null;
// Quand l'utilisateur choisit une sauce pour les nuggets
$(document).on('click', '#sauce-choice-alone .btn-choice', function () {
    // Retirer la classe 'select-border' de tous les boutons de sauce
    $('#sauce-choice-alone ul div').removeClass('select-border');
    // Ajouter la classe 'select-border' au bouton cliqué
    $(this).addClass('select-border');
    // Mettre à jour la sauce sélectionnée
    let sauceProduct = $(this).data('product');
    selectedSauceAlone = sauceProduct.nom;
    // Activer le bouton "Ajouter au panier"
    $('.add-encas-cart').prop('disabled', false);
});

// Quand l'utilisateur clique sur "Ajouter au panier" (nuggets)
$('.add-encas-cart').off('click').on('click', function () {
    // Si une sauce est sélectionnée
    if (selectedSauceAlone) {
        // Mettre à jour les détails des nuggets avec la sauce choisie
        detailsOther.sauce = selectedSauceAlone;
        // Ajouter les nuggets au panier avec la sauce choisie
        Cart.items.push({ ...detailsOther });
        // Mettre à jour l'affichage du panier et revenir à la sélection des catégories
        updateCartDisplay();
        showSection('#products-choice');
    }
});

// Quand l'utilisateur choisit un menu

// Initilisation des variables des choix individuels
let selectedSize = null;
let selectedAccompaniment = null;
let selectedSauce = null;
let selectedDrink = null;

// Quand l'utilisateur choisit une taille de menu
$(document).on('click', '#size-menu-maxi, #size-menu-normal', function () {
    // Gestion du style de selection
    $('#size-menu-maxi, #size-menu-normal').removeClass('select-border');
    $(this).addClass('select-border');
    // Mettre à jour la taille sélectionnée
    selectedSize = $(this).attr('id') === 'size-menu-maxi' ? 'maxi' : 'normal';
    // Rendre le bouton "Étape suivante" active
    $('#to-accompaniment-choice').prop('disabled', false);
});

// Quand l'utilisateur clique sur "Étape suivante" pour aller aux accompagnements (menu)
$(document).on('click', '#to-accompaniment-choice', function () {
    // Si une taille est sélectionnée
    if (selectedSize) {
        // Mettre à jour les détails du menu
        detailsMenu.size = selectedSize;
        // Afficher les accompagnements (étape suivante)
        generateAccompanimentChoiceSize(selectedSize);
        showSection('#accompaniment-choice');
    }
});

// Quand l'utilisateur choisit un accompagnement (menu)
$(document).on('click', '#accompaniment-menu #accompaniment-frites, #accompaniment-menu #accompaniment-potatoes, #accompaniment-menu #accompaniment-salade', function () {
    // Gestion du style de sélection
    $('#accompaniment-frites, #accompaniment-potatoes, #accompaniment-salade').removeClass('select-border');
    $(this).addClass('select-border');
    // Récupérer le choix de l'utilisateur
    selectedAccompaniment = $(this).attr('id').replace('accompaniment-', '');
    // Rendre le bouton "Étape suivante" actif
    $('.to-sauce-choice').prop('disabled', false);
});

// Quand l'utilisateur clique sur "Étape suivante" pour aller aux sauces (menu)
$(document).on('click', '.to-sauce-choice', function () {
    // Si un accompagnement est sélectionné
    if (selectedAccompaniment) {
        // Mettre à jour les détails du menu
        detailsMenu.accompaniment = selectedAccompaniment;
        // Afficher les sauces (étape suivante)
        displayProducts("sauces", 'sauce-choice', './fragments/fragment-products-menu.html');
        showSection('#sauce-choice');
    }
});

// Quand l'utilisateur choisit une sauce (menu)
$(document).on('click', '#sauce-choice ul .btn-choice', function () {
    // Gestion du style de selection
    $('#sauce-choice ul button').removeClass('select-border');
    $(this).addClass('select-border');
    // Mettre à jour la sauce sélectionnée
    let product = $(this).data('product');
    selectedSauce = product.nom;
    // Rendre le bouton "Étape suivante" active
    $('.to-drink-choice').prop('disabled', false);
});

// Quand l'utilisateur clique sur "Étape suivante" pour la sauce
$(document).on('click', '.to-drink-choice', function () {
    // Si une sauce est sélectionnée
    if (selectedSauce) {
        // Mettre à jour les détails du menu
        detailsMenu.sauce = selectedSauce;
        // Afficher les boissons (étape suivante)
        displayProducts("boissons", 'drink-choice', './fragments/fragment-products-menu.html');
        showSection('#drink-choice');
    }
});

// Quand l'utilisateur choisit une boisson (menu)
$(document).on('click', '#drink-choice ul .btn-choice', function () {
    $('#drink-choice ul button').removeClass('select-border');
    $(this).addClass('select-border');
    let product = $(this).data('product');
    selectedDrink = product.nom;
    $('.add-menu-cart').prop('disabled', false);
});

// Quand l'utilisateur clique sur "Ajouter le menu à ma commande"
$(document).on('click', '.add-menu-cart', function () {
    // Si une boisson est sélectionnée
    if (selectedDrink) {
        // Mettre à jour les détails du menu
        detailsMenu.drink = selectedDrink;
        // Ajouter les détails du menu à Cart.menu
        Cart.menu.push({ ...detailsMenu });
        // Réinitialiser detailsMenu pour le prochain ajout
        resetDetailsMenu()
        // Réinitialiser les selected
        resetChoiceSelected()
        // Mettre à jour l'affichage du panier
        updateCartDisplay();
        //Afficher les catégories
        showSection('#products-choice');
    }
});


// Bouton "Retour" à l'étape précédente (logique parcours utilisateur pour la conception d'un menu)
$('.to-size-menu-choice').on('click', function () {
    showSection('#size-menu-choice');
});

$('.to-accompaniment-choice').on('click', function () {
    showSection('#accompaniment-choice');
});

$('.to-accompaniment-sauce').on('click', function () {
    showSection('#accompaniment-choice');
})

$('.to-sauce-choice').on('click', function () {
    showSection('#sauce-choice');
});

$('.to-products-drink').on('click', function () {
    showSection('#products-drink');
});

$('.to-products-choice').on('click', function () {
    showSection('#products-choice');
});

$('.categories-choice').on('click', function () {
    $('.bg-landing').fadeOut(100);
    showSection('#categories-choice');
    $('#pay').fadeIn(100);
    $('.trash').fadeIn(100);
    $('#MS-cart-btn').prop('disabled', false);

});

// Bouton 'annuler' pour revenir à l'écran d'accueil
$('.close-pop-up').on('click', function () {
    $('#products-choice').fadeIn(100);
    $('.container-pop-up').fadeOut(100);
    resetChoiceSelected();
    resetDetailsMenu();
    resetDrinkSelected();
});


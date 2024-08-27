/**
 * order.js
 * Fonctions pour gérer la commande
 */

// Commencer la commande
function startOrder(choix) {
    // Génèrer un numéro de commande s'il n'existe pas encore
    Cart.orderNumber = generateOrderNumber();
    if (choix === 'sur-place') {
        Cart.placeNumber = generatePlaceNumber();
        Cart.orderType = 'Sur place';
    }
    // Génèrer un numéro de place 'Sur place' s'il n'existe pas encore
    if (choix === 'a-emporter') {
        Cart.orderType = 'À emporter';
    }
    // Première mise à jour du panier
    updateCartDisplay();
}

//Normalement: prochains N° de commandes disponibles doit provenir de l'API, pour excercie: 2 fonctions Random
/**
 * Générer un numéro de commande unique 
 * @returns {number}
 */
function generateOrderNumber() {
    return Math.floor(10 + Math.random() * 90);
}

/**
 * Générer un numéro de place 'Sur Place' unique
 * @returns {number}
 */
function generatePlaceNumber() {
    return Math.floor(100 + Math.random() * 900);
}

/**
 * Envoyer les informations du panier à l'API
 * @returns {Promise<void>}
 */
async function sendApiOrder() {
    // Récupérer l'objet Cart depuis sessionStorage ou l'initialiser
    let Cart = initializeCart();

    // Utiliser une boucle for...of pour traiter chaque menu de manière asynchrone
    for (let menu of Cart.menu) {
        if (menu.sauce) {
            menu.sauceId = await findProductIdByName(menu.sauce);
        }
        if (menu.accompaniment) {
            menu.accompanimentId = await findProductIdByName(menu.accompaniment);
        }
        if (menu.drink) {
            menu.drinkId = await findProductIdByName(menu.drink);
        }
    }

    // Utiliser une boucle for...of pour traiter chaque item de manière asynchrone
    for (let item of Cart.items) {
        if (item.sauce) {
            item.sauceId = await findProductIdByName(item.sauce);
        }
    }

    // Simuler l'envoi du panier à l'API en affichant le JSON en console
    console.log(JSON.stringify(Cart));
    //return;

    // URL de l'API
    const apiUrl = 'http://exam-back.cdacosta.mywebecom.ovh/receved_order_api.php';

    // Envoyer le panier au format JSON à l'API
    $.ajax({
        url: apiUrl,
        type: 'POST',
        contentType: 'application/json',
        // Convertir l'objet Cart en JSON pour l'envoyer
        data: JSON.stringify(Cart),
        success: function (response) {
            // Si la requête réussit, afficher un message de succès
            console.log("Commande envoyée avec succès !", response);
        },
        error: function (textStatus, errorThrown) {
            // Si la requête échoue, afficher un message d'erreur
            console.error("Erreur lors de l'envoi de la commande:", textStatus, errorThrown);
        }
    });
}
/**
 * Rassemble les fonctions concernant les produits
 */

// Variable temporaire pour stocker les détails d'un menu en cours de sélection
window.detailsMenu = {
    idMenu: 0,
    name: '',
    size: '',
    accompaniment: '',
    drink: '',
    sauce: '',
    price: 0,
    quantity: 1
};

// Variable temporaire pour stocker les détails d'une boisson en cours de sélection
window.detailsDrink = {
    idDrink: 0,
    name: '',
    size: '',
    quantity: 1,
    price: 0,
};

// Variable temporaire pour stocker un élement hors menu ou boisson
window.detailsOther = {
    idOther: 0,
    name: '',
    quantity: 1,
    price: 0
};

/**
 * Charger tous les produits ou les produits d'une catégorie spécifique
 * @returns {Promise<object>} - Une promesse qui se résout avec toutes les données des produits JSON
 */
async function loadProducts() {
    try {
        // Tente de récupérer les données des produits à partir du fichier
        //const productsData = await $.getJSON('./data/products.json');
        const productsData = await $.getJSON('http://exam-back.cdacosta.mywebecom.ovh/products_api.php');
        // API demandée: 'http://exam-front.cdacosta.mywebecom.ovh/api_data/products.json' bloque sur github car le server n'est pas https
        // API provenant du back office: 'http://exam-back.cdacosta.mywebecom.ovh/products_api.php'

        // Assainir les données à l'entrée
        const sanitizedData = sanitizeData(productsData);
        // Retourner les données JSON assainies
        return sanitizedData;
    } catch (error) {
        console.error(error);
        // En cas d'erreur, retourne un objet vide pour éviter que l'app ne plante
        return {};
    }
}

/**
 * Charger et afficher les produits d'une catégorie spécifique ou tous les produits
 * @param {string} categoryKey - La clé de la catégorie à charger (par exemple "boissons", "sauces", etc.)
 * @param {string} containerId - L'ID du conteneur HTML où les éléments doivent être insérés
 * @param {string} fragmentPath - Chemin du fragment HTML à inclure
 */
function displayProducts(categoryKey, containerId, fragmentPath) {
    // Une fois qu'on a les données des produits
    loadProducts().then(data => {
        // Appliquer le filtrage (facultatif)
        const products = categoryKey ? data[categoryKey] : data;
        // Transmettre les paramètres pour rendre l'affichage
        renderProducts(products, containerId, fragmentPath, data);
    }).catch(error => {
        console.error(error);
        return {};
    });
}

/**
 * Rendre l'affichage des éléments génériques
 * @param {Array} products - Liste des produits à afficher
 * @param {string} containerId - L'ID du conteneur HTML où les éléments doivent être insérés
 * @param {string} fragmentPath - Chemin du fragment HTML à inclure
 * @param {object} allData - Toutes les données des produits pour trouver la catégorie
 */
async function renderProducts(products, containerId, fragmentPath, allData) {
    let navList = $(`#${containerId} ul`);
    navList.empty();
    // Tenter rendre le fragment avec ses données
    try {
        // Récupérer le fragment HTML
        let fragmentHtml = await $.get(fragmentPath);
        products.forEach(product => {
            let category = findCategoryByProductId(product.id, allData);
            // Convertir le produit en JSON pour l'envoyer
            let productData = JSON.stringify(product);
            // Injecter le produit et ses détails dans le fragment
            let listProduct = fragmentHtml
                .replace(/{{category}}/g, category)
                .replace(/{{product}}/g, productData)
                .replace(/{{id}}/g, product.id)
                .replace(/{{name}}/g, product.nom)
                .replace(/{{price}}/g, product.prix)
                .replace(/{{image}}/g, `./img/products${product.image}`);
            // Injecter le produit dans le conteneur
            navList.append(listProduct);
        });
        // Attacher les événements de clic sur les produits
        eventProductClick();
    } catch (error) {
        console.error(error);
    }
}

/**
 * Trouver la catégorie d'un produit par son ID
 * @param {number} productId - L'ID du produit
 * @param {object} data - Les données des produits
 * @returns {string} - Retourne le nom de la catégorie du produit ou vide
 */
function findCategoryByProductId(productId, data) {
    // Pour chaqun des produits de la catégorie
    for (const [category, products] of Object.entries(data)) {
        // Rechercher le produit par son id
        if (products.find(product => product.id === productId)) {
            return category; // Retourner la catégorie si l'ID correspond
        }
    }
    return "";
}

/**
 * Ecoute les clics sur les produits et lance les fonctions correspondantes
 */
function eventProductClick() {
    $('.card-product').on('click', function () {
        // Récupérer les attributs
        let category = $(this).data('category');
        let product = $(this).data('product');

        // Choix menu
        if (category === "menus") {
            // Mémoriser le choix
            setBaseMenu(product);
            //Afficher la suite des étapes (pour compléter le choix du menu)
            showSection('#size-menu-choice');
            //Choix boissons
        } else if (category === "boissons") {
            setBaseDrink(product);
            generateDrinkChoiceSize(product);
            showSection('#size-quantity-drink-alone-choice');
            // Choix nuggets
        } else if (category === "encas" && product.nom.toLowerCase().includes("nuggets")) {
            setBaseOther(product);
            // Afficher les options de sauce
            displayProducts("sauces", 'sauce-choice-alone', './fragments/fragment-products-menu.html');
            showSection('#sauce-choice-alone');
        } else {
            setBaseOther(product);
            // Ajouter le choix au panier
            Cart.items.push({ ...detailsOther });
            // Mettre à jour l'affichage du panier
            updateCartDisplay();
        }
    });
}

/**
 * Générer les boutons pour choisir la quantité de boisson (en faisant correspondre l'image)
 * @param {*} product 
 */
function generateDrinkChoiceSize(product) {
    // Nettoyer les anciens boutons
    $('#drink-size-buttons').empty();
    // Définir le chemin d'accès à l'image
    const imageSrc = `./img/products/${product.image}`;
    // Insérer les boutons
    $('#drink-size-buttons').append(`
            <div id="drink-size-30" class="slct btn-choice select-button-border-grey" tabindex="0" role="button">
                <div class="illustration100px">
                    <img src="${imageSrc}" alt="${product.nom} quantité 30cl" />
                </div>
                <p class="title-button mT16">30cl</p>
            </div>
            <div id="drink-size-50" class="slct btn-choice select-button-border-grey" tabindex="0" role="button">
                <div class="illustration">
                    <img src="${imageSrc}" alt="${product.nom} quantité 50cl" />
                </div>
                <p class="title-button">50cl</p>
            </div>
        `);
}

/**
 * Générer les boutons pour choisir l'accompagnement du menu
 * @param {*} selectedSize 
 */
function generateAccompanimentChoiceSize(selectedSize) {
    // Vérifier si l'élément existe
    const $accompanimentMenu = $('#accompaniment-menu');
    // Nettoyer les anciens boutons, en gardant les autres élements
    $accompanimentMenu.find('#accompaniment-frites, #accompaniment-potatoes').remove();
    // Définir les chemins d'accès aux images en fonction de la taille du produit
    const fritesImageSrc = selectedSize === "maxi" ? './img/products/frites/GRANDE_FRITE.png' : './img/products/frites/PETITE_FRITE.png';
    const potatoesImageSrc = selectedSize === "maxi" ? './img/products/frites/GRANDE_POTATOES.png' : './img/products/frites/POTATOES.png';
    // Insérer les boutons
    $(`
        <div id="accompaniment-frites" class="slct btn-choice select-button-border-grey" tabindex="0" role="button" aria-pressed="false" aria-label="Choisir des frites">
            <div class="illustration">
                <img src="${fritesImageSrc}" alt="Choisir des frites">
            </div>
            <p class="title-button">Frites</p>
        </div>
        <div id="accompaniment-potatoes" class="slct btn-choice select-button-border-grey" tabindex="0" role="button" aria-pressed="false" aria-label="Choisir des potatoes">
            <div class="illustration">
                <img src="${potatoesImageSrc}" alt="Choisir des potatoes">
            </div>
            <p class="title-button">Potatoes</p>
        </div>
    `).insertBefore('#accompaniment-salade');
}

/**
 * Initialiser les informations pour catégorie "menus"
 * @param {*} product 
 */
function setBaseMenu(product) {
    detailsMenu.idMenu = product.id;
    detailsMenu.name = product.nom;
    detailsMenu.price = product.prix;
}

/**
 * Initialiser les informations de base pour catégorie "boissons"
 * @param {*} product 
 */
function setBaseDrink(product) {
    detailsDrink.idDrink = product.id;
    detailsDrink.name = product.nom;
    detailsDrink.price = product.prix;
}

/**
 * Initialiser les informations de base pour les catégories autres que "menus" et "boissons"
 * @param {*} product 
 */
function setBaseOther(product) {
    detailsOther.idOther = product.id;
    detailsOther.name = product.nom;
    detailsOther.quantity = 1;
    detailsOther.price = product.prix;
    detailsOther.sauce = "";
}

/**
 * Reinitialise les détails d'un menu
 */
function resetDetailsMenu() {
    window.detailsMenu = {
        idMenu: 0,
        name: '',
        size: '',
        accompaniment: '',
        drink: '',
        sauce: '',
        price: 0,
        quantity: 1
    };
    $('#to-accompaniment-choice').prop('disabled', true);
    $('.to-sauce-choice').prop('disabled', true);
    $('.to-drink-choice').prop('disabled', true);
    $('.add-menu-cart').prop('disabled', true);
}

/**
 * Reinitialise les détails d'une boisson
 */
function resetChoiceSelected() {
    selectedSize = null;
    selectedAccompaniment = null;
    selectedSauce = null;
    selectedDrink = null;
    //Supprimer tous les border
    $('.select-border').removeClass('select-border');
}

/**
 * Reinitialise les détails d'une boisson
 */
function resetDrinkSelected() {
    selectedDrinkSize = null;
    drinkQuantity = 1;
    $('.add-drink-cart').prop('disabled', true);
}

/**
 * Retourner l'id du produit en donnant son name
 * @param {string} name - Le nom du produit
 * @returns {Promise<number|null>} id du produit ou null
 */
async function findProductIdByName(name) {
    try {
        const productsData = await loadProducts();
        let productID = null;

        // Combine tous les produits de différentes catégories en une seule liste
        let allProducts = Object.values(productsData).flat();

        // Trouver le produit par nom
        allProducts.forEach(product => {
            if (product.nom === name) {
                productID = product.id;
            }
        });

        return productID;
    } catch (error) {
        console.error("Erreur lors de la recherche de l'ID du produit:", error);
        return null;
    }
}
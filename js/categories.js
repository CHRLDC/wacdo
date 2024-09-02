/**
 * Rassemble le code relatif aux catégories
 */

// Initialiser le mappage des catégories
const categoryMap = {};

/**
 * Charger toutes les catégories
 * @returns {Promise<object>} - Une promesse qui se résout avec toutes les données des catégories JSON
 */
async function loadCategories() {
    try {
        // Tente de récupérer les données des catégories à partir du fichier
        data = await $.getJSON('./data/categories.json');
        // data = await $.getJSON('http://exam-front.cdacosta.mywebecom.ovh/api_data/categories.json');
        // API demandée: 'http://exam-front.cdacosta.mywebecom.ovh/api_data/categories.json' bloque sur github car le server n'est pas https 
        // API provenant du back office: 'http://exam-back.cdacosta.mywebecom.ovh/categories_api.php'API backoffice
        fillCategoryMap(data);
        // Assainir les données à l'entrée
        const sanitizedData = sanitizeData(data);
        // Retourner les données JSON assainies
        return sanitizedData;
    } catch (error) {
        console.error(error);
        return {};
    }
}

/**
 * Afficher les catégories (insérér un fragment dans le code HTML)
 */
function displayCategories() {
    // Une fois qu'on a les données des catégories
    loadCategories().then(data => {
        // Appliquer le filtrage (facultatif)
        const categories = data;
        // Transmettre les paramètres pour rendre l'affichage

        // Récupérer le conteneur HTML
        let navList = $('#categories-choice ul');
        categories.forEach(category => {
            // Mettre la première lettre du titre en majuscule
            let title = category.title.charAt(0).toUpperCase() + category.title.slice(1);
            // Créer l'élément
            let listItem = `
            <li class="no-style-list carousel-slide">
                <div data-category-id="${category.id}" class="slct category-button column align-center" tabindex="0" role="button">
                    <div class="img-category-button">
                        <img src="./img/${category.image}" alt="Choisir ${title}">
                    </div>
                    <p class="texte-center mT8">${title}</p>
                </div>
            </li>`;

            // Insérer l'element
            navList.append(listItem);
        });
    }).catch(error => {
        console.error(error);
        return {};
    });
}

/**
 *  Afficher le titre et le sous-titre correspondant à la catégorie
 * @param {*} divID 
 * @param {*} category 
 */
function showTitle(divID, category) {
    loadTitlesCategories().then(categories => {
        // Trouver la catégorie correspondante
        let selectedCategory = categories.find(cat => cat.category.toLowerCase() === category);

        // Si la catégorie est trouvée, afficher le titre et le sous-titre
        if (selectedCategory) {
            let div = $(`${divID}`);

            // Vider la div avant d'ajouter le contenu
            div.empty();

            // Ajouter le titre en tant que paragraphe
            if (selectedCategory.title) {
                let p = $('<p>').text(selectedCategory.title);
                div.append(p);
            }

            // Ajouter le sous-titre en tant que H1
            if (selectedCategory.subtitle) {
                let h1 = $('<h1>').text(selectedCategory.subtitle);
                div.append(h1);
            }
        }
    });
}

/**
 * Gérer l'affichage ou le masquage du carrousel des catégories
 * @param {boolean} show - true pour afficher, false pour masquer
 */
function toggleCategoriesCarousel(show) {
    displayCategories();
    if (show) {
        // Afficher le carrousel
        $('body').addClass('mCarousel');
        $('#categories-choice').fadeIn(100);
        $('.bg-landing').fadeOut(100);
    } else {
        // Masquer le carrousel
        $('#categories-choice').fadeOut(100);
        $('body').removeClass('mCarousel');
        $('.bg-landing').fadeIn(100);
    }
}

/**
 * Remplir le mappage des catégories (constante)
 * @param {*} categoriesData 
 */
function fillCategoryMap(categoriesData) {
    categoriesData.forEach(category => {
        categoryMap[category.id] = category.title.toLowerCase();
    });
}

/**
 * Charger tous les titres et sous-titres (JSON dans ./data)
 */
async function loadTitlesCategories() {
    try {
        let response = await fetch('./data/title-sections.json');
        let data = await response.json();
        return data;
    } catch (error) {
        return [];
    }
}
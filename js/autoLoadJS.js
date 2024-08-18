/**
 * autoLoadJS.js
 * 
 * Rôle: Chargement automatique des fichiers JS du dossier APP
 *
 */

// Liste des fichiers JS à charger dans l'ordre
let scriptsToLoad = [
    './js/index.js',
    './js/categories.js',
    './js/products.js',
    './js/order.js',
    './js/cart.js',
    './js/app.js'
];

/**
 * Rôle: Charge les scripts dans l'ordre
 * @param {*} scripts 
 * @returns 
 */
function loadScriptsSequence(scripts) {
    // Vérifie si les scripts sont déjà chargés
    if (scripts.length === 0) return;

    // Crée un nouvel élément <script>
    let script = document.createElement('script');
    // Définit l'attribut src du script avec le premier fichier
    script.src = scripts[0];
    // Ajouter l'attribut defer
    script.defer = true;

    // Dès qu'un script est chargé, lancer le chargement du suivant
    script.onload = function () {
        loadScriptsSequence(scripts.slice(1));
    };

    // Ajoute le script au document
    document.body.appendChild(script);
}

// Démarrer le chargement des scripts
loadScriptsSequence(scriptsToLoad);
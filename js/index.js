/**
 * Gestion diverses des affichages des index.html, hors chemin commande client
 */

$(function () {
    // Fonction réutilisable pour gérer le défilement du carousel
    function initializeCarousel($carouselContainer, $leftArrow, $rightArrow, scrollAmount) {
        // Gestion de la flèche gauche
        $leftArrow.click(function () {
            $carouselContainer.animate({
                scrollLeft: $carouselContainer.scrollLeft() - scrollAmount
            }, 300);
        });
        // Gestion de la flèche droite
        $rightArrow.click(function () {
            $carouselContainer.animate({
                scrollLeft: $carouselContainer.scrollLeft() + scrollAmount
            }, 300);
        });
    }
    // Initialisation du carousel catégories 
    initializeCarousel($('#categories-choice .carousel-container'), $('#categories-choice .left-arrow'), $('#categories-choice .right-arrow'), 300);
    // Initialisation du carousel sauces (menu)
    initializeCarousel($('#sauce-carousel .carousel-container'), $('#sauce-carousel .left-arrow'), $('#sauce-carousel .right-arrow'), 300);
    // Initialisation du carousel boissons (menu)
    initializeCarousel($('#drink-carousel .carousel-container'), $('#drink-carousel .left-arrow'), $('#drink-carousel .right-arrow'), 300);
    // Initialisation du carousel sauces seule
    initializeCarousel($('#sauce-carousel-alone .carousel-container'), $('#sauce-carousel .left-arrow'), $('#sauce-carousel-alone .right-arrow'), 300);
});


// Gestion de la saisie du numéro de chevalet (3chiffres)
$(document).on('input', '.digit-input', function () {
    // Stocke l'élément en cours de traitement
    const $this = $(this);
    // Sélectionne l'entrée suivante qui a également la classe '.digit-input'
    const $nextInput = $this.next('.digit-input');
    // Si la longueur de la valeur dans la case actuelle est égale à 1 et qu'il y a une entrée suivante
    if ($this.val().length === 1 && $nextInput.length) {
        // Déplace le focus sur l'entrée suivante pour permettre à l'utilisateur de continuer à taper
        $nextInput[0].focus();
    }
});

// Gestion du bouton d'accessibilité (Font OpenDys)
let isAccessible = false;
$(document).on('click', '#accessibility-toggle', function () {
    if (!isAccessible) {
        // Activer la police d'accessibilité pour tous les éléments
        document.documentElement.style.setProperty('--font-primary', 'var(--font-accessibility)');
        document.documentElement.style.setProperty('--font-title', 'var(--font-accessibility)');
        $(this).text('Désactiver Accessibilité');
        isAccessible = true;
    } else {
        // Revenir à la police par défaut pour tous les éléments
        document.documentElement.style.setProperty('--font-primary', 'Source Sans Pro Regular, sans-serif');
        document.documentElement.style.setProperty('--font-title', 'Source Sans Pro Bold, sans-serif');
        $(this).text('Activer Accessibilité');
        isAccessible = false;
    }
});

// Gestion des div avec un rôle de bouton, pour le deplacement dans l'app au clavier
$(document).on('keydown', function (event) {
    // Vérifie si la touche pressée du clavier est "Entrée" ou "Espace"
    if ((event.key === 'Enter' || event.key === ' ') && $(document.activeElement).is('[tabindex]')) {
        const $activeElement = $(document.activeElement);
        // Vérifie si l'élément actif a un rôle de bouton
        if ($activeElement.attr('role') === 'button') {
            // Empêche le comportement par défaut
            event.preventDefault();
            // Simule un clic sur l'élément
            $activeElement.trigger('click');
        }
    }
});

/**
 * Gestion de l'affichage de l'overlay
 */

// Fonction pour gérer l'affichage de l'overlay
function overlayDisplay() {
    // Vérifie si un élément avec la classe "container-pop-up" est en display block
    let isPopupVisible = false;
    $('.container-pop-up').each(function () {
        // Si il y en a un, la variable est mise à true et on sort de la boucle
        if ($(this).css('display') === 'block') {
            isPopupVisible = true;
            return false;
        }
    });
    // Affiche ou cache l'overlay en fonction de la visibilité des pop-ups
    if (isPopupVisible) {
        $('.overlay').css('display', 'block');
    } else {
        $('.overlay').css('display', 'none');
    }
}


/**
 * Initialisation de l'overlay si la fentre > 1070 pixels
 */
function initializeOverlay() {
    // Variable pour stocker si un observer est en cours
    let observer = null;
    if ($(window).width() > 1070) {
        // Vérifie si un observer existe déjà, si oui, ne rien faire
        if (!observer) {
            // Initialiser le MutationObserver pour détecter les changements dans le DOM
            observer = new MutationObserver(overlayDisplay);
            // Configuration de l'observateur
            observer.observe(document.body, {
                attributes: true,
                childList: true,
                subtree: true
            });
        }
        overlayDisplay();
    } else {
        // Déconnecter l'observer si l'écran est inférieur à 1070 pixels
        if (observer) {
            observer.disconnect();
            // Réinitialiser l'observer
            observer = null;
        }
        $('.overlay').css('display', 'none');
    }
}

// Initialiser la gestion de l'overlay au chargement
initializeOverlay();

// Réévaluer lorsque la fenêtre est redimensionnée
$(window).on('resize', initializeOverlay);

/**
 * Affiche une section spécicique en masquant les autres
 * @param {*} sectionId 
 */
function showSection(sectionId) {
    $('section').hide();
    $(sectionId).fadeIn(100);
}
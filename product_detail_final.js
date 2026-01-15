// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Variables globales
let currentProduct = null;
let currentImageIndex = 0;
let cart = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 PAGE DÉTAIL PRODUIT CHARGÉE');
    
    // Récupérer l'ID du produit depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    console.log('ID du produit depuis URL:', productId);
    
    // Test avec un ID fixe si aucun ID trouvé ou si ID trop grand
    let finalProductId = productId;
    
    if (!productId || parseInt(productId) > 100) {
        finalProductId = '1';
        console.log('ID invalide ou trop grand, utilisation de l\'ID 1 par défaut');
        showMessage('ID invalide, affichage de l\'article 1', 'info');
    }
    
    console.log('ID final utilisé:', finalProductId);
    
    loadProductDetail(finalProductId);
    
    updateCartCount();
});

// Charger les détails du produit
async function loadProductDetail(productId) {
    console.log('Chargement du produit:', productId);
    
    // D'abord essayer de trouver dans les produits locaux
    let products = [];
    
    try {
        // Essayer de récupérer les produits depuis le localStorage
        const storedProducts = localStorage.getItem('vinted_products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
            console.log('Produits récupérés depuis localStorage:', products.length);
        }
    } catch (error) {
        console.error('Erreur localStorage:', error);
    }
    
    // Si aucun produit dans localStorage, utiliser les données de test
    if (products.length === 0) {
        products = [
            {
                _id: '1',
                title: "Robe d'été florale",
                brand: "Zara",
                price: 25.99,
                originalPrice: 59.99,
                size: "M",
                condition: "Bon état",
                category: "women",
                image: "https://picsum.photos/seed/robe1/300/400",
                images: ["https://picsum.photos/seed/robe1/300/400", "https://picsum.photos/seed/robe2/300/400"],
                seller: {
                    name: "Marie",
                    rating: 4.8,
                    avatar: "https://picsum.photos/seed/marie/50/50"
                },
                likes: 24,
                liked: false,
                description: "Belle robe d'été imprimée floral, portée quelques fois seulement. Parfait pour les journées ensoleillées et les soirées d'été.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 156
            },
            {
                _id: '2',
                title: "Jean slim fit noir",
                brand: "H&M",
                price: 19.99,
                originalPrice: 39.99,
                size: "L",
                condition: "Comme neuf",
                category: "men",
                image: "https://picsum.photos/seed/jean1/300/400",
                images: ["https://picsum.photos/seed/jean1/300/400", "https://picsum.photos/seed/jean2/300/400"],
                seller: {
                    name: "Pierre",
                    rating: 4.9,
                    avatar: "https://picsum.photos/seed/pierre/50/50"
                },
                likes: 18,
                liked: false,
                description: "Jean slim fit noir, parfait pour toutes occasions. Coupe moderne et élégante, s'adapte à tous les styles.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 89
            },
            {
                _id: '3',
                title: "Sac à main en cuir",
                brand: "Mango",
                price: 45.00,
                originalPrice: 89.99,
                size: "Unique",
                condition: "Neuf",
                category: "accessories",
                image: "https://picsum.photos/seed/sac1/300/400",
                images: ["https://picsum.photos/seed/sac1/300/400", "https://picsum.photos/seed/sac2/300/400"],
                seller: {
                    name: "Sophie",
                    rating: 4.7,
                    avatar: "https://picsum.photos/seed/sophie/50/50"
                },
                likes: 32,
                liked: false,
                description: "Magnifique sac à main en cuir véritable, jamais utilisé. Idéal pour le quotidien ou les occasions spéciales.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date(),
                views: 234
            }
        ];
        console.log('Utilisation des données de test par défaut');
    }
    
    const product = products.find(p => p._id === productId);
    
    if (product) {
        console.log('✅ Produit trouvé:', product);
        currentProduct = product;
        currentImageIndex = 0;
        displayProductDetails(product);
    } else {
        console.log('❌ Produit non trouvé, ID:', productId);
        showMessage('Produit non trouvé', 'error');
    }
}

// Afficher les détails du produit
function displayProductDetails(product) {
    console.log('Affichage des détails du produit:', product);
    
    // Remplir les informations du produit
    const titleElement = document.getElementById('productTitle');
    const brandElement = document.getElementById('productBrand');
    const priceElement = document.getElementById('productPrice');
    const originalPriceElement = document.getElementById('productOriginalPrice');
    const sizeElement = document.getElementById('productSize');
    const conditionElement = document.getElementById('productCondition');
    const viewsElement = document.getElementById('productViews');
    const likesElement = document.getElementById('productLikes');
    const descriptionElement = document.getElementById('productDescription');
    
    // Vérifier et remplir chaque élément
    if (titleElement) titleElement.textContent = product.title;
    if (brandElement) brandElement.textContent = product.brand;
    if (priceElement) priceElement.textContent = `${product.price.toFixed(2)} FCFA`;
    if (originalPriceElement) originalPriceElement.textContent = product.originalPrice ? 
        `${product.originalPrice.toFixed(2)} FCFA` : '';
    if (sizeElement) sizeElement.textContent = product.size;
    if (conditionElement) conditionElement.textContent = product.condition;
    if (viewsElement) viewsElement.textContent = product.views || 0;
    if (likesElement) likesElement.textContent = product.likes || 0;
    if (descriptionElement) descriptionElement.textContent = product.description || 
        'Pas de description disponible pour ce produit.';
    
    // Frais de protection fixes à 200 FCFA
    const protectionFees = 200;
    const totalPrice = product.price + protectionFees;
    
    const protectionElement = document.getElementById('productProtectionFees');
    const totalElement = document.getElementById('productTotalPrice');
    
    if (protectionElement) {
        protectionElement.textContent = `Frais de protection: ${protectionFees.toFixed(2)} FCFA`;
    }
    
    if (totalElement) {
        totalElement.textContent = `Total: ${totalPrice.toFixed(2)} FCFA`;
    }
    
    // Informations du vendeur
    const sellerNameElement = document.getElementById('productSellerName');
    const sellerRatingElement = document.getElementById('productSellerRating');
    const sellerAvatarElement = document.getElementById('productSellerAvatar');
    
    if (sellerNameElement && product.seller) {
        sellerNameElement.textContent = product.seller.name;
    }
    
    if (sellerRatingElement && product.seller) {
        sellerRatingElement.textContent = product.seller.rating;
    }
    
    if (sellerAvatarElement && product.seller) {
        sellerAvatarElement.src = product.seller.avatar;
    }
    
    // Images
    updateProductImages();
    
    // État du favori
    updateFavoriteButton();
    
    // Mettre à jour le titre de la page
    document.title = `${product.title} - Vinted Clone`;
}

// Mettre à jour les images du produit
function updateProductImages() {
    if (!currentProduct) return;
    
    const mainImage = document.getElementById('productMainImage');
    const thumbnailsContainer = document.getElementById('productThumbnails');
    
    if (!mainImage || !thumbnailsContainer) {
        console.error('Éléments d\'image non trouvés');
        return;
    }
    
    // Image principale
    const images = currentProduct.images || [currentProduct.image];
    console.log('Images du produit:', images);
    
    if (images.length > 0 && images[currentImageIndex]) {
        mainImage.src = images[currentImageIndex];
        console.log('Image principale définie:', images[currentImageIndex]);
    }
    
    // Vider et recréer les miniatures
    thumbnailsContainer.innerHTML = '';
    
    images.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumbnail.onclick = () => selectImage(index);
        
        const img = document.createElement('img');
        img.src = image;
        img.alt = `Image ${index + 1}`;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        
        thumbnail.appendChild(img);
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    console.log('Miniatures créées:', images.length);
}

// Sélectionner une image
function selectImage(index) {
    currentImageIndex = index;
    updateProductImages();
    console.log('Image sélectionnée:', index);
}

// Ajouter au panier
function addToCart() {
    if (!currentProduct) return;
    
    cart.push(currentProduct);
    updateCartCount();
    showMessage('Article ajouté au panier', 'success');
}

// Gérer les favoris
function toggleFavorite() {
    if (!currentProduct) return;
    
    currentProduct.liked = !currentProduct.liked;
    updateFavoriteButton();
    
    if (currentProduct.liked) {
        currentProduct.likes = (currentProduct.likes || 0) + 1;
        showMessage('Ajouté aux favoris', 'success');
    } else {
        currentProduct.likes = Math.max(0, (currentProduct.likes || 0) - 1);
        showMessage('Retiré des favoris', 'info');
    }
    
    // Mettre à jour l'affichage
    const likesElement = document.getElementById('productLikes');
    if (likesElement) {
        likesElement.textContent = currentProduct.likes;
    }
}

function updateFavoriteButton() {
    const favoriteText = document.getElementById('favoriteText');
    if (favoriteText && currentProduct) {
        favoriteText.textContent = currentProduct.liked ? 'Retirer des favoris' : 'Ajouter aux favoris';
    }
}

function contactSeller() {
    if (!currentProduct) return;
    showMessage(`Message envoyé à ${currentProduct.seller.name}`, 'success');
}

function goBack() {
    console.log('Retour à la page précédente');
    window.history.back();
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = cart.length;
}

// Fonctions utilitaires
function showMessage(text, type = 'info') {
    console.log(`Message (${type}): ${text}`);
    
    // Créer un élément de message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    // Afficher le message
    setTimeout(() => {
        message.style.transform = 'translateX(0)';
    }, 100);
    
    // Cacher le message après 3 secondes
    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Navigation au clavier
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        goBack();
    }
    
    if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        selectImage(currentImageIndex - 1);
    }
    
    if (e.key === 'ArrowRight' && currentProduct) {
        const images = currentProduct.images || [currentProduct.image];
        if (currentImageIndex < images.length - 1) {
            selectImage(currentImageIndex + 1);
        }
    }
});

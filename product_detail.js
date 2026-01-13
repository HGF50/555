// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Variables globales
let currentProduct = null;
let currentImageIndex = 0;
let favorites = [];
let cart = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page détail produit chargée');
    
    // Récupérer l'ID du produit depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetail(productId);
    } else {
        showMessage('ID de produit non trouvé', 'error');
        setTimeout(() => goBack(), 2000);
    }
    
    updateCartCount();
});

// Charger les détails du produit
async function loadProductDetail(productId) {
    try {
        console.log('Chargement du produit:', productId);
        
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();
        
        if (response.ok) {
            currentProduct = product;
            currentImageIndex = 0;
            
            // Remplir les informations du produit
            document.getElementById('productTitle').textContent = product.title;
            document.getElementById('productBrand').textContent = product.brand;
            document.getElementById('productPrice').textContent = `${product.price.toFixed(2)} FCFA`;
            document.getElementById('productOriginalPrice').textContent = product.originalPrice ? 
                `${product.originalPrice.toFixed(2)} FCFA` : '';
            document.getElementById('productSize').textContent = product.size;
            document.getElementById('productCondition').textContent = product.condition;
            document.getElementById('productViews').textContent = product.views || 0;
            document.getElementById('productLikes').textContent = product.likes || 0;
            document.getElementById('productDescription').textContent = product.description || 
                'Pas de description disponible pour ce produit.';
            
            // Frais de protection et prix total
            const protectionFees = Math.round(product.price * 0.05);
            const totalPrice = product.price + protectionFees;
            document.getElementById('productProtectionFees').textContent = 
                `Frais de protection: ${protectionFees.toFixed(2)} FCFA`;
            document.getElementById('productTotalPrice').textContent = 
                `Total: ${totalPrice.toFixed(2)} FCFA`;
            
            // Informations du vendeur
            document.getElementById('productSellerName').textContent = product.seller.name;
            document.getElementById('productSellerRating').textContent = product.seller.rating;
            document.getElementById('productSellerAvatar').src = product.seller.avatar;
            
            // Images
            updateProductImages();
            
            // État du favori
            updateFavoriteButton();
            
            // Mettre à jour le titre de la page
            document.title = `${product.title} - Vinted Clone`;
            
        } else {
            throw new Error(product.error || 'Produit non trouvé');
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        showMessage('Erreur lors du chargement du produit', 'error');
        setTimeout(() => goBack(), 2000);
    }
}

// Mettre à jour les images du produit
function updateProductImages() {
    if (!currentProduct) return;
    
    const mainImage = document.getElementById('productMainImage');
    const thumbnailsContainer = document.getElementById('productThumbnails');
    
    // Image principale
    const images = currentProduct.images || [currentProduct.image];
    mainImage.src = images[currentImageIndex];
    
    // Miniatures
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumbnail.onclick = () => selectImage(index);
        
        const img = document.createElement('img');
        img.src = image;
        img.alt = `${currentProduct.title} - Image ${index + 1}`;
        
        thumbnail.appendChild(img);
        thumbnailsContainer.appendChild(thumbnail);
    });
}

// Sélectionner une image
function selectImage(index) {
    currentImageIndex = index;
    updateProductImages();
}

// Ajouter au panier
function addToCart() {
    if (!currentProduct) return;
    
    cart.push(currentProduct._id);
    updateCartCount();
    showMessage('Article ajouté au panier', 'success');
}

// Gérer les favoris
async function toggleFavorite() {
    if (!currentProduct) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${currentProduct._id}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: 'demo-user' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentProduct.liked = data.liked;
            currentProduct.likes = data.likes;
            
            // Mettre à jour l'affichage
            document.getElementById('productLikes').textContent = data.likes;
            updateFavoriteButton();
            
            showMessage(data.liked ? 'Ajouté aux favoris' : 'Retiré des favoris', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors de la mise à jour des favoris', 'error');
    }
}

// Mettre à jour le bouton favori
function updateFavoriteButton() {
    if (!currentProduct) return;
    
    const favoriteBtn = document.getElementById('favoriteText');
    const isLiked = currentProduct.liked;
    
    if (isLiked) {
        favoriteBtn.textContent = 'Retirer des favoris';
    } else {
        favoriteBtn.textContent = 'Ajouter aux favoris';
    }
}

// Contacter le vendeur
function contactSeller() {
    if (!currentProduct) return;
    
    showMessage(`Message envoyé à ${currentProduct.seller.name} !`, 'success');
}

// Retour à la page d'accueil
function goBack() {
    window.location.href = '/';
}

// Fonctions utilitaires
function showFavorites() {
    window.location.href = '/?category=favorites';
}

function showProfile() {
    showMessage('Page de profil', 'info');
}

function showCart() {
    showMessage('Panier', 'info');
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = cart.length;
}

// Afficher les messages
function showMessage(text, type = 'info') {
    // Supprimer les messages existants
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    // Afficher le message
    setTimeout(() => message.classList.add('show'), 100);
    
    // Cacher le message après 3 secondes
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// Navigation au clavier
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        goBack();
    }
    
    // Navigation entre images avec les flèches
    if (currentProduct && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const images = currentProduct.images || [currentProduct.image];
        
        if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
            selectImage(currentImageIndex - 1);
        } else if (e.key === 'ArrowRight' && currentImageIndex < images.length - 1) {
            selectImage(currentImageIndex + 1);
        }
    }
});

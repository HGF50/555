// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Variables globales
let currentCategory = 'all';
let currentSort = 'relevant';
let filteredProducts = [];
let cart = [];
let favorites = [];
let currentPage = 1;
let isLoading = false;
let uploadedPhotos = [];

// Test au tout début du script
console.log('🟢 SCRIPT SIMPLE CHARGÉ !');

// Fonction pour ouvrir le modal de vente
function showSellForm() {
    console.log('Bouton Vendre cliqué!');
    const modal = document.getElementById('sellModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('Modal affiché');
    } else {
        console.error('Modal non trouvé!');
    }
}

// Fonction pour fermer le modal de vente
function closeSellModal() {
    const modal = document.getElementById('sellModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('Modal fermé');
    }
}

// Fonction de soumission DIRECTE ET GARANTIE
function submitForm() {
    console.log('=== SUBMITFORM APPELÉ ===');
    
    // Vérifier les photos
    if (uploadedPhotos.length < 3) {
        alert('Vous devez ajouter au moins 3 photos.');
        return;
    }
    
    // Vérifier les champs
    const title = document.getElementById('title').value;
    const brand = document.getElementById('brand').value;
    const category = document.getElementById('category').value;
    const price = parseFloat(document.getElementById('price').value);
    const condition = document.getElementById('condition').value;
    
    if (!title || !brand || !category || !price || !condition) {
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    
    // Créer le produit avec GARANTIE de conservation
    const newProduct = {
        _id: String(Date.now()), // ID unique basé sur timestamp
        title: title,
        brand: brand,
        price: price,
        originalPrice: null,
        size: "M",
        condition: condition,
        category: category,
        description: "Article publié depuis Vinted Clone",
        seller: {
            name: "Utilisateur Demo",
            rating: 4.5,
            avatar: "https://picsum.photos/seed/seller/50/50"
        },
        // GARANTIR la conservation des images
        images: uploadedPhotos.map(photo => photo.url || photo),
        image: uploadedPhotos.length > 0 ? (uploadedPhotos[0].url || uploadedPhotos[0]) : 'https://picsum.photos/seed/new/300/400',
        protectionFees: 200,
        totalPrice: price + 200,
        views: 0,
        likes: 0,
        liked: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    console.log('Nouvel article créé:', newProduct);
    console.log('Images conservées:', newProduct.images.length);
    
    // DOUBLE SAUVEGARDE POUR GARANTIE
    filteredProducts.unshift(newProduct);
    
    // 1. SessionStorage (immédiat)
    try {
        sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
        console.log('✅ SessionStorage mis à jour');
    } catch (error) {
        console.error('❌ Erreur SessionStorage:', error);
    }
    
    // 2. LocalStorage (persistant)
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        console.log('✅ LocalStorage mis à jour');
    } catch (error) {
        console.error('❌ Erreur LocalStorage:', error);
    }
    
    alert('Article publié avec succès !');
    closeSellModal();
    
    // Recharger l'affichage IMMÉDIATEMENT
    renderProducts();
    
    // Vider les photos uploadées SEULEMENT de l'interface
    clearPhotoPreviews();
    uploadedPhotos = [];
    
    console.log('=== ARTICLE PUBLIÉ ET GARANTI ===');
}

// Gestion des photos AMÉLIORÉE
function handlePhotoUpload(event) {
    console.log('📸 Photo uploadée');
    const files = Array.from(event.target.files);
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    files.forEach((file, index) => {
        if (uploadedPhotos.length >= 4) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const slotIndex = uploadedPhotos.length;
            const slot = slots[slotIndex];
            
            console.log('Slot index:', slotIndex, 'Slot:', slot);
            
            if (slot) {
                const img = slot.querySelector('.preview-image');
                const placeholder = slot.querySelector('.photo-placeholder');
                const removeBtn = slot.querySelector('.remove-photo');
                
                console.log('Éléments trouvés:', {img: !!img, placeholder: !!placeholder, removeBtn: !!removeBtn});
                
                if (img && placeholder && removeBtn) {
                    img.src = e.target.result;
                    img.style.display = 'block';
                    placeholder.style.display = 'none';
                    removeBtn.style.display = 'flex';
                    
                    // Stocker avec GARANTIE de structure
                    uploadedPhotos.push({
                        url: e.target.result,
                        file: file,
                        index: slotIndex
                    });
                    console.log('Photo ajoutée. Total:', uploadedPhotos.length);
                    console.log('URL complète:', e.target.result.substring(0, 100) + '...');
                }
            }
        };
        
        reader.readAsDataURL(file);
    });
    
    event.target.value = '';
}

// Supprimer une photo
function removePhoto(event, index) {
    event.stopPropagation();
    console.log('removePhoto appelée pour index:', index);
    
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    const slot = slots[index];
    
    if (slot) {
        const img = slot.querySelector('.preview-image');
        const placeholder = slot.querySelector('.photo-placeholder');
        const removeBtn = slot.querySelector('.remove-photo');
        
        if (img && placeholder && removeBtn) {
            img.src = '';
            img.style.display = 'none';
            placeholder.style.display = 'flex';
            removeBtn.style.display = 'none';
            
            // Supprimer de la liste
            uploadedPhotos.splice(index, 1);
            console.log('Photo supprimée. Restantes:', uploadedPhotos.length);
            
            // Réorganiser les photos restantes
            reorganizePhotos();
        }
    }
}

// Réorganiser les photos après suppression
function reorganizePhotos() {
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    // Vider tous les slots
    slots.forEach((slot, index) => {
        const img = slot.querySelector('.preview-image');
        const placeholder = slot.querySelector('.photo-placeholder');
        const removeBtn = slot.querySelector('.remove-photo');
        
        img.src = '';
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
    });
    
    // Remplir avec les photos restantes
    uploadedPhotos.forEach((photo, index) => {
        const slot = slots[index];
        if (slot && index < 4) {
            const img = slot.querySelector('.preview-image');
            const placeholder = slot.querySelector('.photo-placeholder');
            const removeBtn = slot.querySelector('.remove-photo');
            
            // Utiliser la bonne structure
            const imageUrl = photo.url || photo;
            img.src = imageUrl;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'flex';
            
            console.log(`Photo ${index} restaurée:`, imageUrl.substring(0, 50) + '...');
        }
    });
    
    console.log('Photos réorganisées:', uploadedPhotos.length);
}

function updateTotalPrice() {
    const priceInput = document.getElementById('price');
    const price = parseFloat(priceInput.value) || 0;
    
    // Frais de protection fixes à 200 FCFA
    const protectionFees = 200;
    const totalPrice = price + protectionFees;
    
    // Mettre à jour l'affichage
    const protectionElement = document.getElementById('protectionFees');
    const totalElement = document.getElementById('totalPrice');
    
    if (protectionElement) {
        protectionElement.textContent = `${protectionFees} FCFA`;
    }
    
    if (totalElement) {
        totalElement.value = totalPrice.toFixed(2);
    }
    
    console.log(`Prix: ${price} FCFA + Frais: ${protectionFees} FCFA = Total: ${totalPrice} FCFA`);
}

// Charger les produits avec GARANTIE DE PERSISTANCE
async function loadProducts() {
    console.log('🔄 Chargement des produits GARANTI...');
    
    let products = [];
    
    // 1. Essayer SessionStorage (immédiat)
    try {
        const sessionProducts = sessionStorage.getItem('vinted_products_temp');
        if (sessionProducts) {
            products = JSON.parse(sessionProducts);
            console.log('✅ Produits chargés depuis SessionStorage:', products.length);
        }
    } catch (error) {
        console.error('❌ Erreur SessionStorage:', error);
    }
    
    // 2. Essayer LocalStorage (persistant)
    if (products.length === 0) {
        try {
            const storedProducts = localStorage.getItem('vinted_products');
            if (storedProducts) {
                products = JSON.parse(storedProducts);
                console.log('✅ Produits chargés depuis LocalStorage:', products.length);
            }
        } catch (error) {
            console.error('❌ Erreur LocalStorage:', error);
        }
    }
    
    // 3. Utiliser les données de test si vide
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
                seller: {
                    name: "Marie",
                    rating: 4.8,
                    avatar: "https://picsum.photos/seed/marie/50/50"
                },
                likes: 24,
                liked: false,
                description: "Belle robe d'été imprimée floral, portée quelques fois seulement.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date()
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
                seller: {
                    name: "Pierre",
                    rating: 4.9,
                    avatar: "https://picsum.photos/seed/pierre/50/50"
                },
                likes: 18,
                liked: false,
                description: "Jean slim fit noir, parfait pour toutes occasions.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date()
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
                seller: {
                    name: "Sophie",
                    rating: 4.7,
                    avatar: "https://picsum.photos/seed/sophie/50/50"
                },
                likes: 32,
                liked: false,
                description: "Magnifique sac à main en cuir véritable, jamais utilisé.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
        console.log('✅ Utilisation des données de test par défaut');
    }
    
    // ASSIGNER ET SAUVEGARDER
    filteredProducts = products;
    
    // Triple sauvegarde pour GARANTIE
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
        console.log('✅ Triple sauvegarde effectuée');
    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
    }
    
    console.log('Produits chargés:', filteredProducts.length);
    
    renderProducts();
}

// Afficher les produits avec GARANTIE D'AFFICHAGE
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
        console.error('❌ Grid non trouvée!');
        return;
    }
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="loading">Aucun produit trouvé</div>';
        return;
    }
    
    console.log('🎨 Affichage des produits:', filteredProducts.length);
    
    const productsHTML = filteredProducts.map(product => {
        // Gestion GARANTIE des images
        let imageSrc = product.image;
        
        if (imageSrc && imageSrc.startsWith('data:')) {
            console.log('✅ Image base64 utilisée pour:', product.title);
        } else if (!imageSrc) {
            imageSrc = 'https://picsum.photos/seed/default/300/400';
            console.log('❌ Image manquante pour:', product.title);
        } else {
            console.log('📸 Image URL normale utilisée pour:', product.title);
        }
        
        return `
    <div class="product-card" onclick="goToProductDetail('${product._id}')">
        <div class="product-image">
            <img src="${imageSrc}" alt="${product.title}" loading="lazy" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px;" onerror="console.error('Erreur chargement image pour:', '${product.title}'); this.src='https://picsum.photos/seed/error/300/400';">
            <button class="favorite-btn-product ${product.liked ? 'active' : ''}" onclick="toggleFavorite(event, '${product._id}')">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="product-info">
            <div class="product-title">${product.title}</div>
            <div class="product-brand">${product.brand}</div>
            <div class="product-price">${product.price.toFixed(2)} FCFA</div>
            <div class="product-size">Taille: ${product.size}</div>
            <div class="product-seller">
                <div class="seller-avatar"></div>
                <span>${product.seller.name} ⭐ ${product.seller.rating}</span>
            </div>
            <div class="product-likes">
                <i class="fas fa-heart"></i> ${product.likes || 0}
            </div>
        </div>
    </div>
    `;
    }).join('');
    
    grid.innerHTML = productsHTML;
    console.log('✅ Produits affichés:', filteredProducts.length);
    
    // Sauvegarde automatique après affichage
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
    } catch (error) {
        console.error('❌ Erreur sauvegarde automatique:', error);
    }
}

// Navigation vers détail produit
function goToProductDetail(productId) {
    console.log('Navigation vers détail produit, ID:', productId);
    console.log('URL générée:', `product.html?id=${productId}`);
    
    // Sauvegarder avant navigation
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
        console.log('✅ Sauvegarde avant navigation');
    } catch (error) {
        console.error('❌ Erreur sauvegarde navigation:', error);
    }
    
    window.location.href = `product.html?id=${productId}`;
}

// Toggle favori
async function toggleFavorite(event, productId) {
    event.stopPropagation();
    console.log('Toggle favori:', productId);
    
    // Trouver le produit et mettre à jour localement
    const product = filteredProducts.find(p => p._id === productId);
    if (product) {
        product.liked = !product.liked;
        if (product.liked) {
            product.likes = (product.likes || 0) + 1;
            showMessage('Ajouté aux favoris', 'success');
        } else {
            product.likes = Math.max(0, (product.likes || 0) - 1);
            showMessage('Retiré des favoris', 'info');
        }
        
        // Sauvegarde immédiate
        try {
            localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
            sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
        } catch (error) {
            console.error('❌ Erreur sauvegarde favori:', error);
        }
        
        // Mettre à jour l'affichage
        renderProducts();
    }
}

// Fonctions de navigation
function showHome() {
    console.log('Accueil');
}

function showCategories() {
    console.log('Catégories');
}

function showFavorites() {
    console.log('Redirection vers la page des favoris');
    window.location.href = 'favorites.html';
}

function showProfile() {
    console.log('Redirection vers le profil');
    window.location.href = 'profile.html';
}

function showAbout() {
    console.log('Redirection vers la page À propos');
    window.location.href = 'about.html';
}

function toggleSearch() {
    console.log('Recherche');
}

function toggleFilters() {
    console.log('Filtres');
}

function performSearch() {
    console.log('Recherche effectuée');
}

function filterAndSortProducts() {
    console.log('Filtrage et tri');
}

function sortProducts() {
    console.log('Tri des produits');
}

function applyFilters() {
    console.log('Application des filtres');
}

function resetFilters() {
    console.log('Réinitialisation des filtres');
}

function loadMoreProducts() {
    console.log('Charger plus de produits');
}

// Fonctions utilitaires
function showMessage(text, type = 'info') {
    console.log(`Message (${type}): ${text}`);
    
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
    
    setTimeout(() => {
        message.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = cart.length;
}

function clearPhotoPreviews() {
    console.log('🧹 Nettoyage des aperçus photos');
    
    const photoGrid = document.getElementById('photoGrid');
    if (photoGrid) {
        const slots = photoGrid.querySelectorAll('.photo-slot');
        slots.forEach(slot => {
            const img = slot.querySelector('.preview-image');
            const placeholder = slot.querySelector('.photo-placeholder');
            const removeBtn = slot.querySelector('.remove-photo');
            
            if (img) img.src = '';
            if (img) img.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
            if (removeBtn) removeBtn.style.display = 'none';
        });
    }
}

// Initialisation GARANTIE au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 DOM CHARGÉ - INITIALISATION GARANTIE ===');
    
    // Chargement IMMÉDIAT et GARANTI
    console.log('🔄 CHARGEMENT GARANTI DES PRODUITS...');
    loadProducts();
    
    console.log('=== INITIALISATION GARANTIE TERMINÉE ===');
});

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

// Fonction de soumission directe
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
    
    // Créer le produit directement sans API
    const newProduct = {
        _id: String(filteredProducts.length + 1),
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
        // Utiliser les photos uploadées
        images: uploadedPhotos.map(photo => photo.url),
        image: uploadedPhotos.length > 0 ? uploadedPhotos[0].url : 'https://picsum.photos/seed/new/300/400',
        protectionFees: 200,
        totalPrice: price + 200,
        views: 0,
        likes: 0,
        liked: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    console.log('Nouvel article créé:', newProduct);
    console.log('Photos utilisées:', uploadedPhotos.length);
    
    // Ajouter au début de la liste
    filteredProducts.unshift(newProduct);
    
    // Sauvegarder dans localStorage pour synchronisation
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        console.log('✅ Produits sauvegardés dans localStorage');
    } catch (error) {
        console.error('Erreur localStorage:', error);
    }
    
    // Conserver les photos pour qu'elles s'affichent
    console.log('Photos conservées dans uploadedPhotos:', uploadedPhotos);
    
    alert('Article publié avec succès !');
    closeSellModal();
    
    // Recharger l'affichage
    renderProducts();
}

// Gestion des photos
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
            if (slot) {
                const img = slot.querySelector('.preview-image');
                const placeholder = slot.querySelector('.photo-placeholder');
                const removeBtn = slot.querySelector('.remove-photo');
                
                img.src = e.target.result;
                img.style.display = 'block';
                placeholder.style.display = 'none';
                removeBtn.style.display = 'flex';
                
                uploadedPhotos.push({
                    file: file,
                    url: e.target.result,
                    index: slotIndex
                });
                
                console.log(`Photo ${slotIndex + 1} ajoutée:`, file.name);
                updatePhotoRequirements();
            }
        };
        reader.readAsDataURL(file);
    });
    
    event.target.value = '';
}

function removePhoto(event, index) {
    event.stopPropagation();
    console.log(`🗑️ Suppression photo ${index + 1}`);
    
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    if (slots[index]) {
        const slot = slots[index];
        const img = slot.querySelector('.preview-image');
        const placeholder = slot.querySelector('.photo-placeholder');
        const removeBtn = slot.querySelector('.remove-photo');
        
        img.src = '';
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
        
        uploadedPhotos = uploadedPhotos.filter((_, i) => i !== index);
        
        // Réorganiser les photos restantes
        reorganizePhotos();
    }
}

function reorganizePhotos() {
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    uploadedPhotos.forEach((photo, newIndex) => {
        const slot = slots[newIndex];
        if (slot) {
            const img = slot.querySelector('.preview-image');
            const placeholder = slot.querySelector('.photo-placeholder');
            const removeBtn = slot.querySelector('.remove-photo');
            
            img.src = photo.url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'flex';
            
            photo.index = newIndex;
        }
    });
}

function updatePhotoRequirements() {
    const photoCount = document.getElementById('photoCount');
    const uploadText = document.getElementById('uploadText');
    
    if (photoCount) {
        photoCount.textContent = uploadedPhotos.length;
    }
    
    if (uploadText) {
        if (uploadedPhotos.length >= 3) {
            uploadText.textContent = 'Vous pouvez ajouter une photo supplémentaire';
            uploadText.style.color = '#28a745';
        } else {
            uploadText.textContent = `Ajoutez ${3 - uploadedPhotos.length} photo(s) supplémentaire(s)`;
            uploadText.style.color = '#dc3545';
        }
    }
}

function clearPhotoPreviews() {
    const photoGrid = document.getElementById('photoGrid');
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

// Charger les produits
async function loadProducts() {
    console.log('🔄 Chargement des produits...');
    
    // D'abord essayer de charger depuis le localStorage
    try {
        const storedProducts = localStorage.getItem('vinted_products');
        if (storedProducts) {
            filteredProducts = JSON.parse(storedProducts);
            console.log('✅ Produits chargés depuis localStorage:', filteredProducts.length);
            renderProducts();
            return;
        }
    } catch (error) {
        console.error('Erreur localStorage:', error);
    }
    
    // Si aucun produit dans localStorage, utiliser les données de test
    const testProducts = [
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
    filteredProducts = testProducts;
    console.log('Produits chargés:', filteredProducts.length);
    
    renderProducts();
    
    // Sauvegarder dans localStorage
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        console.log('✅ Produits de test sauvegardés dans localStorage');
    } catch (error) {
        console.error('Erreur sauvegarde localStorage:', error);
    }
}

// Afficher les produits
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div class="loading">Aucun produit trouvé</div>';
        return;
    }
    
    const productsHTML = filteredProducts.map(product => {
        // Gérer les images base64 et normales
        let imageSrc = product.image;
        if (imageSrc && imageSrc.startsWith('data:')) {
            // C'est une image base64, l'utiliser directement
            console.log('✅ Image base64 utilisée pour:', product.title);
        } else if (!imageSrc) {
            // Image manquante, utiliser une image par défaut
            imageSrc = 'https://picsum.photos/seed/default/300/400';
            console.log('❌ Image manquante pour:', product.title);
        }
        
        return `
    <div class="product-card" onclick="goToProductDetail('${product._id}')">
        <div class="product-image">
            <img src="${imageSrc}" alt="${product.title}" loading="lazy" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px;">
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
}

// Navigation vers détail produit
function goToProductDetail(productId) {
    console.log('Navigation vers détail produit, ID:', productId);
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
    console.log('Profil');
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 DOM CHARGÉ - INITIALISATION ===');
    
    // Test immédiat de la grille
    const grid = document.getElementById('productsGrid');
    if (grid) {
        grid.innerHTML = '<div style="padding: 20px; background: #e8f5e8; color: #2d6a2d; border-radius: 8px; margin: 10px; text-align: center;">✅ Script fonctionne! Grid trouvée!</div>';
        console.log('✅ Message de test ajouté à la grille');
    }
    
    // Vérifier les éléments essentiels
    const sellModal = document.getElementById('sellModal');
    const sellBtn = document.querySelector('.sell-btn');
    const sellForm = document.getElementById('sellForm');
    
    console.log('Modal trouvé:', !!sellModal);
    console.log('Bouton vendre trouvé:', !!sellBtn);
    console.log('Formulaire trouvé:', !!sellForm);
    
    // Ajouter l'écouteur au formulaire
    if (sellForm) {
        sellForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitForm();
        });
        console.log('✅ Écouteur de soumission ajouté au formulaire');
    }
    
    // Ajouter un test direct sur le bouton submit
    const submitBtn = document.querySelector('button[type="button"].btn-primary');
    if (submitBtn) {
        console.log('✅ Bouton submit trouvé:', submitBtn);
    }
    
    // Initialiser le calcul du prix
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', updateTotalPrice);
        updateTotalPrice();
    }
    
    // Charger les données après 2 secondes pour voir le test
    setTimeout(() => {
        console.log('🔄 Début du chargement des produits...');
        loadProducts();
    }, 2000);
    
    console.log('=== INITIALISATION TERMINÉE ===');
});

// Configuration de l'API
const API_BASE_URL = window.location.origin + '/api';

// Variables globales
let currentCategory = 'all';
let currentSort = 'relevant';
let filteredProducts = [];
let cart = [];
let favorites = [];
let currentPage = 1;
let isLoading = false;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, initialisation...');
    
    // Vérifier si le formulaire existe
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        console.log('Formulaire trouvé, ajout des écouteurs');
        
        // Ajouter l'écouteur d'événement de soumission
        sellForm.addEventListener('submit', handleFormSubmit);
    } else {
        console.error('Formulaire non trouvé!');
    }
    
    loadProducts();
    setupEventListeners();
    updateCartCount();
    
    // Initialiser le calcul du prix total
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', updateTotalPrice);
        updateTotalPrice(); // Calcul initial
    }
});

// Fonction de soumission du formulaire séparée
async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('=== SOUMISSION DU FORMULAIRE ===');
    console.log('Début de la soumission du formulaire');
    
    if (!validateForm()) {
        console.log('Validation échouée');
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    
    console.log('FormData:', Object.fromEntries(formData));
    
    // Ajouter les informations du vendeur (simulation)
    const sellerInfo = {
        name: "Utilisateur Demo",
        rating: 4.5,
        avatar: "https://picsum.photos/seed/seller/50/50"
    };
    
    // Préparer les données pour l'API
    const price = parseFloat(formData.get('price'));
    const protectionFees = Math.round(price * 0.05);
    const totalPrice = price + protectionFees;
    
    const productData = {
        title: formData.get('title'),
        brand: formData.get('brand'),
        price: price,
        originalPrice: formData.get('originalPrice') ? parseFloat(formData.get('originalPrice')) : null,
        size: formData.get('size'),
        condition: formData.get('condition'),
        category: formData.get('category'),
        description: formData.get('description'),
        seller: sellerInfo,
        images: uploadedPhotos.map(photo => photo.url),
        image: uploadedPhotos.length > 0 ? uploadedPhotos[0].url : 'https://picsum.photos/seed/default/300/400',
        protectionFees: protectionFees,
        totalPrice: totalPrice
    };
    
    console.log('Données à envoyer:', productData);
    console.log('URL de l\'API:', API_BASE_URL);
    
    // Afficher l'état de chargement
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Publication en cours...';
    submitBtn.disabled = true;
    form.classList.add('form-loading');
    
    try {
        const url = `${API_BASE_URL}/products`;
        console.log('Envoi de la requête à:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response URL:', response.url);
        
        // Vérifier si la réponse est du JSON
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        if (!response.ok) {
            // Si le statut n'est pas OK, essayer de lire l'erreur
            let errorMessage = `Erreur HTTP ${response.status}`;
            try {
                const errorText = await response.text();
                console.log('Response error text:', errorText);
                if (errorText.startsWith('{')) {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                }
            } catch (e) {
                console.log('Impossible de parser l\'erreur:', e);
            }
            throw new Error(errorMessage);
        }
        
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.log('Response text (non-JSON):', text);
            throw new Error('Le serveur a renvoyé une réponse non-JSON. Réponse: ' + text.substring(0, 200));
        }
        
        const result = await response.json();
        console.log('Response JSON:', result);
        
        showMessage('Article publié avec succès !', 'success');
        closeSellModal();
        
        // Recharger les produits pour afficher le nouvel article
        setTimeout(() => {
            loadProducts();
        }, 1000);
        
    } catch (error) {
        console.error('Erreur complète:', error);
        showMessage('Erreur lors de la publication: ' + error.message, 'error');
    } finally {
        // Restaurer le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        form.classList.remove('form-loading');
    }
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Catégories
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndSortProducts();
        });
    });

    // Navigation mobile
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Recherche
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filtres prix
    document.getElementById('minPrice').addEventListener('input', filterAndSortProducts);
    document.getElementById('maxPrice').addEventListener('input', filterAndSortProducts);

    // Tailles et conditions
    document.querySelectorAll('.size-options input, .condition-options input').forEach(checkbox => {
        checkbox.addEventListener('change', filterAndSortProducts);
    });
}

// Toggle recherche
function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('active');
    if (searchBar.classList.contains('active')) {
        document.getElementById('searchInput').focus();
    }
}

// Toggle filtres
function toggleFilters() {
    const filterPanel = document.getElementById('filterPanel');
    filterPanel.classList.toggle('active');
    
    // Créer overlay si nécessaire
    if (!document.querySelector('.filter-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'filter-overlay';
        overlay.onclick = toggleFilters;
        document.body.appendChild(overlay);
    }
    
    document.querySelector('.filter-overlay').classList.toggle('active');
}

// Recherche de produits
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredProducts = products.filter(product => 
            product.title.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    } else {
        filteredProducts = [...products];
    }
    
    filterAndSortProducts();
    toggleSearch();
    showMessage('Recherche effectuée', 'success');
}

// Charger les produits depuis l'API
async function loadProducts(append = false) {
    if (isLoading) return;
    
    isLoading = true;
    const grid = document.getElementById('productsGrid');
    
    if (!append) {
        grid.innerHTML = '<div class="loading">Chargement des produits...</div>';
        currentPage = 1;
    }
    
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20,
            category: currentCategory,
            sort: currentSort
        });
        
        // Ajouter les filtres
        const minPrice = document.getElementById('minPrice')?.value;
        const maxPrice = document.getElementById('maxPrice')?.value;
        const searchInput = document.getElementById('searchInput')?.value;
        
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (searchInput) params.append('search', searchInput);
        
        const response = await fetch(`${API_BASE_URL}/products?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            if (append) {
                filteredProducts = [...filteredProducts, ...data.products];
            } else {
                filteredProducts = data.products;
            }
            renderProducts(append);
        } else {
            throw new Error(data.error || 'Erreur lors du chargement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        grid.innerHTML = '<div class="loading">Erreur de chargement. Veuillez réessayer.</div>';
        showMessage('Erreur de chargement des produits', 'error');
    } finally {
        isLoading = false;
    }
}

// Filtrer et trier les produits
function filterAndSortProducts() {
    currentPage = 1;
    loadProducts(false);
}

// Tri des produits
function sortProducts() {
    currentSort = document.getElementById('sortSelect').value;
    filterAndSortProducts();
}

// Appliquer les filtres
function applyFilters() {
    filterAndSortProducts();
    toggleFilters();
    showMessage('Filtres appliqués', 'success');
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.querySelectorAll('.size-options input, .condition-options input').forEach(cb => {
        cb.checked = false;
    });
    document.getElementById('sortSelect').value = 'relevant';
    
    filterAndSortProducts();
    showMessage('Filtres réinitialisés', 'info');
}

// Rendre les produits
function renderProducts(append = false) {
    const grid = document.getElementById('productsGrid');
    
    if (filteredProducts.length === 0 && !append) {
        grid.innerHTML = '<div class="loading">Aucun produit trouvé</div>';
        return;
    }
    
    const productsHTML = filteredProducts.map(product => `
        <div class="product-card" onclick="showProductDetail('${product._id}')">
            <div class="product-image">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <button class="favorite-btn-product ${product.liked ? 'active' : ''}" 
                        onclick="toggleFavorite(event, '${product._id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-brand">${product.brand}</div>
                <div class="product-price">
                    ${product.price.toFixed(2)} FCFA
                    ${product.originalPrice ? `<span class="product-original-price">${product.originalPrice.toFixed(2)} FCFA</span>` : ''}
                </div>
                <div class="product-size">Taille: ${product.size}</div>
                <div class="product-seller">
                    <div class="seller-avatar"></div>
                    <span>${product.seller.name} ⭐ ${product.seller.rating}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    if (append) {
        grid.innerHTML += productsHTML;
    } else {
        grid.innerHTML = productsHTML;
    }
}

// Toggle favori
async function toggleFavorite(event, productId) {
    event.stopPropagation();
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: 'demo-user' }) // À remplacer par l'authentification
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const product = filteredProducts.find(p => p._id === productId);
            if (product) {
                product.liked = data.liked;
                product.likes = data.likes;
                renderProducts();
                showMessage(data.liked ? 'Ajouté aux favoris' : 'Retiré des favoris', 'success');
            }
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors de la mise à jour des favoris', 'error');
    }
}

// Afficher détail produit
async function showProductDetail(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();
        
        if (response.ok) {
            showMessage(`Détail de: ${product.title}`, 'info');
            // Ici vous pourriez rediriger vers une page de détail
        } else {
            throw new Error(product.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors du chargement du produit', 'error');
    }
}

// Charger plus de produits
function loadMoreProducts() {
    currentPage++;
    loadProducts(true);
}

// Navigation mobile
function showHome() {
    currentCategory = 'all';
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.category-btn[data-category="all"]').classList.add('active');
    filterAndSortProducts();
}

function showCategories() {
    showMessage('Page des catégories', 'info');
}

function showSellForm() {
    const modal = document.getElementById('sellModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fermer le modal de vente
function closeSellModal() {
    const modal = document.getElementById('sellModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Réinitialiser le formulaire
    document.getElementById('sellForm').reset();
    clearPhotoPreviews();
}

// Gestion de l'upload de photos
let uploadedPhotos = [];

function handlePhotoUpload(event) {
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
                
                updatePhotoRequirements();
            }
        };
        reader.readAsDataURL(file);
    });
    
    // Vider l'input pour permettre de sélectionner les mêmes fichiers
    event.target.value = '';
}

function removePhoto(event, index) {
    event.stopPropagation();
    
    const slot = event.target.closest('.photo-slot');
    const img = slot.querySelector('.preview-image');
    const placeholder = slot.querySelector('.photo-placeholder');
    const removeBtn = slot.querySelector('.remove-photo');
    
    img.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    
    uploadedPhotos = uploadedPhotos.filter(photo => photo.index !== index);
    
    // Réorganiser les photos restantes
    reorganizePhotos();
    updatePhotoRequirements();
}

function reorganizePhotos() {
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    // Vider tous les slots
    slots.forEach(slot => {
        const img = slot.querySelector('.preview-image');
        const placeholder = slot.querySelector('.photo-placeholder');
        const removeBtn = slot.querySelector('.remove-photo');
        
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
    });
    
    // Remplir avec les photos restantes
    uploadedPhotos.forEach((photo, index) => {
        const slot = slots[index];
        if (slot) {
            const img = slot.querySelector('.preview-image');
            const placeholder = slot.querySelector('.photo-placeholder');
            const removeBtn = slot.querySelector('.remove-photo');
            
            img.src = photo.url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'flex';
            
            photo.index = index;
        }
    });
}

function updatePhotoRequirements() {
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    slots.forEach((slot, index) => {
        if (index < 3 && !slot.querySelector('.preview-image').style.display || slot.querySelector('.preview-image').style.display === 'none') {
            slot.classList.add('required');
        } else {
            slot.classList.remove('required');
        }
    });
}

function clearPhotoPreviews() {
    uploadedPhotos = [];
    const slots = document.querySelectorAll('.photo-slot');
    slots.forEach(slot => {
        const img = slot.querySelector('.preview-image');
        const placeholder = slot.querySelector('.photo-placeholder');
        const removeBtn = slot.querySelector('.remove-photo');
        
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
        slot.classList.remove('required');
    });
}

// Suggestions de prix
function setPrice(price) {
    document.getElementById('price').value = price;
    updateTotalPrice();
}

// Calculer le prix total avec frais de protection
function updateTotalPrice() {
    const priceInput = document.getElementById('price');
    const totalPriceInput = document.getElementById('totalPrice');
    const price = parseFloat(priceInput.value) || 0;
    
    // Frais de protection de 5%
    const protectionFees = Math.round(price * 0.05);
    const totalPrice = price + protectionFees;
    
    totalPriceInput.value = totalPrice;
}

// Validation du formulaire
function validateForm() {
    const form = document.getElementById('sellForm');
    const formData = new FormData(form);
    let isValid = true;
    
    // Réinitialiser les erreurs
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Validation des champs requis
    const requiredFields = ['title', 'brand', 'category', 'size', 'condition', 'price'];
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const value = formData.get(fieldName);
        
        if (!value || value.trim() === '') {
            showFieldError(field, 'Ce champ est obligatoire');
            isValid = false;
        }
    });
    
    // Validation des photos
    if (uploadedPhotos.length < 3) {
        showMessage('Veuillez ajouter au moins 3 photos', 'error');
        isValid = false;
    }
    
    // Validation du prix
    const price = parseFloat(formData.get('price'));
    if (price < 200 || price > 1000000) {
        const priceField = document.getElementById('price');
        showFieldError(priceField, 'Le prix doit être entre 200 FCFA et 1 000 000 FCFA');
        isValid = false;
    }
    
    // Validation du titre
    const title = formData.get('title');
    if (title.length < 3) {
        const titleField = document.getElementById('title');
        showFieldError(titleField, 'Le titre doit contenir au moins 3 caractères');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('small');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}


// Fermer le modal en cliquant sur l'overlay
document.getElementById('sellModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSellModal();
    }
});

// Fermer le modal avec la touche Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('sellModal');
        if (modal.classList.contains('active')) {
            closeSellModal();
        }
    }
});

async function showFavorites() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?category=favorites`);
        const data = await response.json();
        
        if (response.ok && data.products.length > 0) {
            filteredProducts = data.products;
            renderProducts();
            showMessage(`${data.products.length} article(s) favori(s)`, 'success');
        } else {
            showMessage('Aucun article favori', 'info');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showMessage('Erreur lors du chargement des favoris', 'error');
    }
}

// Gestion du panier
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = cart.length;
}

function addToCart(productId) {
    // À implémenter avec l'API
    showMessage('Ajouté au panier', 'success');
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

function showProfile() {
    showMessage('Page de profil', 'info');
}

// Optimisation des images (lazy loading)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Gestion du swipe pour mobile (optionnel)
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe gauche - pourrait naviguer vers la catégorie suivante
            console.log('Swipe gauche');
        } else {
            // Swipe droite - pourrait naviguer vers la catégorie précédente
            console.log('Swipe droite');
        }
    }
}

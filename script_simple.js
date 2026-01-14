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

// Fonction pour ouvrir le modal de vente
function showSellForm() {
    console.log('Bouton Vendre cliqué!');
    const modal = document.getElementById('sellModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('Modal affiché avec display:flex');
    } else {
        console.error('Modal non trouvé!');
        alert('Modal non trouvé!');
    }
}

// Fonction pour fermer le modal de vente
function closeSellModal() {
    const modal = document.getElementById('sellModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        console.log('Modal fermé avec display:none');
    }
}

// Fonction de soumission directe
async function submitForm() {
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
    
    // Préparer les données pour l'API
    const productData = {
        title: title,
        brand: brand,
        price: price,
        originalPrice: null,
        size: "M", // Valeur par défaut
        condition: condition,
        category: category,
        description: "Article publié depuis Vinted Clone",
        seller: {
            name: "Utilisateur Demo",
            rating: 4.5,
            avatar: "https://picsum.photos/seed/seller/50/50"
        },
        images: uploadedPhotos,
        image: uploadedPhotos.length > 0 ? uploadedPhotos[0] : 'https://picsum.photos/seed/default/300/400',
        protectionFees: 200,
        totalPrice: price + 200,
        views: 0,
        likes: 0,
        liked: false
    };
    
    console.log('Données à envoyer:', productData);
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Article publié:', result);
            
            alert('Article publié avec succès !');
            closeSellModal();
            
            // Recharger les produits pour afficher le nouvel article
            setTimeout(() => {
                loadProducts();
            }, 1000);
            
        } else {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
    } catch (error) {
        console.error('Erreur lors de la publication:', error);
        alert('Erreur lors de la publication: ' + error.message);
    }
}
function handleFormSubmit(e) {
    e.preventDefault();
    console.log('=== FORMULAIRE SOUMIS ===');
    console.log('Événement:', e);
    console.log('Formulaire:', e.target);
    
    // Afficher les valeurs actuelles du formulaire
    const formData = new FormData(e.target);
    console.log('Valeurs du formulaire:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    
    console.log('Photos uploadées:', uploadedPhotos.length);
    
    if (!validateForm()) {
        console.log('La validation a échoué');
        return;
    }
    
    console.log('Formulaire valide! Affichage du message de succès...');
    alert('Formulaire soumis avec succès!\n\nPhotos: ' + uploadedPhotos.length + '\nTitre: ' + document.getElementById('title').value);
    closeSellModal();
}

// Gestion des photos
function handlePhotoUpload(event) {
    console.log('handlePhotoUpload appelée!');
    console.log('Fichiers sélectionnés:', event.target.files);
    
    const files = event.target.files;
    const photoGrid = document.getElementById('photoGrid');
    
    if (!photoGrid) {
        console.error('photoGrid non trouvé!');
        return;
    }
    
    const slots = photoGrid.querySelectorAll('.photo-slot');
    console.log('Slots trouvés:', slots.length);
    
    for (let i = 0; i < files.length && uploadedPhotos.length < 4; i++) {
        const file = files[i];
        console.log('Traitement du fichier:', file.name);
        
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
                    
                    uploadedPhotos.push(e.target.result);
                    console.log('Photo ajoutée. Total:', uploadedPhotos.length);
                }
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    // Vider l'input
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
    uploadedPhotos.forEach((photoUrl, index) => {
        const slot = slots[index];
        if (slot && index < 4) {
            const img = slot.querySelector('.preview-image');
            const placeholder = slot.querySelector('.photo-placeholder');
            const removeBtn = slot.querySelector('.remove-photo');
            
            img.src = photoUrl;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            removeBtn.style.display = 'flex';
        }
    });
    
    console.log('Photos réorganisées:', uploadedPhotos.length);
}

// Fonctions utilitaires
function showMessage(text, type = 'info') {
    console.log('Message:', text, type);
}

function updateCartCount() {
    console.log('Panier mis à jour');
}

function validateForm() {
    console.log('Validation du formulaire');
    
    // Vérifier les photos (minimum 3)
    if (uploadedPhotos.length < 3) {
        alert('Vous devez ajouter au moins 3 photos pour publier un article.');
        console.log('Validation échouée: moins de 3 photos');
        return false;
    }
    
    // Vérifier les champs obligatoires
    const title = document.getElementById('title').value.trim();
    const brand = document.getElementById('brand').value.trim();
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const condition = document.getElementById('condition').value;
    
    if (!title) {
        alert('Le titre est obligatoire.');
        console.log('Validation échouée: titre manquant');
        return false;
    }
    
    if (!brand) {
        alert('La marque est obligatoire.');
        console.log('Validation échouée: marque manquante');
        return false;
    }
    
    if (!category) {
        alert('La catégorie est obligatoire.');
        console.log('Validation échouée: catégorie manquante');
        return false;
    }
    
    if (!price || price <= 0) {
        alert('Le prix est obligatoire et doit être supérieur à 0.');
        console.log('Validation échouée: prix invalide');
        return false;
    }
    
    if (!condition) {
        alert('L\'état de l\'article est obligatoire.');
        console.log('Validation échouée: état manquant');
        return false;
    }
    
    // Vérifier la protection acheteur (déjà cochée par défaut)
    const acceptProtection = document.getElementById('acceptProtection');
    if (!acceptProtection || !acceptProtection.checked) {
        alert('Les frais de protection de 200 FCFA sont obligatoires.');
        console.log('Validation échouée: frais de protection non acceptés');
        return false;
    }
    
    console.log('Validation réussie');
    return true;
}

function updateTotalPrice() {
    console.log('Prix total mis à jour');
    
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

function updatePhotoRequirements() {
    console.log('Exigences photos mises à jour');
}

function clearPhotoPreviews() {
    uploadedPhotos = [];
    console.log('Aperçus photos effacés');
}

function setupEventListeners() {
    console.log('Écouteurs configurés');
}

// Charger les produits
async function loadProducts() {
    console.log('Chargement des produits...');
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();
        
        if (response.ok) {
            filteredProducts = data.products || [];
            renderProducts();
            console.log('Produits chargés:', filteredProducts.length);
        }
    } catch (error) {
        console.error('Erreur chargement produits:', error);
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
    
    const productsHTML = filteredProducts.map(product => `
    <div class="product-card" onclick="goToProductDetail('${product._id}')">
        <div class="product-image">
            <img src="${product.image}" alt="${product.title}" loading="lazy">
            <button class="favorite-btn-product" onclick="toggleFavorite(event, '${product._id}')">
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
        </div>
    </div>
    `).join('');
    
    grid.innerHTML = productsHTML;
}

// Navigation vers détail produit
function goToProductDetail(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Toggle favori
function toggleFavorite(event, productId) {
    event.stopPropagation();
    console.log('Toggle favori:', productId);
}

// Autres fonctions
function showHome() {
    console.log('Accueil');
}

function showCategories() {
    console.log('Catégories');
}

function showFavorites() {
    console.log('Favoris');
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CHARGÉ - INITIALISATION ===');
    
    // Vérifier les éléments essentiels
    const sellModal = document.getElementById('sellModal');
    const sellBtn = document.querySelector('.sell-btn');
    const sellForm = document.getElementById('sellForm');
    
    console.log('Modal trouvé:', !!sellModal);
    console.log('Bouton vendre trouvé:', !!sellBtn);
    console.log('Formulaire trouvé:', !!sellForm);
    
    // Ajouter l'écouteur au formulaire
    if (sellForm) {
        sellForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Écouteur de soumission ajouté au formulaire');
        
        // Test direct de la soumission
        console.log('Test du formulaire...');
        console.log('Méthode du formulaire:', sellForm.method);
        console.log('Action du formulaire:', sellForm.action);
        console.log('Champs du formulaire:', sellForm.elements.length);
        
    } else {
        console.error('❌ Formulaire non trouvé!');
    }
    
    // Ajouter un test direct sur le bouton submit
    const submitBtn = document.querySelector('button[type="button" class="btn-primary" onclick="submitForm()">Publier l\'article</button>');
    if (submitBtn) {
        console.log('✅ Bouton submit trouvé:', submitBtn);
        submitBtn.addEventListener('click', function(e) {
            console.log('🔘 Bouton submit cliqué directement!');
            e.preventDefault();
            handleFormSubmit(e);
        });
    } else {
        console.error('❌ Bouton submit non trouvé!');
    }
    
    // Initialiser le calcul du prix
    const priceInput = document.getElementById('price');
    if (priceInput) {
        priceInput.addEventListener('input', updateTotalPrice);
        updateTotalPrice(); // Calcul initial
    }
    
    // Charger les données
    loadProducts();
    updateCartCount();
    
    console.log('=== INITIALISATION TERMINÉE ===');
});

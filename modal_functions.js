// Variables globales pour le modal
let currentProduct = null;
let currentImageIndex = 0;

// Afficher les détails d'un produit
async function showProductDetail(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();
        
        currentProduct = product;
        currentImageIndex = 0;
        
        // Remplir les informations
        document.getElementById('modalTitle').textContent = product.title;
        document.getElementById('modalBrand').textContent = product.brand;
        document.getElementById('modalPrice').textContent = `${product.price.toFixed(2)} FCFA`;
        document.getElementById('modalSize').textContent = product.size;
        document.getElementById('modalCondition').textContent = product.condition;
        document.getElementById('modalViews').textContent = product.views || 0;
        document.getElementById('modalLikes').textContent = product.likes || 0;
        document.getElementById('modalDescription').textContent = product.description || 'Pas de description.';
        
        // Prix total avec frais
        const protectionFees = Math.round(product.price * 0.05);
        const totalPrice = product.price + protectionFees;
        document.getElementById('modalProtectionFees').textContent = `Frais: ${protectionFees.toFixed(2)} FCFA`;
        document.getElementById('modalTotalPrice').textContent = `Total: ${totalPrice.toFixed(2)} FCFA`;
        
        // Vendeur
        document.getElementById('modalSellerName').textContent = product.seller.name;
        document.getElementById('modalSellerRating').textContent = product.seller.rating;
        document.getElementById('modalSellerAvatar').src = product.seller.avatar;
        
        // Images
        updateModalImages();
        updateFavoriteButton();
        
        // Afficher modal
        document.getElementById('productModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        showMessage('Erreur chargement produit', 'error');
    }
}

// Mettre à jour images modal
function updateModalImages() {
    if (!currentProduct) return;
    
    const mainImage = document.getElementById('modalMainImage');
    const thumbnailsContainer = document.getElementById('modalThumbnails');
    
    const images = currentProduct.images || [currentProduct.image];
    mainImage.src = images[currentImageIndex];
    
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumbnail.onclick = () => selectImage(index);
        
        const img = document.createElement('img');
        img.src = image;
        thumbnail.appendChild(img);
        thumbnailsContainer.appendChild(thumbnail);
    });
}

// Sélectionner image
function selectImage(index) {
    currentImageIndex = index;
    updateModalImages();
}

// Fermer modal détail
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
}

// Ajouter au panier depuis modal
function addToCartFromModal() {
    if (!currentProduct) return;
    addToCart(currentProduct._id);
    closeProductModal();
}

// Gérer favoris depuis modal
function toggleFavoriteFromModal() {
    if (!currentProduct) return;
    toggleFavorite(currentProduct._id);
    updateFavoriteButton();
}

// Mettre à jour bouton favori
function updateFavoriteButton() {
    if (!currentProduct) return;
    
    const favoriteBtn = document.getElementById('modalFavoriteText');
    const isLiked = favorites.includes(currentProduct._id);
    favoriteBtn.textContent = isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris';
}

// Contacter vendeur
function contactSeller() {
    if (!currentProduct) return;
    showMessage(`Message envoyé à ${currentProduct.seller.name} !`, 'success');
}

// Fermer modal avec Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (document.getElementById('productModal').classList.contains('active')) {
            closeProductModal();
        }
        if (document.getElementById('sellModal').classList.contains('active')) {
            closeSellModal();
        }
    }
});

// Fermer modal overlay
document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
});

document.getElementById('sellModal').addEventListener('click', function(e) {
    if (e.target === this) closeSellModal();
});

// Fonctions manquantes
function showFavorites() {
    showMessage('Favoris', 'info');
}

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) cartCount.textContent = cart.length;
}

function addToCart(productId) {
    cart.push(productId);
    updateCartCount();
    showMessage('Ajouté au panier', 'success');
}

function showProfile() {
    showMessage('Profil', 'info');
}

function showMessage(text, type = 'info') {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) existingMessage.remove();
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => message.classList.add('show'), 100);
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

function showSellForm() {
    document.getElementById('sellModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSellModal() {
    document.getElementById('sellModal').classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('sellForm').reset();
    clearPhotoPreviews();
}

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
    reorganizePhotos();
    updatePhotoRequirements();
}

function reorganizePhotos() {
    const photoGrid = document.getElementById('photoGrid');
    const slots = photoGrid.querySelectorAll('.photo-slot');
    
    slots.forEach(slot => {
        const img = slot.querySelector('.preview-image');
        const placeholder = slot.querySelector('.photo-placeholder');
        const removeBtn = slot.querySelector('.remove-photo');
        
        img.style.display = 'none';
        placeholder.style.display = 'flex';
        removeBtn.style.display = 'none';
    });
    
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
        if (index < 3 && (!slot.querySelector('.preview-image').style.display || slot.querySelector('.preview-image').style.display === 'none')) {
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

function setPrice(price) {
    document.getElementById('price').value = price;
    updateTotalPrice();
}

function updateTotalPrice() {
    const priceInput = document.getElementById('price');
    const totalPriceInput = document.getElementById('totalPrice');
    const price = parseFloat(priceInput.value) || 0;
    
    const protectionFees = Math.round(price * 0.05);
    const totalPrice = price + protectionFees;
    
    totalPriceInput.value = totalPrice;
}

function validateForm() {
    const form = document.getElementById('sellForm');
    const formData = new FormData(form);
    let isValid = true;
    
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    const requiredFields = ['title', 'brand', 'category', 'size', 'condition', 'price'];
    
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        const value = formData.get(fieldName);
        
        if (!value || value.trim() === '') {
            showFieldError(field, 'Ce champ est obligatoire');
            isValid = false;
        }
    });
    
    if (uploadedPhotos.length < 3) {
        showMessage('Veuillez ajouter au moins 3 photos', 'error');
        isValid = false;
    }
    
    const price = parseFloat(formData.get('price'));
    if (price < 200 || price > 1000000) {
        const priceField = document.getElementById('price');
        showFieldError(priceField, 'Le prix doit être entre 200 FCFA et 1 000 000 FCFA');
        isValid = false;
    }
    
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

let uploadedPhotos = [];

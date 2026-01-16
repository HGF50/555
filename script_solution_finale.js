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
// Fonction pour notifier les abonnés
function notifyFollowers(action, product) {
    console.log('🔔 Notification des abonnés pour:', action, product);
    
    // Récupérer les abonnés depuis localStorage ou utiliser des données de test
    let followers = [];
    try {
        const storedFollowers = localStorage.getItem('vinted_followers');
        if (storedFollowers) {
            followers = JSON.parse(storedFollowers);
        } else {
            // Abonnés de test
            followers = [
                { name: 'Marie Dupont', username: '@marie_du', avatar: 'https://picsum.photos/seed/follower1/50/50' },
                { name: 'Pierre Martin', username: '@pierre_ma', avatar: 'https://picsum.photos/seed/follower2/50/50' },
                { name: 'Sophie Bernard', username: '@sophie_be', avatar: 'https://picsum.photos/seed/follower3/50/50' },
                { name: 'Lucas Petit', username: '@lucas_pe', avatar: 'https://picsum.photos/seed/follower4/50/50' }
            ];
            localStorage.setItem('vinted_followers', JSON.stringify(followers));
        }
    } catch (error) {
        console.error('❌ Erreur chargement abonnés:', error);
        followers = [];
    }
    
    // Créer les notifications pour chaque abonné
    const notifications = followers.map(follower => {
        let notificationContent = '';
        let notificationIcon = '';
        let notificationTime = 'À l\'instant';
        
        if (action === 'new_product') {
            notificationContent = `<strong>${currentUser?.name || 'Utilisateur Demo'}</strong> a publié un nouvel article "${product.title}"`;
            notificationIcon = 'fa-shopping-bag';
        } else if (action === 'product_sold') {
            notificationContent = `<strong>${currentUser?.name || 'Utilisateur Demo'}</strong> a vendu l'article "${product.title}"`;
            notificationIcon = 'fa-tag';
        }
        
        return {
            id: Date.now() + Math.random(),
            follower: follower,
            content: notificationContent,
            icon: notificationIcon,
            time: notificationTime,
            read: false,
            product: product,
            action: action
        };
    });
    
    // Sauvegarder les notifications
    try {
        const existingNotifications = JSON.parse(localStorage.getItem('vinted_notifications') || '[]');
        const updatedNotifications = [...notifications, ...existingNotifications];
        localStorage.setItem('vinted_notifications', JSON.stringify(updatedNotifications));
        console.log('✅ Notifications sauvegardées pour', followers.length, 'abonnés');
        
        // Mettre à jour le compteur de notifications
        updateNotificationCount(updatedNotifications.filter(n => !n.read).length);
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde notifications:', error);
    }
}

// Fonction pour mettre à jour le compteur de notifications
function updateNotificationCount(count) {
    try {
        // Mettre à jour le badge dans le header si existant
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            if (count > 0) {
                notificationBadge.textContent = count > 99 ? '99+' : count;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
        
        // Mettre à jour le compteur dans la page profil si existant
        const profileNotificationCount = document.querySelector('.notification-count');
        if (profileNotificationCount) {
            if (count > 0) {
                profileNotificationCount.textContent = count > 99 ? '99+' : count;
                profileNotificationCount.style.display = 'inline-block';
            } else {
                profileNotificationCount.style.display = 'none';
            }
        }
        
        console.log('🔢 Compteur de notifications mis à jour:', count);
    } catch (error) {
        console.error('❌ Erreur mise à jour compteur:', error);
    }
}

// Fonction de soumission DIRECTE ET GARANTIE - VERSION DEBUG COMPLÈTE
function submitForm() {
    console.log('=== SUBMITFORM APPELÉ ===');
    console.log('📸 Photos uploadées:', uploadedPhotos ? uploadedPhotos.length : 'undefined');
    console.log('📸 Détail photos:', uploadedPhotos);
    
    // Test simple pour voir si la fonction s'exécute
    alert('🧪 TEST: submitForm est bien appelée !');
    
    // ÉTAPE 1: Vérification des photos
    console.log('🔍 ÉTAPE 1: Vérification des photos');
    if (!uploadedPhotos || uploadedPhotos.length === undefined) {
        console.log('❌ uploadedPhotos est undefined ou n\'a pas de length');
        alert('Erreur système: uploadedPhotos non défini');
        return;
    }
    
    if (uploadedPhotos.length < 3) {
        console.log('❌ Photos insuffisantes:', uploadedPhotos.length, '/ 3 requis');
        alert('Vous devez ajouter au moins 3 photos. Actuellement: ' + uploadedPhotos.length);
        return;
    }
    console.log('✅ Photos OK:', uploadedPhotos.length);
    
    // ÉTAPE 2: Récupération des champs
    console.log('🔍 ÉTAPE 2: Récupération des champs');
    const titleElement = document.getElementById('title');
    const brandElement = document.getElementById('brand');
    const categoryElement = document.getElementById('category');
    const priceElement = document.getElementById('price');
    const conditionElement = document.getElementById('condition');
    
    console.log('Éléments trouvés:', {
        title: !!titleElement,
        brand: !!brandElement,
        category: !!categoryElement,
        price: !!priceElement,
        condition: !!conditionElement
    });
    
    if (!titleElement || !brandElement || !categoryElement || !priceElement || !conditionElement) {
        console.log('❌ Un ou plusieurs éléments non trouvés');
        alert('Erreur système: champs du formulaire non trouvés');
        return;
    }
    
    const title = titleElement.value;
    const brand = brandElement.value;
    const category = categoryElement.value;
    const price = parseFloat(priceElement.value);
    const condition = conditionElement.value;
    
    console.log('Valeurs des champs:', {title, brand, category, price, condition});
    
    // ÉTAPE 3: Validation des champs
    console.log('🔍 ÉTAPE 3: Validation des champs');
    if (!title || !brand || !category || !price || !condition) {
        console.log('❌ Champs obligatoires manquants');
        alert('Veuillez remplir tous les champs obligatoires.');
        return;
    }
    console.log('✅ Champs OK');
    
    // ÉTAPE 4: Validation de la catégorie
    console.log('🔍 ÉTAPE 4: Validation de la catégorie');
    const categoriesAutorisees = ['women', 'men', 'kids', 'accessories', 'shoes', 'bags'];
    if (!categoriesAutorisees.includes(category)) {
        console.log('❌ Catégorie non autorisée:', category);
        alert('Catégorie non autorisée: ' + category);
        return;
    }
    console.log('✅ Catégorie OK:', category);
    
    // ÉTAPE 4.5: Validation des mots interdits
    console.log('🔍 ÉTAPE 4.5: Validation des mots interdits');
    const titreMinuscule = title.toLowerCase();
    const motsInterdits = ['téléphone', 'telephone', 'iphone', 'samsung', 'xiaomi', 'huawei', 'oppo', 'oneplus', 'nokia', 'sony', 'lg', 'htc', 'motorola', 'blackberry', 'portable', 'mobile', 'smartphone', 'appareil photo', 'ordinateur', 'pc', 'mac', 'laptop', 'tablet', 'ipad', 'console', 'playstation', 'xbox', 'nintendo', 'jeu vidéo', 'livre', 'meuble', 'décoration', 'jardin', 'outils', 'voiture', 'moto', 'vélo', 'épicerie', 'nourriture', 'animal', 'plante', 'médicament', 'produit chimique', 'électronique', 'electronique'];
    
    console.log('Recherche mots interdits dans:', titreMinuscule);
    for (const mot of motsInterdits) {
        if (titreMinuscule.includes(mot)) {
            console.log('❌ Mot interdit trouvé:', mot);
            alert(`❌ ARTICLE INTERDIT !\n\nLe mot "${mot}" n\'est pas autorisé.\n\nSEULS LES ARTICLES DE MODE SONT ACCEPTÉS :\n• Vêtements (t-shirts, robes, jeans, pulls...)\n• Chaussures (baskets, bottes, talons...)\n• Sacs (sacs à main, sacs à dos, pochettes...)\n• Accessoires (bijoux, montres, lunettes...)\n• Maroquinerie (portefeuilles, ceintures...)\n\nLes produits non-mode sont strictement interdits.`);
            return;
        }
    }
    console.log('✅ Aucun mot interdit trouvé');
    
    // ÉTAPE 5: Validation du titre (mode)
    console.log('🔍 ÉTAPE 5: Validation du titre (mode)');
    const motsMode = ['t-shirt', 'tshirt', 'tee shirt', 'top', 'chemise', 'pull', 'sweat', 'robe', 'jupe', 'pantalon', 'jean', 'short', 'manteau', 'veste', 'blouson', 'gilet', 'débardeur', 'body', 'combinaison', 'pyjama', 'maillot', 'sous-vêtement', 'lingerie', 'chaussures', 'baskets', 'bottes', 'talons', 'sandales', 'mocassins', 'sac', 'sac à main', 'sac à dos', 'pochette', 'bijoux', 'bague', 'collier', 'bracelet', 'boucle d\'oreille', 'montre', 'lunettes', 'ceinture', 'portefeuille', 'foulard', 'écharpe', 'chapeau', 'bonnet', 'casquette', 'gants'];
    
    console.log('Recherche de mot de mode dans:', titreMinuscule);
    const contientMotMode = motsMode.some(mot => titreMinuscule.includes(mot));
    console.log('Mots de mode trouvés:', motsMode.filter(mot => titreMinuscule.includes(mot)));
    
    if (!contientMotMode) {
        console.log('❌ Aucun mot de mode trouvé');
        alert('Votre titre doit décrire un article de mode (t-shirt, robe, jean, etc.)');
        return;
    }
    console.log('✅ Titre OK - mot de mode trouvé');
    
    // ÉTAPE 6: Création du produit
    console.log('🔍 ÉTAPE 6: Création du produit');
    try {
        const maxId = Math.max(...filteredProducts.map(p => parseInt(p._id) || 0), 0);
        const newId = String(maxId + 1);
        
        const newProduct = {
            _id: newId,
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
        
        console.log('✅ Produit créé:', newProduct);
        
        // ÉTAPE 7: Sauvegarde
        console.log('🔍 ÉTAPE 7: Sauvegarde');
        filteredProducts.unshift(newProduct);
        
        sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        console.log('✅ Sauvegarde OK');
        
        // ÉTAPE 8: Finalisation
        console.log('🔍 ÉTAPE 8: Finalisation');
        alert('Article publié avec succès !');
        closeSellModal();
        renderProducts();
        clearPhotoPreviews();
        uploadedPhotos = [];
        
        console.log('=== ARTICLE PUBLIÉ AVEC SUCCÈS ===');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du produit:', error);
        alert('Erreur lors de la publication: ' + error.message);
    }
}

// Fonction pour vendre un produit
function sellProduct(productId) {
    console.log('🛍️ Vente du produit:', productId);
    
    // Trouver le produit
    const product = filteredProducts.find(p => p._id === productId);
    if (!product) {
        console.error('❌ Produit non trouvé:', productId);
        return;
    }
    
    // NOTIFIER LES ABONNÉS - PRODUIT VENDU
    notifyFollowers('product_sold', product);
    
    // Marquer comme vendu
    product.sold = true;
    product.soldDate = new Date();
    
    // Sauvegarder
    try {
        localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
        sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
        console.log('✅ Produit marqué comme vendu');
        
        alert('Produit vendu avec succès !');
        renderProducts();
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde vente:', error);
    }
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
                title: "Veste en cuir synthétique",
                brand: "Mango",
                price: 45.99,
                originalPrice: 89.99,
                size: "M",
                condition: "Très bon état",
                category: "women",
                image: "https://picsum.photos/seed/veste1/300/400",
                seller: {
                    name: "Sophie",
                    rating: 4.7,
                    avatar: "https://picsum.photos/seed/sophie/50/50"
                },
                likes: 32,
                liked: false,
                description: "Élégante veste en cuir synthétique, idéale pour l'automne.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: '4',
                title: "Basket blanche mode",
                brand: "Nike",
                price: 65.99,
                originalPrice: null,
                size: "42",
                condition: "Neuf",
                category: "men",
                image: "https://picsum.photos/seed/basket1/300/400",
                seller: {
                    name: "Lucas",
                    rating: 4.6,
                    avatar: "https://picsum.photos/seed/lucas/50/50"
                },
                likes: 45,
                liked: false,
                description: "Basket blanche tendance, confortable et stylée.",
                status: 'available',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                _id: '5',
                title: "Sac à main en cuir véritable",
                brand: "Chanel",
                price: 120.99,
                originalPrice: 250.99,
                size: null,
                condition: "Neuf",
                category: "women",
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
            <img src="${imageSrc}" alt="${product.title}" loading="lazy" onerror="console.error('Erreur chargement image pour:', '${product.title}'); this.src='https://picsum.photos/seed/error/300/400';">
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
    console.log('🎯 Navigation vers détail produit');
    console.log('📋 ID reçu:', productId);
    console.log('📦 Produits disponibles:', filteredProducts.map(p => ({id: p._id, title: p.title})));
    
    // Trouver le produit pour vérification
    const product = filteredProducts.find(p => p._id === productId);
    if (product) {
        console.log('✅ Produit trouvé:', product.title);
        console.log('🌐 URL générée:', `product.html?id=${productId}`);
        
        // Sauvegarder avant navigation
        try {
            localStorage.setItem('vinted_products', JSON.stringify(filteredProducts));
            sessionStorage.setItem('vinted_products_temp', JSON.stringify(filteredProducts));
            sessionStorage.setItem('current_product_id', productId);
            console.log('✅ Sauvegarde avant navigation');
        } catch (error) {
            console.error('❌ Erreur sauvegarde navigation:', error);
        }
        
        // Navigation avec délai pour voir les logs
        setTimeout(() => {
            window.location.href = `product.html?id=${productId}`;
        }, 100);
    } else {
        console.error('❌ Produit non trouvé avec ID:', productId);
        alert('Produit non trouvé');
    }
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
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log('🔍 Recherche effectuée:', searchTerm);
    
    if (searchTerm === '') {
        // Si la recherche est vide, afficher tous les produits
        renderProducts();
        return;
    }
    
    // Filtrer les produits selon le terme de recherche
    const filtered = filteredProducts.filter(product => {
        return product.title.toLowerCase().includes(searchTerm) ||
               product.brand.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
    });
    
    console.log('📊 Résultats trouvés:', filtered.length);
    
    // Afficher les résultats
    renderProducts(filtered);
    
    // Afficher un message si aucun résultat
    if (filtered.length === 0) {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez avec d'autres mots-clés</p>
            </div>
        `;
    }
}

function filterAndSortProducts() {
    console.log('Filtrage et tri');
}

function sortProducts() {
    console.log('🔄 Tri des produits par marques...');
    
    const sortValue = document.getElementById('sortSelect').value;
    console.log('Type de tri demandé:', sortValue);
    
    if (!filteredProducts || filteredProducts.length === 0) {
        console.log('❌ Aucun produit à trier');
        return;
    }
    
    let sortedProducts = [...filteredProducts];
    
    switch(sortValue) {
        case 'brand-asc':
            // Tri par marques A-Z
            sortedProducts.sort((a, b) => {
                const brandA = (a.brand || '').toLowerCase();
                const brandB = (b.brand || '').toLowerCase();
                return brandA.localeCompare(brandB);
            });
            console.log('✅ Tri par marques A-Z effectué');
            break;
            
        case 'brand-desc':
            // Tri par marques Z-A
            sortedProducts.sort((a, b) => {
                const brandA = (a.brand || '').toLowerCase();
                const brandB = (b.brand || '').toLowerCase();
                return brandB.localeCompare(brandA);
            });
            console.log('✅ Tri par marques Z-A effectué');
            break;
            
        case 'price-low':
            // Tri par prix croissant
            sortedProducts.sort((a, b) => a.price - b.price);
            console.log('✅ Tri par prix croissant effectué');
            break;
            
        case 'price-high':
            // Tri par prix décroissant
            sortedProducts.sort((a, b) => b.price - a.price);
            console.log('✅ Tri par prix décroissant effectué');
            break;
            
        case 'relevant':
        default:
            // Tri par pertinence (marques populaires d'abord)
            const popularBrands = ['nike', 'adidas', 'zara', 'h&m', 'chanel', 'gucci', 'versace', 'prada', 'dior', 'louis vuitton'];
            sortedProducts.sort((a, b) => {
                const brandA = (a.brand || '').toLowerCase();
                const brandB = (b.brand || '').toLowerCase();
                
                const indexA = popularBrands.indexOf(brandA);
                const indexB = popularBrands.indexOf(brandB);
                
                // Si les deux marques sont populaires, trier par ordre de popularité
                if (indexA !== -1 && indexB !== -1) {
                    return indexA - indexB;
                }
                
                // Si seulement une marque est populaire, la mettre en premier
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;
                
                // Si aucune n'est populaire, trier alphabétiquement
                return brandA.localeCompare(brandB);
            });
            console.log('✅ Tri par pertinence (marques populaires) effectué');
            break;
    }
    
    // Mettre à jour filteredProducts avec le résultat trié
    filteredProducts = sortedProducts;
    
    // Réafficher les produits triés
    renderProducts();
    
    console.log('📊 Produits triés et réaffichés:', filteredProducts.length);
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

// Configuration de l'API
const API_BASE_URL = 'http://localhost:3001/api';

// Variables globales
let currentUser = null;
let userArticles = [];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 PAGE PROFIL CHARGÉE');
    
    loadUserProfile();
    loadUserArticles();
    updateCartCount();
});

// Charger le profil utilisateur
function loadUserProfile() {
    console.log('🔄 Chargement du profil utilisateur...');
    
    // Essayer de charger depuis localStorage
    try {
        const storedUser = localStorage.getItem('vinted_user_profile');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            console.log('✅ Profil chargé depuis localStorage:', currentUser);
        } else {
            // Créer un profil par défaut
            currentUser = {
                name: "Utilisateur Demo",
                username: "utilisateur_demo",
                email: "demo@vinted-clone.com",
                phone: "",
                location: "Paris, France",
                bio: "Acheteur et vendeur passionné sur Vinted Clone",
                avatar: "https://picsum.photos/seed/user/120/120",
                memberSince: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                rating: 4.5,
                totalLikes: 0,
                totalViews: 0,
                articlesCount: 0
            };
            
            // Sauvegarder le profil par défaut
            localStorage.setItem('vinted_user_profile', JSON.stringify(currentUser));
            console.log('✅ Profil par défaut créé:', currentUser);
        }
    } catch (error) {
        console.error('❌ Erreur localStorage:', error);
        currentUser = getDefaultProfile();
    }
    
    displayUserProfile();
}

// Obtenir le profil par défaut
function getDefaultProfile() {
    return {
        name: "Utilisateur Demo",
        username: "utilisateur_demo",
        email: "demo@vinted-clone.com",
        phone: "",
        location: "Paris, France",
        bio: "Acheteur et vendeur passionné sur Vinted Clone",
        avatar: "https://picsum.photos/seed/user/120/120",
        memberSince: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        rating: 4.5,
        totalLikes: 0,
        totalViews: 0,
        articlesCount: 0
    };
}

// Afficher le profil utilisateur
function displayUserProfile() {
    if (!currentUser) return;
    
    console.log('🎨 Affichage du profil:', currentUser);
    
    // Mettre à jour les informations de base
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('userLocation').textContent = currentUser.location || 'Non renseigné';
    
    // Formater les dates
    const memberDate = new Date(currentUser.memberSince);
    document.getElementById('memberSince').textContent = memberDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const lastLoginDate = new Date(currentUser.lastLogin);
    const today = new Date();
    const diffTime = Math.abs(today - lastLoginDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        document.getElementById('lastLogin').textContent = "Aujourd'hui";
    } else if (diffDays === 1) {
        document.getElementById('lastLogin').textContent = "Hier";
    } else {
        document.getElementById('lastLogin').textContent = `Il y a ${diffDays} jours`;
    }
    
    // Mettre à jour l'avatar si disponible
    if (currentUser.avatar) {
        const avatarElement = document.querySelector('.profile-avatar');
        if (avatarElement) {
            avatarElement.innerHTML = `<img src="${currentUser.avatar}" alt="${currentUser.name}">`;
        }
    }
}

// Charger les articles de l'utilisateur
function loadUserArticles() {
    console.log('🔄 Chargement des articles de l\'utilisateur...');
    
    userArticles = [];
    
    try {
        // Charger depuis localStorage
        const storedProducts = localStorage.getItem('vinted_products');
        if (storedProducts) {
            const allProducts = JSON.parse(storedProducts);
            
            // Filtrer les articles de l'utilisateur courant
            userArticles = allProducts.filter(product => {
                return product.seller && product.seller.name === currentUser.name;
            });
            
            console.log('✅ Articles de l\'utilisateur trouvés:', userArticles.length);
        }
    } catch (error) {
        console.error('❌ Erreur chargement articles:', error);
    }
    
    // Mettre à jour les statistiques
    updateProfileStats();
    
    // Afficher les articles
    displayUserArticles();
}

// Mettre à jour les statistiques du profil
function updateProfileStats() {
    console.log('📊 Mise à jour des statistiques...');
    
    let totalLikes = 0;
    let totalViews = 0;
    
    userArticles.forEach(article => {
        totalLikes += article.likes || 0;
        totalViews += article.views || 0;
    });
    
    // Mettre à jour l'objet utilisateur
    currentUser.totalLikes = totalLikes;
    currentUser.totalViews = totalViews;
    currentUser.articlesCount = userArticles.length;
    
    // Mettre à jour l'affichage
    document.getElementById('articlesCount').textContent = userArticles.length;
    document.getElementById('likesCount').textContent = totalLikes;
    document.getElementById('viewsCount').textContent = totalViews;
    document.getElementById('ratingCount').textContent = currentUser.rating.toFixed(1);
    
    console.log('📈 Statistiques mises à jour:', {
        articles: userArticles.length,
        likes: totalLikes,
        views: totalViews,
        rating: currentUser.rating
    });
    
    // Sauvegarder les statistiques
    try {
        localStorage.setItem('vinted_user_profile', JSON.stringify(currentUser));
    } catch (error) {
        console.error('❌ Erreur sauvegarde profil:', error);
    }
}

// Afficher les articles de l'utilisateur
function displayUserArticles() {
    const container = document.getElementById('userArticles');
    if (!container) return;
    
    if (userArticles.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>Vous n'avez pas encore publié d'articles</p>
                <button class="btn-profile btn-edit" onclick="window.location.href='index.html'">
                    <i class="fas fa-plus"></i> Publier un article
                </button>
            </div>
        `;
        return;
    }
    
    console.log('🎨 Affichage des articles utilisateur:', userArticles.length);
    
    const articlesHTML = userArticles.map(article => {
        // Gérer les images
        let imageSrc = article.image;
        if (imageSrc && imageSrc.startsWith('data:')) {
            console.log('✅ Image base64 utilisée pour:', article.title);
        } else if (!imageSrc) {
            imageSrc = 'https://picsum.photos/seed/default/200/200';
        }
        
        return `
            <div class="user-article-card" onclick="goToProductDetail('${article._id}')">
                <img src="${imageSrc}" alt="${article.title}" class="user-article-image" 
                     onerror="this.src='https://picsum.photos/seed/error/200/200';">
                <div class="user-article-info">
                    <div class="user-article-title">${article.title}</div>
                    <div class="user-article-price">${article.price.toFixed(2)} FCFA</div>
                    <div class="user-article-views">
                        <i class="fas fa-eye"></i> ${article.views || 0} vues
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = articlesHTML;
}

// Ouvrir le modal d'édition
function openEditModal() {
    console.log('✏️ Ouverture du modal d\'édition');
    
    const modal = document.getElementById('editModal');
    if (!modal) return;
    
    // Remplir le formulaire avec les données actuelles
    document.getElementById('editLocation').value = currentUser.location || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    
    // Afficher le modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Fermer le modal d'édition
function closeEditModal() {
    console.log('❌ Fermeture du modal d\'édition');
    
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Sauvegarder le profil édité
document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    console.log('💾 Sauvegarde du profil édité...');
    
    // Récupérer les données du formulaire
    const formData = new FormData(e.target);
    
    // Mettre à jour l'objet utilisateur
    currentUser.location = formData.get('location');
    currentUser.bio = formData.get('bio');
    currentUser.lastLogin = new Date().toISOString();
    
    // Sauvegarder dans localStorage
    try {
        localStorage.setItem('vinted_user_profile', JSON.stringify(currentUser));
        console.log('✅ Profil sauvegardé:', currentUser);
        
        // Mettre à jour l'affichage
        displayUserProfile();
        
        // Afficher un message de succès
        showMessage('Profil mis à jour avec succès !', 'success');
        
        // Fermer le modal
        closeEditModal();
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde profil:', error);
        showMessage('Erreur lors de la sauvegarde du profil', 'error');
    }
});

// Partager le profil
function shareProfile() {
    console.log('🔗 Partage du profil');
    
    const profileUrl = window.location.href;
    const profileText = `Découvrez le profil de ${currentUser.name} sur Vinted Clone !`;
    
    if (navigator.share) {
        // API Web Share (mobile)
        navigator.share({
            title: `Profil de ${currentUser.name}`,
            text: profileText,
            url: profileUrl
        }).then(() => {
            showMessage('Profil partagé avec succès !', 'success');
        }).catch((error) => {
            console.log('Partage annulé:', error);
        });
    } else {
        // Fallback: copier dans le presse-papiers
        navigator.clipboard.writeText(`${profileText} ${profileUrl}`).then(() => {
            showMessage('Lien du profil copié dans le presse-papiers !', 'success');
        }).catch(() => {
            showMessage('Erreur lors du partage du profil', 'error');
        });
    }
}

// Navigation vers le détail d'un article
function goToProductDetail(articleId) {
    console.log('Navigation vers l\'article:', articleId);
    window.location.href = `product.html?id=${articleId}`;
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        // Essayer de charger le panier depuis localStorage
        try {
            const cart = JSON.parse(localStorage.getItem('vinted_cart') || '[]');
            cartCount.textContent = cart.length;
        } catch (error) {
            cartCount.textContent = '0';
        }
    }
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

// Fermer le modal en cliquant à l'extérieur
document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeEditModal();
    }
});

// Navigation au clavier
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditModal();
    }
});

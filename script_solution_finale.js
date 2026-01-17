// Configuration de l'API (désactivée pour fonctionnement local)
const API_BASE_URL = null; // Pas de serveur requis

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
    
    // ÉTAPE 4.5: Validation des mots interdits - MARQUES NON-MODE COMPLÈTES
    console.log('🔍 ÉTAPE 4.5: Validation des mots interdits');
    const titreMinuscule = title.toLowerCase();
    const motsInterdits = [
        // MARQUES ÉLECTRONIQUES
        'samsung', 'apple', 'iphone', 'ipad', 'mac', 'macbook', 'imac', 'airpods', 'watch', 'apple watch',
        'xiaomi', 'huawei', 'oppo', 'oneplus', 'nokia', 'sony', 'lg', 'htc', 'motorola', 'blackberry',
        'google', 'pixel', 'nest', 'chromecast', 'youtube', 'gmail', 'android', 'galaxy', 'note', 's',
        'microsoft', 'windows', 'surface', 'xbox', 'office', 'teams', 'skype', 'outlook', 'linkedin',
        'dell', 'hp', 'lenovo', 'asus', 'acer', 'toshiba', 'msi', 'razer', 'corsair', 'logitech',
        'nvidia', 'amd', 'intel', 'qualcomm', 'broadcom', 'mediatek', 'snapdragon', 'ryzen', 'geforce',
        'canon', 'nikon', 'sony', 'fuji', 'panasonic', 'olympus', 'leica', 'sigma', 'tamron',
        'bose', 'jbl', 'sony', 'sennheiser', 'audio-technica', 'shure', 'akg', 'beats', 'skullcandy',
        'netflix', 'spotify', 'amazon', 'prime video', 'disney+', 'hulu', 'hbo max', 'paramount+',
        
        // MARQUES DE VOITURES
        'toyota', 'honda', 'nissan', 'volkswagen', 'bmw', 'mercedes', 'audi', 'ford', 'chevrolet', 'renault',
        'peugeot', 'citroën', 'fiat', 'alfa romeo', 'ferrari', 'lamborghini', 'porsche', 'maserati',
        'tesla', 'hyundai', 'kia', 'mazda', 'mitsubishi', 'subaru', 'suzuki', 'dacia', 'skoda',
        'jaguar', 'land rover', 'mini', 'smart', 'dacia', 'opel', 'seat', 'cupra', 'ds',
        'bugatti', 'bentley', 'rolls royce', 'aston martin', 'mclaren', 'lotus', 'koenigsegg',
        'volvo', 'saab', 'lancia', 'chrysler', 'dodge', 'jeep', 'ram', 'cadillac', 'buick',
        'gmc', 'pontiac', 'saturn', 'oldsmobile', 'mercury', 'lincoln', 'infiniti', 'acura',
        'lexus', 'genesis', 'hummer', 'hummer', 'pontiac', 'oldsmobile', 'saturn', 'mercury',
        
        // MARQUES DE MOTO ET SCOOTER
        'yamaha', 'kawasaki', 'ducati', 'harley-davidson', 'indian', 'triumph', 'bmw motorrad',
        'kymco', 'piaggio', 'vespa', 'aprilia', 'moto guzzi', 'benelli', 'honda', 'suzuki',
        'ktm', 'husqvarna', 'gas gas', 'beta', 'sherco', 'ktm', 'honda', 'yamaha', 'kawasaki',
        
        // MARQUES DE VÉLOS ET TROTTINETTES
        'decathlon', 'b\'twin', 'rockrider', 'triban', 'van ryssel', 'riverside', 'stadium', 'kipsta',
        'giant', 'trek', 'specialized', 'cannondale', 'scott', 'cube', 'canyon', 'rose', 'focus',
        'bianchi', 'colnago', 'pinarello', 'de rosa', 'look', 'time', 'campagnolo', 'shimano', 'sram',
        'xiaomi', 'ninebot', 'segway', 'hoverboard', 'trottinette électrique', 'gyroroue', 'unicycle',
        'electric scooter', 'e-scooter', 'boosted', 'evolve', 'meepo', 'inmotion', 'king song',
        'gotrax', 'swagtron', 'razor', 'huffy', 'mongoose', 'schwinn', 'mongoose', 'diamondback',
        
        // MARQUES D'ÉQUIPEMENTS SPORTS (non-vêtements)
        'nike', 'adidas', 'puma', 'reebok', 'under armour', 'new balance', 'asics', 'brooks',
        'salomon', 'the north face', 'columbia', 'patagonia', 'arc\'teryx', 'marmot', 'osprey',
        'wilson', 'head', 'babolat', 'yonex', 'dunlop', 'slazenger', 'prince', 'taylor made',
        'callaway', 'titleist', 'ping', 'cleveland', 'mizuno', 'srixon', 'bridgestone',
        
        // MARQUES D'APPAREILS MÉNAGERS
        'seb', 'moulinex', 'philips', 'bosch', 'siemens', 'miele', 'lg', 'samsung', 'whirlpool',
        'electrolux', 'aeg', 'beko', 'hotpoint', 'indesit', 'candy', 'hoover', 'dyson', 'rowenta',
        't-fal', 'calor', 'krups', 'magimix', 'kenwood', 'kitchenaid', 'smeg', 'neff', 'siemens',
        
        // MARQUES D'OUTILS ET BRICOLAGE
        'bosch', 'makita', 'de walt', 'milwaukee', 'hilti', 'festool', 'stanley', 'black & decker',
        'craftsman', 'ryobi', 'ridgid', 'portercable', 'hitachi', 'metabo', 'aeg', 'skil',
        'karcher', 'nilfisk', 'kärcher', 'stihl', 'husqvarna', 'echo', 'makita', 'dolmar',
        
        // MARQUES DE MEUBLES ET DÉCORATION
        'ikea', 'conforama', 'but', 'fly', 'maison du monde', 'la redoute', 'cdiscount', 'amazon',
        'westwing', 'made.com', 'wayfair', 'manomano', 'home24', 'otto', 'bauhaus', 'hornbach',
        'leroy merlin', 'castorama', 'brico dépôt', 'point p', 'mr bricolage', 'weldom',
        
        // MARQUES D'ALIMENTATION
        'carrefour', 'leclerc', 'auchan', 'intermarché', 'super u', 'casino', 'monoprix',
        'francis', 'leader price', 'aldi', 'lidl', 'netto', 'match', 'géant', 'cora',
        'mcdonald\'s', 'burger king', 'kfc', 'quick', 'subway', 'starbucks', 'costa coffee',
        
        // MARQUES DE BEAUTÉ ET COSMÉTIQUE
        'l\'oréal', 'l\'oreal', 'maybelline', 'max factor', 'revlon', 'clinique', 'estée lauder',
        'lancôme', 'dior', 'chanel', 'yves saint laurent', 'ysl', 'guerlain', 'shiseido', 'sk-ii',
        'nivea', 'dove', 'garnier', 'loreal', 'vaseline', 'neutrogena', 'cetaphil', 'avène',
        
        // MARQUES DE MÉDICAMENTS ET SANTÉ
        'sanofi', 'pfizer', 'bayer', 'novartis', 'roche', 'merck', 'johnson & johnson',
        'glaxosmithkline', 'astrazeneca', 'abbott', 'abbvie', 'eli lilly', 'bristol myers',
        'takeda', 'teva', 'mylan', 'viatris', 'cigna', 'aetna', 'unitedhealth',
        
        // MARQUES DE PAPIERIE ET LIVRES
        'moleskine', 'rhodia', 'clairefontaine', 'bic', 'pilot', 'staedtler', 'faber-castell',
        'papermate', 'sharpie', 'crayola', 'prismacolor', 'copic', 'winsor & newton',
        'hachette', 'larousse', 'robert', 'flammarion', 'gallimard', 'seuil', 'grasset',
        
        // MARQUES DE JARDIN ET ANIMAUX
        'truffaut', 'gamm vert', 'jardiland', 'botanic', 'weldom', 'leroy merlin', 'castorama',
        'royal canin', 'purina', 'whiskas', 'felix', 'hill\'s', 'eukanuba', 'pro plan',
        'pedigree', 'chappy', 'bakers', 'taste of the wild', 'blue buffalo', 'wellness',
        
        // PRODUITS ÉLECTRONIQUES
        'téléphone', 'telephone', 'portable', 'mobile', 'smartphone', 'appareil photo', 'ordinateur', 'pc', 'laptop',
        'tablet', 'ipad', 'console', 'playstation', 'xbox', 'nintendo', 'switch', 'wii', 'gameboy', 'ps5', 'ps4',
        'jeu vidéo', 'gaming', 'gamer', 'streaming', 'twitch', 'youtube', 'tiktok', 'instagram', 'facebook',
        'télévision', 'tv', 'écran', 'moniteur', 'projecteur', 'haut-parleur', 'enceinte', 'casque audio',
        'clavier', 'souris', 'webcam', 'microphone', 'imprimante', 'scanner', 'routeur', 'modem', 'wifi',
        'batterie', 'chargeur', 'câble', 'adaptateur', 'usb', 'hdmi', 'bluetooth', 'wifi', '5g', '4g',
        
        // APPAREILS MÉNAGERS
        'lave-linge', 'lave-vaisselle', 'réfrigérateur', 'congélateur', 'four', 'micro-ondes', 'aspirateur',
        'fer à repasser', 'centrale vapeur', 'cafetière', 'bouilloire', 'grille-pain', 'mixeur', 'blender',
        
        // OUTILS ET BRICOLAGE
        'perceuse', 'visseuse', 'scie', 'marteau', 'tournevis', 'clé', 'outils', 'bricolage', 'jardinage',
        'tondeuse', 'taille-haie', 'arrosoir', 'pelle', 'râteau', 'bêche', 'scie', 'mètre', 'niveau',
        
        // VOITURES ET TRANSPORT
        'voiture', 'auto', 'moto', 'scooter', 'vélo', 'bicyclette', 'skateboard', 'trottinette',
        'pneu', 'batterie', 'moteur', 'carburant', 'essence', 'diesel', 'électrique', 'hybride',
        
        // ALIMENTATION ET PRODUITS NON-MODE
        'épicerie', 'nourriture', 'aliment', 'cuisine', 'recette', 'restaurant', 'livraison', 'menu',
        'médicament', 'pharmacie', 'traitement', 'vitamines', 'compléments', 'santé', 'bien-être',
        'produit chimique', 'détergent', 'lessive', 'savon', 'cosmétique', 'maquillage', 'beauté',
        
        // ANIMAUX ET JARDIN
        'animal', 'chien', 'chat', 'oiseau', 'poisson', 'hamster', 'lapin', 'nourriture animale',
        'plante', 'fleur', 'jardin', 'potager', 'semence', 'engrais', 'pesticide', 'insecticide',
        
        // MEUBLES ET DÉCORATION
        'meuble', 'table', 'chaise', 'lit', 'canapé', 'armoire', 'commode', 'bibliothèque', 'étagère',
        'décoration', 'tapis', 'rideau', 'luminaire', 'lampe', 'miroir', 'cadre', 'tableau', 'sculpture',
        
        // LIVRES ET PAPIERIE
        'livre', 'roman', 'magazine', 'journal', 'papier', 'cahier', 'stylo', 'crayon', 'feutre',
        'imprimante', 'photocopieur', 'bureau', 'papeterie', 'cartable', 'sac d\'école',
        
        // SPORTS ÉQUIPEMENTS (non-vêtements)
        'ballon', 'raquette', 'club', 'bâton', 'ski', 'snowboard', 'surf', 'kayak', 'vélo', 'tapis',
        'haltères', 'poids', 'machine', 'tapis de course', 'elliptique', 'rameur', 'steppeur',
        
        // TERMES GÉNÉRAUX NON-MODE
        'électronique', 'electronique', 'numérique', 'digital', 'technologie', 'informatique', 'télécom',
        'automobile', 'automobiles', 'motorisé', 'motorisés', 'transport', 'transports', 'mobilité',
        'immobilier', 'immobiliers', 'maison', 'maisons', 'appartement', 'appartements', 'logement',
        'bricolage', 'jardinage', 'outillage', 'équipement', 'équipements', 'matériel', 'matériels',
        'alimentaire', 'alimentaires', 'comestible', 'comestibles', 'nourriture', 'boisson', 'boissons',
        'médical', 'médicaux', 'pharmaceutique', 'pharmaceutiques', 'santé', 'bien-être', 'hygiène',
        'scolaire', 'scolaires', 'éducation', 'éducatif', 'éducatifs', 'enseignement', 'formation',
        'professionnel', 'professionnels', 'bureau', 'bureaux', 'entreprise', 'entreprises', 'travail',
        'loisir', 'loisirs', 'divertissement', 'jeux', 'jouets', 'jouet', 'vacances', 'voyage',
        'financier', 'financiers', 'bancaire', 'bancaires', 'assurance', 'assurances', 'investissement',
        'industriel', 'industriels', 'fabrication', 'production', 'usine', 'usines', 'atelier', 'ateliers',
        'agricole', 'agricoles', 'ferme', 'fermes', 'exploitation', 'exploitations', 'culture', 'cultures',
        'animalier', 'animaliers', 'élevage', 'animaux', 'vétérinaire', 'vétérinaires', 'soins', 'soin',
        'nettoyage', 'entretien', 'propreté', 'hygiène', 'ménage', 'domestique', 'domestiques',
        'sécurité', 'protection', 'surveillance', 'alarme', 'défense', 'prévention', 'secours',
        'énergie', 'énergies', 'puissance', 'électricité', 'gaz', 'pétrole', 'carburant', 'carburants',
        'communication', 'communications', 'réseau', 'réseaux', 'connexion', 'connexions', 'internet',
        'multimédia', 'audio', 'vidéo', 'son', 'image', 'photo', 'photographie', 'film', 'films',
        'construction', 'bâtiment', 'bâtiments', 'architecture', 'matériaux', 'matériel', 'outils',
        'transport', 'transports', 'logistique', 'livraison', 'expédition', 'colis', 'marchandises',
        'recyclage', 'déchet', 'déchets', 'environnement', 'écologie', 'durable', 'vert', 'verte',
        'administration', 'administratif', 'administratifs', 'gouvernement', 'service', 'services',
        'juridique', 'juridiques', 'légal', 'légaux', 'contrat', 'contrats', 'document', 'documents',
        'scientifique', 'scientifiques', 'recherche', 'études', 'laboratoire', 'laboratoires', 'expérimental',
        'religieux', 'religieux', 'spirituel', 'spirituels', 'culte', 'cultes', 'cérémonie', 'cérémonies',
        'politique', 'politiques', 'social', 'sociaux', 'association', 'associations', 'organisme', 'organismes',
        'commercial', 'commerciaux', 'marché', 'marchés', 'vente', 'ventes', 'achat', 'achats',
        'publicité', 'publicités', 'marketing', 'promotion', 'promotions', 'pub', 'publicitaire',
        'militaire', 'militaires', 'armée', 'armées', 'défense', 'sécurité', 'protection', 'armement',
        'spatial', 'spatiaux', 'astronomie', 'astronomique', 'satellite', 'satellites', 'fusée', 'fusées',
        'météo', 'météorologique', 'climat', 'climatique', 'température', 'humidité', 'pression',
        'géographique', 'géographiques', 'carte', 'cartes', 'gps', 'localisation', 'positionnement',
        'biologique', 'biologiques', 'naturel', 'naturels', 'organique', 'organiques', 'bio',
        'chimique', 'chimiques', 'substance', 'substances', 'produit', 'produits', 'composant', 'composants',
        'mécanique', 'mécaniques', 'pièce', 'pièces', 'machine', 'machines', 'moteur', 'moteurs',
        'électrique', 'électriques', 'courant', 'courants', 'tension', 'intensité', 'puissance',
        'thermique', 'thermiques', 'chaleur', 'chauffage', 'climatisation', 'ventilation', 'isolation',
        'acoustique', 'acoustiques', 'son', 'sons', 'bruit', 'bruits', 'silence', 'vibration',
        'optique', 'optiques', 'lumière', 'lumières', 'vision', 'vue', 'œil', 'yeux', 'lentille',
        'temporel', 'temporels', 'temps', 'horloge', 'montre', 'calendrier', 'date', 'période',
        'quantité', 'quantités', 'mesure', 'mesures', 'poids', 'volume', 'dimension', 'dimensions',
        'qualité', 'qualités', 'norme', 'normes', 'standard', 'standards', 'certification', 'certifications',
        'coût', 'coûts', 'prix', 'tarif', 'tarifs', 'budget', 'budgets', 'dépense', 'dépenses',
        'revenu', 'revenus', 'salaire', 'salaires', 'profit', 'profits', 'gain', 'gains', 'économie',
        'risque', 'risques', 'danger', 'dangers', 'sécurité', 'protection', 'prévention', 'accident',
        'urgence', 'urgences', 'secours', 'aide', 'assistance', 'support', 'maintenance', 'réparation',
        'garantie', 'garanties', 'service', 'services', 'après-vente', 'client', 'clients', 'satisfaction',
        'information', 'informations', 'donnée', 'données', 'fichier', 'fichiers', 'base', 'bases',
        'système', 'systèmes', 'programme', 'programmes', 'logiciel', 'logiciels', 'application', 'applications',
        'interface', 'interfaces', 'utilisateur', 'utilisateurs', 'expérience', 'expériences', 'ergonomie',
        'design', 'conception', 'création', 'développement', 'innovation', 'technologie', 'futur',
        'histoire', 'historique', 'tradition', 'traditions', 'culture', 'cultures', 'patrimoine',
        'art', 'artistique', 'artistiques', 'œuvre', 'œuvres', 'collection', 'collections', 'musée',
        'spectacle', 'spectacles', 'concert', 'concerts', 'théâtre', 'cinéma', 'film', 'films',
        'livre', 'livres', 'roman', 'romans', 'poésie', 'poème', 'poèmes', 'littérature',
        'presse', 'journal', 'journaux', 'magazine', 'magazines', 'article', 'articles', 'reportage',
        'radio', 'télévision', 'média', 'médias', 'communication', 'informations', 'nouvelles',
        'sport', 'sports', 'athlétique', 'athlétiques', 'compétition', 'compétitions', 'tournoi',
        'jeu', 'jeux', 'divertissement', 'loisir', 'loisirs', 'passe-temps', 'hobby', 'hobbies',
        'voyage', 'voyages', 'tourisme', 'vacances', 'séjour', 'séjours', 'destination', 'destinations',
        'hôtel', 'hôtels', 'restaurant', 'restaurants', 'cuisine', 'cuisines', 'recette', 'recettes',
        'fête', 'fêtes', 'célébration', 'célébrations', 'événement', 'événements', 'occasion',
        'famille', 'familles', 'enfant', 'enfants', 'parent', 'parents', 'mariage', 'mariages',
        'amitié', 'amis', 'relation', 'relations', 'rencontre', 'rencontres', 'communauté', 'communautés',
        'éducation', 'écoles', 'université', 'universités', 'formation', 'formations', 'apprentissage',
        'carrière', 'carrières', 'emploi', 'emplois', 'travail', 'travailleurs', 'profession', 'professions',
        'entreprise', 'entreprises', 'société', 'sociétés', 'organisation', 'organisations', 'institution',
        'gouvernement', 'gouvernements', 'politique', 'politiques', 'administration', 'administrations',
        'loi', 'lois', 'règle', 'règles', 'règlement', 'règlements', 'justice', 'tribunal',
        'santé', 'médecine', 'hôpital', 'hôpitaux', 'clinique', 'cliniques', 'traitement', 'traitements',
        'handicap', 'handicaps', 'aide', 'aides', 'assistance', 'solidarité', 'social', 'sociaux',
        'environnement', 'écologie', 'nature', 'protection', 'conservation', 'développement', 'durable',
        'science', 'sciences', 'recherche', 'études', 'découverte', 'découvertes', 'innovation',
        'technologie', 'technologies', 'informatique', 'ordinateur', 'ordinateurs', 'internet', 'web',
        'téléphone', 'téléphones', 'portable', 'portables', 'mobile', 'mobiles', 'smartphone',
        'appareil', 'appareils', 'électronique', 'électroniques', 'numérique', 'numériques',
        'voiture', 'voitures', 'auto', 'autos', 'moto', 'motos', 'vélo', 'vélos', 'transport',
        'maison', 'maisons', 'appartement', 'appartements', 'immobilier', 'meubles', 'décoration',
        'jardin', 'jardins', 'bricolage', 'outils', 'matériel', 'équipement', 'équipements',
        'nourriture', 'aliments', 'boisson', 'boissons', 'épicerie', 'supermarché', 'restaurant',
        'vêtement', 'vêtements', 'mode', 'fashion', 'style', 'tendance', 'tendances', 'collection',
        'chaussures', 'sacs', 'accessoires', 'bijoux', 'montres', 'lunettes', 'maroquinerie',
        'beauté', 'cosmétique', 'maquillage', 'soin', 'soins', 'parfum', 'parfums', 'hygiène',
        'sport', 'sports', 'fitness', 'musculation', 'gym', 'salle', 'entraînement', 'exercice',
        'musique', 'instruments', 'concert', 'spectacle', 'théâtre', 'cinéma', 'film', 'films',
        'livre', 'livres', 'lecture', 'écriture', 'papier', 'cahier', 'stylo', 'crayon',
        'jeu', 'jeux', 'jouet', 'jouets', 'console', 'consoles', 'vidéo', 'ordinateur',
        'voyage', 'vacances', 'tourisme', 'hôtel', 'avion', 'train', 'billet', 'réservation',
        'fête', 'célébration', 'mariage', 'anniversaire', 'cadeau', 'cadeaux', 'décoration',
        'animaux', 'chien', 'chat', 'oiseau', 'poisson', 'plante', 'fleurs', 'jardinage',
        'argent', 'banque', 'carte', 'paiement', 'épargne', 'investissement', 'assurance',
        'sécurité', 'protection', 'alarme', 'caméra', 'surveillance', 'serrure', 'clé',
        'nettoyage', 'entretien', 'ménage', 'lessive', 'produit', 'détachant', 'aspirateur',
        'cuisine', 'cuisson', 'four', 'micro-ondes', 'réfrigérateur', 'lave-vaisselle', 'mixeur',
        'santé', 'médicament', 'pharmacie', 'ordonnance', 'docteur', 'médecin', 'hôpital',
        'école', 'université', 'études', 'cours', 'professeur', 'élève', 'étudiant', 'diplôme',
        'bureau', 'travail', 'ordinateur', 'imprimante', 'clavier', 'souris', 'téléphone',
        'voiture', 'moto', 'vélo', 'pneu', 'batterie', 'carburant', 'garage', 'mécanicien',
        'maison', 'construction', 'matériaux', 'outils', 'peinture', 'plomberie', 'électricité',
        'jardin', 'plantes', 'fleurs', 'arbres', 'pelouse', 'tondeuse', 'arrosoir', 'engrais',
        'animaux', 'nourriture', 'soins', 'vétérinaire', 'cage', 'aquarium', 'terrasse'
    ];
    
    console.log('Recherche mots interdits dans:', titreMinuscule);
    for (const mot of motsInterdits) {
        if (titreMinuscule.includes(mot)) {
            console.log('❌ Mot interdit trouvé:', mot);
            alert(`❌ ARTICLE INTERDIT !\n\nLe mot "${mot}" n\'est pas autorisé.\n\nSEULS LES ARTICLES DE MODE SONT ACCEPTÉS :\n• Vêtements (t-shirts, robes, jeans, pulls...)\n• Chaussures (baskets, bottes, talons...)\n• Sacs (sacs à main, sacs à dos, pochettes...)\n• Accessoires (bijoux, montres, lunettes...)\n• Maroquinerie (portefeuilles, ceintures...)\n\nLes produits non-mode sont strictement interdits.`);
            return;
        }
    }
    console.log('✅ Aucun mot interdit trouvé');
    
    // ÉTAPE 5: Validation du titre (mode) - BASE DE DONNÉES COMPLÈTE
    console.log('🔍 ÉTAPE 5: Validation du titre (mode)');
    
    // BASE DE DONNÉES COMPLÈTE DES ARTICLES DE MODE
    const articlesModeComplets = {
        // VÊTEMENTS FEMME
        vetements_femme: [
            'robe', 'robes', 'jupe', 'jupes', 'top', 'tops', 'tunique', 'tuniques', 'blouse', 'blouses', 'chemisier', 'chemisiers',
            'pull', 'pulls', 'gilet', 'gilets', 'cardigan', 'cardigans', 'boléro', 'boléros', 'poncho', 'ponchos', 'cape', 'capes',
            't-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee shirt', 'tee shirts', 'débardeur', 'débardeurs', 'tank top', 'tank tops',
            'body', 'bodys', 'combinaison', 'combinaisons', 'salopette', 'salopettes', 'jumpsuit', 'jumpsuits', 'playsuit', 'playsuits',
            'pantalon', 'pantalons', 'jean', 'jeans', 'slim', 'skinny', 'bootcut', 'flare', 'carotte', 'chino', 'chinos',
            'short', 'shorts', 'bermuda', 'bermudas', 'culotte', 'culottes', 'legging', 'leggings', 'jogging', 'joggings',
            'manteau', 'manteaux', 'veste', 'vestes', 'blouson', 'blousons', 'imper', 'imperméable', 'imperméables', 'trench', 'trenchs',
            'doudoune', 'doudounes', 'parka', 'parkas', 'anorak', 'anoraks', 'k-way', 'k-ways', 'perfecto', 'perfectos',
            'aviateur', 'bomber', 'bombers', 'survêtement', 'survêtements', 'ensemble', 'ensembles', 'tailleur', 'tailleurs',
            'pyjama', 'pyjamas', 'chemise de nuit', 'chemises de nuit', 'négligé', 'négligés', 'peignoir', 'peignoirs',
            'maillot', 'maillots', 'bikini', 'bikinis', 'monokini', 'monokinis', 'tankini', 'tankinis', 'paréo', 'paréos',
            'soutien-gorge', 'soutiens-gorge', 'bra', 'bras', 'string', 'strings', 'culotte', 'culottes', 'shorty', 'shortys',
            'boxer', 'boxers', 'slip', 'slips', 'tanga', 'tangas', 'lingerie', 'dessous', 'bas', 'collants', 'mi-bas', 'jambières',
            
            // STYLES MODERNES 2025
            'baggy', 'baggys', 'oversize', 'oversizes', 'large', 'larges', 'loose', 'loose fit', 'relaxed', 'relaxed fit',
            'mom jeans', 'dad jeans', 'girlfriend jeans', 'boyfriend jeans', 'straight', 'wide leg', 'jambes larges',
            'palazzo', 'palazzos', 'flare', 'bootcut', 'carrot', 'tapered', 'tapered fit', 'cargo', 'cargos',
            'carpenter', 'carpenters', 'utility', 'utilitaire', 'workwear', 'travail', 'chantier',
            'crop top', 'crop', 'cropped', 'court', 'brassière', 'bra', 'sports bra', 'sans manches',
            'manches courtes', 'manches longues', 'manches trois-quarts', 'volants', 'plissés', 'drapé', 'asymétrique',
            'bodycon', 'bodycon dress', 'sheath', 'sheath dress', 'a-line', 'a-line dress', 'shift', 'shift dress',
            'wrap', 'wrap dress', 'shirt', 'shirt dress', 'midi', 'midi dress', 'maxi', 'maxi dress', 'mini', 'mini dress',
            'pencil', 'pencil skirt', 'pleated', 'pleated skirt', 'tiered', 'tiered skirt', 'ruffled', 'ruffled skirt',
            'off shoulder', 'cold shoulder', 'one shoulder', 'halter', 'halter neck', 'spaghetti', 'spaghetti strap',
            'cowl', 'cowl neck', 'turtleneck', 'mock neck', 'v-neck', 'round neck', 'boat neck', 'square neck',
            'plunge', 'plunge neck', 'deep v', 'sweetheart', 'strapless', 'tube', 'tube top', 'camisole', 'camis',
            'blazer', 'blazers', 'suit', 'suit jacket', 'tuxedo', 'tuxedo jacket', 'dinner', 'dinner jacket',
            'bomber', 'bomber jacket', 'varsity', 'varsity jacket', 'letterman', 'letterman jacket', 'denim', 'denim jacket',
            'leather', 'leather jacket', 'suede', 'suede jacket', 'faux leather', 'faux leather jacket', 'vegan leather',
            'puffer', 'puffer jacket', 'quilted', 'quilted jacket', 'down', 'down jacket', 'parka', 'parka coat',
            'trench', 'trench coat', 'peacoat', 'pea coat', 'duffle', 'duffle coat', 'mac', 'mac coat', 'raincoat',
            'cardigan', 'cardigans', 'twinset', 'twinsets', 'sweater', 'sweaters', 'jumper', 'jumpers', 'pullover', 'pullovers',
            'hoodie', 'hoodies', 'sweatshirt', 'sweatshirts', 'crewneck', 'crewnecks', 'v-neck', 'v-necks'
        ],
        
        // VÊTEMENTS HOMME
        vetements_homme: [
            'chemise', 'chemises', 't-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee shirt', 'tee shirts', 'polo', 'polos',
            'débardeur', 'débardeurs', 'tank top', 'tank tops', 'pull', 'pulls', 'gilet', 'gilets', 'cardigan', 'cardigans',
            'sweat', 'sweats', 'sweatshirt', 'sweatshirts', 'hoodie', 'hoodies', 'blouson', 'blousons', 'veste', 'vestes',
            'manteau', 'manteaux', 'imper', 'imperméable', 'imperméables', 'trench', 'trenchs', 'doudoune', 'doudounes',
            'parka', 'parkas', 'anorak', 'anoraks', 'k-way', 'k-ways', 'perfecto', 'perfectos', 'aviateur', 'bomber', 'bombers',
            'pantalon', 'pantalons', 'jean', 'jeans', 'slim', 'skinny', 'bootcut', 'flare', 'carotte', 'chino', 'chinos',
            'short', 'shorts', 'bermuda', 'bermudas', 'cargo', 'cargos', 'survêtement', 'survêtements', 'ensemble', 'ensembles',
            'pyjama', 'pyjamas', 'boxer', 'boxers', 'slip', 'slips', 'caleçon', 'caleçons', 'sous-vêtement', 'sous-vêtements'
        ],
        
        // VÊTEMENTS ENFANT
        vetements_enfant: [
            'body', 'bodys', 'bardeau', 'bardeaux', 'combinaison', 'combinaisons', 'salopette', 'salopettes', 'robe', 'robes',
            'jupe', 'jupes', 'tunique', 'tuniques', 'top', 'tops', 't-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee shirt', 'tee shirts',
            'pull', 'pulls', 'gilet', 'gilets', 'cardigan', 'cardigans', 'sweat', 'sweats', 'sweatshirt', 'sweatshirts', 'hoodie', 'hoodies',
            'blouson', 'blousons', 'veste', 'vestes', 'manteau', 'manteaux', 'doudoune', 'doudounes', 'parka', 'parkas',
            'anorak', 'anoraks', 'imper', 'imperméable', 'imperméables', 'pantalon', 'pantalons', 'jean', 'jeans', 'short', 'shorts',
            'bermuda', 'bermudas', 'legging', 'leggings', 'jogging', 'joggings', 'pyjama', 'pyjamas', 'maillot', 'maillots',
            'bikini', 'bikinis', 'maillot de bain', 'maillots de bain', 'couche', 'couches', 'layette'
        ],
        
        // CHAUSSURES
        chaussures: [
            'baskets', 'basket', 'sneakers', 'sneaker', 'tennis', 'running', 'sport', 'chaussures de sport',
            'bottes', 'botte', 'bottines', 'bottine', 'boots', 'boot', 'mocassins', 'mocassin', 'loafers', 'loafer',
            'talons', 'talon', 'hauts talons', 'escarpins', 'escarpin', 'pumps', 'pump', 'plates', 'plate',
            'sandales', 'sandale', 'tongs', 'tong', 'flip flops', 'mules', 'mule', 'nu-pieds', 'nu-pied',
            'chaussures', 'chaussure', 'bottes de pluie', 'bottes de neige', 'bottes de randonnée', 'richelieu', 'derby',
            'basketball', 'football', 'rugby', 'golf', 'tennis', 'course', 'marche', 'randonnée', 'alpinisme', 'ski',
            'chaussures de ville', 'chaussures de soirée', 'chaussures de cérémonie', 'compensées', 'compensée',
            'plateforme', 'platform', 'wedges', 'wedge', 'ballerines', 'ballerine', 'chaussons', 'chausson',
            
            // CHAUSSURES MODERNES 2025
            'chunky', 'chunky sneakers', 'chunky trainers', 'plateforme', 'platform sneakers', 'platform trainers',
            'retro', 'vintage style', 'old school', 'classic', 'heritage', 'iconic', 'legendary', 'timeless',
            'minimaliste', 'minimalist', 'scandinave', 'nordique', 'japonais', 'zen', 'wabi sabi', 'clean',
            'tech', 'tech wear', 'performance', 'athletic', 'training', 'gym', 'fitness', 'workout', 'crossfit',
            'skate', 'skateboarding', 'skate shoes', 'board', 'surf', 'surfing', 'surf shoes', 'beach', 'beach shoes',
            'hiking', 'trail', 'trail running', 'outdoor', 'adventure', 'explore', 'trekking', 'mountain',
            'luxury', 'designer', 'haute couture', 'couture', 'bespoke', 'custom', 'made to measure', 'artisanal',
            'sustainable', 'eco-friendly', 'vegan', 'recycled', 'upcycled', 'ethical', 'conscious', 'green',
            'smart', 'connected', 'digital', 'tech', 'wearable', 'interactive', 'led', 'light up', 'self-lacing',
            'comfort', 'cushioning', 'support', 'stability', 'flexibility', 'breathable', 'lightweight', 'responsive',
            'slip-on', 'slip on', 'easy-on', 'convenience', 'practical', 'everyday', 'all-day', 'versatile'
        ],
        
        // ACCESSOIRES
        accessoires: [
            'sac', 'sacs', 'sac à main', 'sacs à main', 'sac à dos', 'sacs à dos', 'pochette', 'pochettes', 'besace', 'besaces',
            'bandoulière', 'bandoulières', 'sacoche', 'sacoche', 'sac banane', 'sacs banane', 'clutch', 'clutches',
            'mini sac', 'mini sacs', 'shopping', 'cabas', 'cabas', 'valise', 'valises', 'malette', 'malettes',
            'ceinture', 'ceintures', 'bretelles', 'bretelle', 'sangle', 'sangles', 'portefeuille', 'portefeuilles',
            'cartable', 'cartables', 'trousse', 'trousses', 'étui', 'étuis', 'besace', 'besaces',
            'bijoux', 'bijou', 'bague', 'bagues', 'anneau', 'anneaux', 'collier', 'colliers', 'sautoir', 'sautoirs',
            'bracelet', 'bracelets', 'boucle d\'oreille', 'boucles d\'oreille', 'pendentif', 'pendentifs', 'broche', 'broches',
            'épingle', 'épingles', 'barrette', 'barrettes', 'serre-tête', 'serre-têtes', 'diadème', 'diadèmes', 'voile', 'voiles',
            'fleur', 'fleurs', 'plume', 'plumes', 'ruban', 'rubans', 'nœud', 'nœuds', 'bow', 'bows',
            
            // BIJOUX MODERNES 2025 - COMPLET
            'chaîne', 'chaînes', 'chain', 'chains', 'chainette', 'chainettes', 'link', 'links', 'maille', 'mailles',
            ' gourmette', 'gourmettes', 'marine', 'marines', 'anchor', 'anchor chain', 'rope', 'rope chain',
            'box chain', 'câble', 'câbles', 'serpent', 'serpentine', 'snake chain', 'curb', 'curb chain',
            'figaro', 'figaro chain', 'wheat', 'wheat chain', 'spiga', 'spiga chain', 'byzantine', 'byzantine chain',
            'rolo', 'rolo chain', ' singapore', 'singapore chain', 'twisted', 'twisted chain', 'double', 'double chain',
            
            // BAGUES MODERNES
            'alliance', 'alliances', 'bague de fiançailles', 'solitaire', 'solitaires', 'éternité', 'éternités',
            'trilogy', 'trilogies', 'pavé', 'pavés', 'halo', 'halos', 'cocktail', 'cocktail ring', 'statement',
            'signet', 'signets', 'chevalière', 'chevalières', 'stacking', 'stacking rings', 'midi', 'midi ring',
            'knuckle', 'knuckle ring', 'adjustable', 'adjustable ring', 'open', 'open ring', 'wrap', 'wrap ring',
            'cluster', 'cluster ring', 'geometric', 'geometric ring', 'minimalist', 'minimalist ring', 'dainty',
            'bold', 'bold ring', 'chunky', 'chunky ring', 'vintage', 'vintage ring', 'art deco', 'art deco ring',
            
            // BRACELETS MODERNES
            'bracelet chain', 'bracelet chaîne', 'link bracelet', 'charm', 'charms', 'charm bracelet',
            'bangle', 'bangles', 'cuff', 'cuffs', 'cuff bracelet', 'tennis', 'tennis bracelet', 'line',
            'beaded', 'beaded bracelet', 'pearl', 'pearl bracelet', 'gemstone', 'gemstone bracelet',
            'leather', 'leather bracelet', 'cord', 'cord bracelet', 'rope', 'rope bracelet', 'paracord',
            'friendship', 'friendship bracelet', 'wrap', 'wrap bracelet', 'layered', 'layered bracelet',
            'stacking', 'stacking bracelets', 'minimalist', 'minimalist bracelet', 'delicate', 'delicate bracelet',
            'chunky', 'chunky bracelet', 'statement', 'statement bracelet', 'cufflink', 'cufflinks',
            
            // COLLIERS MODERNES
            'pendant', 'pendants', 'locket', 'lockets', 'medallion', 'medallions', 'dog tag', 'dog tags',
            'choker', 'chokers', 'princess', 'princess necklace', 'matinee', 'matinee necklace',
            'opera', 'opera necklace', 'rope', 'rope necklace', 'lariat', 'lariats', 'bib', 'bib necklace',
            'collar', 'collar necklace', 'statement', 'statement necklace', 'layered', 'layered necklace',
            'y-necklace', 'y-necklaces', 'lariat', 'lariat necklace', 'tassel', 'tassel necklace',
            'geometric', 'geometric necklace', 'minimalist', 'minimalist necklace', 'delicate', 'delicate necklace',
            'chunky', 'chunky necklace', 'bold', 'bold necklace', 'vintage', 'vintage necklace',
            'lock', 'lock necklace', 'heart', 'heart necklace', 'cross', 'cross necklace', 'star', 'star necklace',
            'moon', 'moon necklace', 'sun', 'sun necklace', 'infinity', 'infinity necklace', 'tree', 'tree of life',
            
            // BOUCLES D'OREILLES MODERNES
            'stud', 'studs', 'earring', 'earrings', 'drop', 'drop earrings', 'dangle', 'dangle earrings',
            'hoop', 'hoops', 'hoop earrings', 'huggie', 'huggies', 'huggie earrings', 'jacket', 'ear jacket',
            'climber', 'ear climber', 'cuff', 'ear cuff', 'threader', 'threader earrings', 'tassel', 'tassel earrings',
            'chandelier', 'chandelier earrings', 'statement', 'statement earrings', 'geometric', 'geometric earrings',
            'minimalist', 'minimalist earrings', 'dainty', 'dainty earrings', 'bold', 'bold earrings',
            'chunky', 'chunky earrings', 'vintage', 'vintage earrings', 'art deco', 'art deco earrings',
            
            // MATIÈRES ET FINITIONS
            'or', 'or jaune', 'or blanc', 'or rose', 'gold', 'yellow gold', 'white gold', 'rose gold',
            'argent', 'argent sterling', 'sterling silver', 'platinum', 'platine', 'palladium', 'titanium',
            'acier', 'acier inoxydable', 'stainless steel', 'bronze', 'laiton', 'brass', 'cuivre', 'copper',
            'verrerie', 'verre', 'glass', 'cristal', 'crystal', 'swarovski', 'diamant', 'diamonds',
            'perle', 'perles', 'pearl', 'pearls', 'opale', 'opales', 'opal', 'opals', 'émeraude', 'émeraudes',
            'rubis', 'rubis', 'saphir', 'saphirs', 'topaze', 'topazes', 'améthyste', 'améthystes',
            'citrine', 'citrines', 'grenat', 'grenats', 'turquoise', 'turquoises', 'jade', 'jades',
            'onyx', 'onyx', 'agate', 'agates', 'quartz', 'quartz', 'pierre', 'pierres', 'gemme', 'gemmes',
            'zirconium', 'zircon', 'cubic zirconia', 'lab created', 'synthetic', 'simulated', 'faux',
            
            // STYLES ET TENDANCES BIJOUX 2025
            'personalized', 'personalized jewelry', 'custom', 'custom jewelry', 'engraved', 'engraved jewelry',
            'birthstone', 'birthstones', 'zodiac', 'zodiac jewelry', 'initial', 'initial jewelry', 'name', 'name necklace',
            'photo', 'photo jewelry', 'memorial', 'memorial jewelry', 'locket', 'locket necklace', 'charm', 'charms',
            'layering', 'layering jewelry', 'stacking', 'stacking jewelry', 'mix', 'mix and match', 'versatile',
            'sustainable', 'sustainable jewelry', 'ethical', 'ethical jewelry', 'recycled', 'recycled jewelry',
            'lab-grown', 'lab-grown diamonds', 'conflict-free', 'conflict-free diamonds', 'vegan', 'vegan jewelry',
            'genderless', 'unisex jewelry', 'inclusive', 'inclusive jewelry', 'body positive', 'all bodies',
            'tech', 'smart jewelry', 'fitness tracker', 'health monitor', 'nfc', 'nfc jewelry', 'qr', 'qr code',
            '3d printed', '3d printed jewelry', 'innovative', 'innovative materials', 'modern', 'contemporary',
            'scandinavian', 'nordic design', 'minimalist', 'clean lines', 'japanese', 'zen', 'wabi sabi',
            'bohemian', 'boho', 'boho chic', 'festival', 'festival jewelry', 'beach', 'beach jewelry',
            'y2k', 'y2k jewelry', '2000s', 'retro futur', 'cyber', 'cyber jewelry', 'futuristic',
            
            // PIERCING ET BODY JEWELRY
            'piercing', 'piercings', 'body jewelry', 'navel', 'navel ring', 'belly button', 'belly ring',
            'nose', 'nose ring', 'septum', 'septum ring', 'lip', 'lip ring', 'eyebrow', 'eyebrow ring',
            'ear', 'ear piercing', 'cartilage', 'cartilage piercing', 'tragus', 'tragus piercing',
            'helix', 'helix piercing', 'conch', 'conch piercing', 'daith', 'daith piercing',
            'industrial', 'industrial piercing', 'bridge', 'bridge piercing', 'dermal', 'dermal piercing',
            'tongue', 'tongue ring', 'nipple', 'nipple ring', 'microdermal', 'surface piercing',
            
            // MONTRES ET TECH JEWELRY
            'smartwatch', 'smartwatches', 'fitness tracker', 'health monitor', 'apple watch', 'samsung watch',
            'garmin', 'fitbit', 'polar', 'suunto', 'casio', 'g-shock', 'fossil', 'michael kors',
            'daniel wellington', 'citizen', 'seiko', ' tissot', 'longines', 'rolex', 'omega',
            'tag heuer', 'breitling', 'patek philippe', 'audemars piguet', 'richard mille', 'hublot',
            
            // ACCESSOIRES BIJOUX
            'boîte à bijoux', 'jewelry box', 'coffret', 'coffret bijoux', 'écrin', 'écrins',
            'porte-bijoux', 'jewelry holder', 'organizer', 'jewelry organizer', 'display', 'jewelry display',
            'tapis', 'tapis bijoux', 'plateau', 'plateau bijoux', 'support', 'support bijoux',
            'nettoyant', 'nettoyant bijoux', 'polish', 'jewelry polish', 'chiffon', 'chiffon polishing',
            'loupe', 'loupe bijoux', 'balance', 'balance bijoux', 'testeur', 'testeur or', 'carat',
            
            'montre', 'montres', 'bracelet montre', 'bracelets montre', 'smartwatch', 'smartwatches',
            'lunettes', 'lunettes de soleil', 'lunettes de vue', 'solaire', 'solaires', 'vue', 'optique',
            'écharpe', 'écharpes', 'foulard', 'foulards', 'cache-col', 'cache-cols', 'châle', 'châles', 'stole', 'stoles',
            'bonnet', 'bonnets', 'casquette', 'casquettes', 'chapeau', 'chapeaux', 'béret', 'bérets', 'chapeau melon', 'chapeaux melon',
            'canotier', 'canotiers', 'fédora', 'fédoras', 'chapeau de paille', 'chapeaux de paille', 'casque', 'casques',
            'gants', 'gant', 'gants en cuir', 'gants en laine', 'gants de soie', 'mitaines', 'mitaine',
            'cravate', 'cravates', 'nœud papillon', 'nœuds papillon', 'plastron', 'plastrons', 'pin\'s', 'pin\'s',
            'chaussettes', 'chaussette', 'bas', 'collants', 'mi-bas', 'jambières', 'leggings', 'jaretelles', 'jaretelle',
            'porte-jarretelles', 'ceinture de sécurité', 'housse', 'housses', 'protection', 'protections',
            
            // ACCESSOIRES MODERNES 2025
            'fanny pack', 'banane', 'belt bag', 'crossbody', 'bandoulière', 'mini sac', 'micro sac', 'nano sac',
            'bucket hat', 'casquette à visière', 'beanie', 'bonnet', 'scrunchie', 'bandana', 'headband', 'serre-tête',
            'mask', 'masque', 'face mask', 'gants tactiles', 'airpods', 'écouteurs', 'tech accessories', 'gadgets',
            'phone case', 'coque', 'coque téléphone', 'tablet case', 'laptop sleeve', 'tech pouch', 'cable organizer',
            'water bottle', 'gourde', 'thermos', 'coffee cup', 'travel mug', 'reusable', 'durable', 'eco-friendly',
            'backpack', 'sac à dos', 'rucksack', 'daypack', 'hybrid', 'convertible', 'modular', 'customizable',
            'wallet', 'portefeuille', 'card holder', 'money clip', 'passport holder', 'travel wallet', 'minimalist',
            'sunglasses', 'lunettes de soleil', 'blue light', 'anti-blue light', 'gaming', 'computer', 'reading',
            'fitness tracker', 'smart ring', 'smart jewelry', 'wearable tech', 'health monitor', 'activity tracker',
            'hair accessories', 'accessoires cheveux', 'hair clips', 'barrettes', 'scrunchies', 'headbands', 'hair ties',
            'belt bag', 'waist bag', 'hip pack', 'lumbar pack', 'festival', 'concert', 'travel', 'everyday',
            'tote bag', 'shopping bag', 'reusable bag', 'eco bag', 'market bag', 'beach bag', 'grocery bag',
            'jewelry box', 'boîte à bijoux', 'travel case', 'organizer', 'storage', 'display', 'collection',
            'keychain', 'porte-clés', 'key ring', 'carabiner', 'multi-tool', 'practical', 'functional', 'edc'
        ],
        
        // MAROQUINERIE
        maroquinerie: [
            'cuir', 'simili cuir', 'daim', 'suede', 'peau', 'fourrure', 'fausse fourrure', 'exotique', 'textile',
            'sac en cuir', 'sacs en cuir', 'portefeuille en cuir', 'portefeuilles en cuir', 'ceinture en cuir', 'ceintures en cuir',
            'gants en cuir', 'gants en cuir', 'chaussures en cuir', 'chaussures en cuir', 'manteau en cuir', 'manteaux en cuir',
            'veste en cuir', 'vestes en cuir', 'blouson en cuir', 'blousons en cuir', 'bottes en cuir', 'bottes en cuir',
            'maroquinerie', 'artisanat', 'fait main', 'manufacture', 'luxe', 'premium', 'designer', 'créateur',
            
            // MARQUES DE MODE MONDIALES COMPLÈTES
            'louis vuitton', 'lv', 'gucci', 'chanel', 'hermès', 'hermes', 'prada', 'versace', 'dior', 'yves saint laurent', 'ysl',
            'balenciaga', 'celine', 'givenchy', 'saint laurent', 'loewe', 'bottega veneta', 'fendi', 'valentino',
            'burberry', 'mulberry', 'alexander mcqueen', 'mcqueen', 'stella mccartney', 'tom ford', 'jimmy choo',
            'manolo blahnik', 'christian louboutin', 'louboutin', 'roger vivier', 'sergio rossi', 'giuseppe zanotti',
            'dolce & gabbana', 'd&g', 'moschino', 'versace', 'emilio pucci', 'salvatore ferragamo', 'tods',
            
            // MARQUES DE LUXE AMÉRICAINES
            'ralph lauren', 'polo ralph lauren', 'calvin klein', 'ck', 'tommy hilfiger', 'tommy', 'michael kors', 'mk',
            'coach', 'kate spade', 'tory burch', 'marc jacobs', 'donna karan', 'dkny', 'anna sui', 'oscar de la renta',
            'carolina herrera', 'vera wang', 'badgley mischka', 'marchesa', 'elie saab', 'reem acra',
            'narciso rodriguez', 'proenza schouler', 'thom browne', 'rodarte', 'the row', 'altuzarra',
            
            // MARQUES EUROPÉENNES
            'zara', 'mango', 'bershka', 'pull & bear', 'massimo dutti', 'stradivarius', 'oysho', 'utopia',
            'h&m', 'cos', 'monki', 'weekday', 'arket', '& other stories', 'cOS', 'armani', 'emporio armani',
            'valentino', 'dolce & gabbana', 'moschino', 'max mara', 'blumarine', 'emilio pucci', 'etro',
            'missoni', 'alberta ferretti', 'brunello cucinelli', 'canali', 'zegna', 'corneliani',
            
            // MARQUES BRITANNIQUES
            'burberry', 'burberry', 'alexander mcqueen', 'mcqueen', 'stella mccartney', 'vivienne westwood', 'paul smith',
            'mulberry', 'ted baker', 'all saints', 'topshop', 'topshop', 'reiss', 'whistles', 'jigsaw',
            'karen millen', 'l k bennett', 'temperley london', 'rasario', 'roksanda', 'christopher kane',
            
            // MARQUES ASIATIQUES
            'uniqlo', 'muji', 'commes des garçons', 'cdg', 'issey miyake', 'yohji yamamoto', 'rei kawakubo',
            'kenzo', 'y-3', 'sacai', 'neil barrett', 'thom browne', 'junya watanabe', 'undercover',
            'visvim', 'mastermind japan', 'fragment', 'neighborhood', 'wtaps', 'supreme', 'bape', 'a bathing ape',
            'stüssy', 'hysteric glamour', 'cav empt', 'sophnet.', 'human made', 'wacko maria',
            
            // MARQUES CORÉENNES
            'samsung', 'lg', 'hyundai', 'kia', 'samsung fashion', '8seconds', 'spao', 'chuu', 'stylenanda',
            'musinsa', 'the handsome', 'system homme', 'ader error', 'mardi mercredi', 'gentle monster',
            'push button', 'thisisneverthat', 'vintage hollywood', 'nii', 'oioi', 'low classic',
            
            // MARQUES DE MODE AFRICAINES
            'duro olowu', 'deola sagoe', 'maki oh', 'orange culture', 'christie brown', 'lisa folawiyo',
            'iamisigo', 'sindiso khumalo', 'maxhosa', 'rich mnisi', 'thebe magugu', 'taibo bacar',
            
            // MARQUES DE MODE IVOIRIENNES ET AFRICAINES
            'laurentine', 'laurentine paris', 'kany', 'kany paris', 'nafissa', 'nafissa mode', 'aziz', 'aziz couture',
            'pathe\'o', 'pathe\'o designs', 'aurélie', 'aurélie ya', 'florence', 'florence bak', 'mimz',
            'mimz design', 'vava', 'vava couture', 'ady', 'ady fashion', 'bella', 'bella couture',
            'coco', 'coco gaillard', 'estelle', 'estelle yace', 'marie', 'marie c', 'aïcha', 'aïcha konan',
            'fatou', 'fatou sylla', 'mabintou', 'mabintou couture', 'sokhna', 'sokhna diarra',
            'assetou', 'assetou komoe', 'bineta', 'bineta kaba', 'alma', 'alma daly', 'kadidjatou',
            'kadidjatou camara', 'aïssatou', 'aïssatou bamba', 'mariam', 'mariam sy',
            
            // MARQUES DE LINGERIE AFRICAINES
            'anais', 'anais lingerie', 'chouchou', 'chouchou lingerie', 'eddy', 'eddy kani', 'nafy',
            'nafy lingerie', 'rosy', 'rosy lingerie', 'aisha', 'aisha intimates', 'zara africa',
            'mango africa', 'h&m africa', 'zara nigeria', 'zara south africa', 'mango kenya',
            
            // MARQUES DE CHAUSSURES AFRICAINES
            'bata', 'bata shoes', 'liberty', 'liberty shoes', 'elephant', 'elephant shoes',
            'woodin', 'woodin shoes', 'nike africa', 'adidas africa', 'puma africa',
            
            // MARQUES DE TISSUS AFRICAINS
            'wax', 'african wax', 'ankara', 'kitenge', 'kente', 'bogolan', 'mudcloth',
            'shweshwe', 'shweshwe kente', 'george', 'george cloth', 'adire', 'adire cloth',
            'aso oke', 'aso oke cloth', 'kampala', 'kampala fabric', 'bazin', 'bazin riche',
            
            // MARQUES DE MODE INTERNATIONALES
            'zara', 'mango', 'h&m', 'gap', 'banana republic', 'old navy', 'j crew', 'united colors of benetton',
            'urban outfitters', 'topshop', 'river island', 'asos', 'boohoo', 'prettylittlething', 'missguided',
            'fashion nova', 'shein', 'temu', 'aliexpress', 'wish', 'joom', 'gearbest',
            
            // MARQUES DE SPORTSWEAR
            'nike', 'adidas', 'puma', 'reebok', 'under armour', 'new balance', 'asics', 'brooks',
            'salomon', 'the north face', 'columbia', 'patagonia', 'arc\'teryx', 'marmot', 'osprey',
            'vans', 'converse', 'new balance', 'new balance', 'skechers', 'crocs', 'birkenstock',
            'timberland', 'dr. martens', 'clarks', 'doc martens', 'dr martens',
            
            // MARQUES DE JEANS DENIM
            'levis', 'lee', 'wrangler', 'calvin klein', 'diesel', 'guess', 'tommy hilfiger', 'gap',
            'old navy', 'banana republic', 'j crew', 'madewell', 'everlane', 'uniqlo', 'muji',
            
            // MARQUES DE BAGS ET ACCESSOIRES
            'longchamp', 'longchamp', 'céline', 'celine', 'loewe', 'bottega veneta', 'fendi', 'givenchy',
            'prada', 'miu miu', 'balenciaga', 'saint laurent', 'ysl', 'dior', 'chanel',
            'hermès', 'hermes', 'gucci', 'versace', 'furla', 'kate spade', 'michael kors',
            'coach', 'tory burch', 'rebecca minkoff', 'mcm', 'tumi', 'samsonite',
            
            // MARQUES DE MONTRES
            'rolex', 'omega', 'tag heuer', 'breitling', 'patek philippe', 'audemars piguet',
            'vacheron constantin', 'jaeger lecoultre', 'cartier', 'piaget', 'bulgari', 'hublot',
            'richard mille', 'iwc', 'panerai', 'a lange & söhne', 'glashütte original',
            
            // MARQUES DE BIJOUX
            'cartier', 'van cleef & arpels', 'tiffany & co', 'tiffany', 'bulgari', 'boucheron',
            'harry winston', 'chopard', 'piaget', 'jaeger lecoultre', 'dior joaillerie',
            'chanel joaillerie', 'hermès', 'gucci', 'van cleef', 'tiffany', 'bvlgari',
            
            // MARQUES DE LUNETTES
            'ray-ban', 'ray ban', 'oakley', 'persol', 'tom ford', 'prada', 'chanel', 'dior',
            'gucci', 'versace', 'fendi', 'givenchy', 'carrera', 'police', 'oliver peoples',
            'warby parker', 'glass', 'zenni', 'hubble', 'contacts', 'acuvue',
            
            // MARQUES DE COSMÉTIQUES (mode)
            'chanel', 'dior', 'yves saint laurent', 'ysl', 'lancôme', 'estée lauder', 'clinique',
            'mac', 'smashbox', 'nars', 'urban decay', 'benefit', 'too faced', 'tarte',
            'fenty beauty', 'fenty', 'glossier', 'charlotte tilbury', 'kiehl\'s', 'bobbi brown',
            
            // MARQUES DE PARFUMS
            'chanel', 'dior', 'yves saint laurent', 'gucci', 'versace', 'hermès', 'tom ford',
            'creed', 'byredo', 'jo malone', 'le labo', 'santal 33', 'initio', 'parfums de marly',
            'xerjoff', 'roja dovec', 'amouage', 'mancera', 'frater', 'sultan pasha',
            
            // MARQUES DE CHAUSSURES DE LUXE
            'christian louboutin', 'manolo blahnik', 'jimmy choo', 'roger vivier', 'giuseppe zanotti',
            'sergio rossi', 'stuart weitzman', 'brian atwood', 'nicholas kirkwood', 'alexander mcqueen',
            'balenciaga', 'vetements', 'rick owens', 'maison margiela', 'y/Project', 'yohji yamamoto',
            
            // MARQUES DE MODE STREETWEAR
            'supreme', 'bape', 'a bathing ape', 'off-white', 'palace', 'kith', 'noah', 'fear of god',
            'amiri', 'vetements', 'a-cold-wall*', 'heron preston', 'aimé leon dore', 'thom browne',
            'corteiz', 'corteiz rtw', 'palm angels', 'c.p. company', 'denim tears', 'rhude',
            
            // MARQUES DE MODE ÉTHIQUES
            'patagonia', 'everlane', 'reformation', 'eileen fisher', 'stella mccartney', 'veja',
            'allbirds', 'nudie jeans', 'kotn', 'organic basics', 'people tree', 'thought',
            'armedangels', 'girlfriend collective', 'sustainable', 'ethical', 'eco-friendly',
            
            // MARQUES DE MODE VINTAGE
            'levis', 'wrangler', 'lee', 'carhartt', 'dickies', 'ben davis', 'champion',
            'fred perry', 'lacoste', 'tommy hilfiger', 'ralph lauren', 'calvin klein',
            
            // MARQUES DE MODE ASIATIQUES POPULAIRES
            'uniqlo', 'muji', 'commes des garçons', 'cdg', 'issey miyake', 'yohji yamamoto',
            'kenzo', 'sacai', 'neil barrett', 'thom browne', 'junya watanabe', 'undercover',
            'visvim', 'mastermind japan', 'fragment', 'neighborhood', 'wtaps', 'supreme', 'bape',
            
            // MARQUES DE MODE LATINO-AMÉRICAINES
            'hermes', 'hermé', 'carolina herrera', 'oscar de la renta', 'carolina herrera',
            'adriana degreas', 'jorge wagner', 'agatha ruiz de la prada', 'jonathan simkhai',
            'cushnie et ochs', 'paco rabanne', 'loewe', 'balmain', 'nina ricci',
            
            // MARQUES DE MODE MOYEN-ORIENTALES
            'elie saab', 'reem acra', 'zuhair murad', 'faiza bouguessa', 'sandra mansour',
            'mashael', 'mish', 'mish couture', 'ramy al asheq', 'yousef aljasmi',
            'jean louis sabaji', 'rabih kayrouz', 'basel', 'basel designs'
        ],
        
        // MATIÈRES ET TEXTILES
        matieres_textiles: [
            'matières', 'textiles', 'tissus', 'fibres', 'coton', 'lin', 'soie', 'laine', 'cache', 'angora', 'mohair',
            'cashmere', 'cachemire', 'viscose', 'polyester', 'nylon', 'spandex', 'elastane', 'lycra', 'jean', 'denim',
            'velours', 'velours côtelé', 'tweed', 'flanelle', 'chiffon', 'organza', 'taffetas', 'satin', 'gaze', 'tulle',
            'dentelle', 'broderie', 'perle', 'perles', 'strass', 'paillette', 'paillettes', 'sequin', 'sequins',
            'imprimé', 'imprimés', 'fleuri', 'floraux', 'géométrique', 'géométriques', 'animalier', 'animaliers',
            'rayé', 'rayés', 'à pois', 'unie', 'uni', 'multicolore', 'multicolores', 'bicolore', 'bicolores',
            'matière', 'matières', 'texture', 'textures', 'tissu', 'tissus', 'étoffe', 'étoffes', 'tissage', 'tissages'
        ],
        
        // COULEURS ET MOTIFS
        couleurs_motifs: [
            'noir', 'noire', 'noirs', 'noires', 'blanc', 'blanche', 'blancs', 'blanches', 'gris', 'grise', 'gris', 'grises',
            'bleu', 'bleue', 'bleus', 'bleues', 'rouge', 'rouge', 'rouges', 'rouges', 'vert', 'verte', 'verts', 'vertes',
            'jaune', 'jaune', 'jaunes', 'jaunes', 'rose', 'rose', 'roses', 'roses', 'violet', 'violette', 'violets', 'violettes',
            'orange', 'orange', 'oranges', 'oranges', 'marron', 'marron', 'marrons', 'marrons', 'beige', 'beige', 'beiges', 'beiges',
            'kaki', 'kaki', 'kakis', 'kakis', 'marine', 'marine', 'moutarde', 'moutarde', 'turquoise', 'turquoise',
            'corail', 'corail', 'saumon', 'saumon', 'ivoire', 'ivoire', 'argent', 'doré', 'or', 'cuivre', 'bronze',
            'imprimé', 'imprimés', 'motif', 'motifs', 'fleuri', 'floraux', 'géométrique', 'géométriques', 'animalier', 'animaliers',
            'rayé', 'rayés', 'à pois', 'à carreaux', 'vichy', 'pied-de-coq', 'liseré', 'liserés', 'brodé', 'brodés'
        ],
        
        // STYLES ET TENDANCES (version mise à jour 2025)
        styles_tendances: [
            'vintage', 'rétro', 'classique', 'moderne', 'contemporain', 'minimaliste', 'chic', 'élégant', 'sobre', 'décontracté',
            'sport', 'sportswear', 'casual', 'urban', 'streetwear', 'hip-hop', 'skate', 'surf', 'board', 'rock', 'punk',
            'gothique', 'romantique', 'bohème', 'ethnique', 'exotique', 'glamour', 'sophistiqué', 'haute couture', 'prêt-à-porter',
            'fast fashion', 'luxe', 'designer', 'créateur', 'made in', 'artisanal', 'bio', 'écologique', 'durable', 'recyclé',
            'tendance', 'tendance', 'mode', 'fashion', 'style', 'look', 'silhouette', 'coupe', 'forme', 'ajusté', 'ample',
            'cintré', 'droit', 'évasé', 'taille haute', 'taille basse', 'long', 'court', 'mini', 'maxi', 'midi', 'three-piece',
            
            // TENDANCES 2025
            'baggy', 'baggys', 'large', 'larges', 'oversize', 'oversizes', 'loose', 'loose fit', 'relaxed', 'relaxed fit',
            'cargo', 'cargos', 'carpenter', 'carpenters', 'utility', 'utilitaire', 'workwear', 'travail', 'chantier',
            'y2k', 'y2k fashion', '2000s', 'années 2000', 'retro futur', 'cyber', 'cyberpunk', 'techwear', 'tech wear',
            'e-girl', 'e-boy', 'tiktok', 'instagram', 'influence', 'influenceur', 'trendy', 'viral', 'must have',
            'athleisure', 'athleisure wear', 'sporty chic', 'lounge', 'lounge wear', 'home wear', 'comfort', 'confort',
            'sustainable', 'durable', 'eco-friendly', 'vegan', 'zéro déchet', 'upcycled', 'second hand', 'vintage',
            'genderless', 'unisexe', 'fluid', 'non-binaire', 'inclusive', 'diversity', 'body positive', 'all sizes',
            
            // COUPES ET FORMES MODERNES
            'mom jeans', 'dad jeans', 'girlfriend jeans', 'boyfriend jeans', 'straight', 'relaxed', 'slim fit', 'skinny fit',
            'wide leg', 'jambes larges', 'palazzo', 'palazzos', 'flare', 'bootcut', 'carrot', 'tapered', 'tapered fit',
            'crop top', 'crop', 'cropped', 'court', 'brassière', 'bra', 'sports bra', 'sans manches', 'manches courtes',
            'manches longues', 'manches trois-quarts', 'volants', 'plissés', 'drapé', 'asymétrique', 'asymétrie',
            
            // MATIÈRES INNOVANTES
            'techno', 'technologique', 'performance', 'breathable', 'respirant', 'waterproof', 'imperméable',
            'stretch', 'élastique', 'flexible', 'lightweight', 'léger', 'quick dry', 'séchage rapide',
            'antibactérien', 'uv protection', 'thermorégulateur', 'isolant', 'reversible', 'deux faces',
            
            // ACCESSOIRES MODERNES
            'fanny pack', 'banane', 'belt bag', 'crossbody', 'bandoulière', 'mini sac', 'micro sac',
            'bucket hat', 'casquette à visière', 'beanie', 'bonnet', 'scrunchie', 'bandana', 'headband',
            'mask', 'masque', 'face mask', 'gants tactiles', 'airpods', 'écouteurs', 'tech accessories',
            
            // CHAUSSURES MODERNES
            'chunky', 'chunky sneakers', 'plateforme', 'platform', 'retro', 'vintage style', 'old school',
            'minimaliste', 'minimalist', 'scandinave', 'nordique', 'japonais', 'zen', 'wabi sabi',
            'industrial', 'brutaliste', 'concret', 'métal', 'acier', 'chrome', 'futuriste', 'futuristic'
        ],
        
        // OCCASIONS ET SAISONS
        occasions_saisons: [
            'été', 'printemps', 'automne', 'hiver', 'saison', 'saisonnier', 'collection', 'capsule', 'limitée', 'exclusive',
            'soirée', 'cocktail', 'cérémonie', 'mariage', 'baptême', 'fête', 'réveillon', 'nouvel an', 'noël', 'pâques',
            'travail', 'bureau', 'affaires', 'réunion', 'conférence', 'entretien', 'professionnel', 'corporate',
            'vacances', 'voyage', 'plage', 'piscine', 'montagne', 'randonnée', 'ski', 'sport', 'fitness', 'yoga',
            'quotidien', 'tous les jours', 'week-end', 'détente', 'loisir', 'sortie', 'ville', 'campagne', 'mer', 'montagne'
        ]
    };
    
    // Aplatir toutes les listes en une seule liste complète
    const tousLesArticlesMode = Object.values(articlesModeComplets).flat();
    
    console.log('📋 Base de données articles de mode chargée:', tousLesArticlesMode.length, 'mots');
    console.log('🔍 Recherche de mot de mode dans:', titreMinuscule);
    
    // Validation améliorée avec la base complète
    const contientArticleMode = tousLesArticlesMode.some(mot => {
        const motMinuscule = mot.toLowerCase();
        return titreMinuscule.includes(motMinuscule);
    });
    
    // Trouver les mots de mode détectés pour le debug
    const motsModeDetectes = tousLesArticlesMode.filter(mot => {
        const motMinuscule = mot.toLowerCase();
        return titreMinuscule.includes(motMinuscule);
    });
    
    console.log('🎯 Mots de mode détectés:', motsModeDetectes);
    
    if (!contientArticleMode) {
        console.log('❌ Aucun article de mode reconnu dans:', titreMinuscule);
        alert(`❌ ARTICLE NON RECONNU COMME ARTICLE DE MODE !\n\nVotre titre doit contenir un article de mode reconnu.\n\nExemples valides :\n• Vêtements: robe, t-shirt, jean, pull...\n• Chaussures: baskets, bottes, sandales...\n• Accessoires: sac, bijoux, ceinture...\n• Maroquinerie: cuir, portefeuille...\n\nBase de données: ${tousLesArticlesMode.length} articles de mode référencés`);
        return;
    }
    
    console.log('✅ Article de mode validé:', motsModeDetectes.join(', '));
    
    // ÉTAPE 6: Création du produit
    console.log('🔍 ÉTAPE 6: Création du produit');
    try {
        const maxId = Math.max(...filteredProducts.map(p => parseInt(p._id) || 0), 0);
        const newId = String(maxId + 1);
        
        // Récupérer la description du formulaire
        const descriptionElement = document.getElementById('description');
        const description = descriptionElement ? descriptionElement.value : "Article publié depuis Vinted Clone";
        
        // Récupérer la taille du formulaire
        const sizeElement = document.getElementById('size');
        const size = sizeElement ? sizeElement.value : "M";
        
        console.log('📏 Taille récupérée:', size);
        
        const newProduct = {
            _id: newId,
            title: title,
            brand: brand,
            price: price,
            originalPrice: null,
            size: size,
            condition: condition,
            category: category,
            description: description,
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
            ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
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

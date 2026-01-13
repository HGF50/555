# Vinted Clone - Site Mobile 100%

Un clone de Vinted optimisé pour mobile avec une interface moderne et responsive.

## 🚀 Fonctionnalités

### ✅ Implémentées
- **Interface Mobile-First** : Design optimisé pour les appareils mobiles
- **Grille de produits** : Affichage en grille responsive (2 colonnes sur mobile)
- **Recherche** : Barre de recherche avec suggestions
- **Filtres avancés** : Prix, taille, état, catégories
- **Tri** : Pertinence, prix croissant/décroissant, plus récents, plus populaires
- **Catégories** : Femmes, Hommes, Enfants, Accessoires, Chaussures, Sacs
- **Favoris** : Ajouter/retirer des articles des favoris
- **Navigation mobile** : Bottom navigation avec 5 onglets
- **Scroll infini** : Chargement automatique des produits
- **Animations** : Transitions fluides et micro-interactions
- **Images optimisées** : Lazy loading pour les performances

### 🔄 En cours
- Pages de détail produit
- Profil utilisateur
- Panier et processus d'achat

## 📱 Structure du projet

```
999/
├── index.html          # Page principale
├── styles.css          # Styles CSS avec design mobile-first
├── script.js           # Logique JavaScript
└── README.md          # Documentation
```

## 🎨 Caractéristiques techniques

### Mobile-First Design
- Viewport optimisé : `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- Grid responsive : 2 colonnes (mobile) → 3 (tablet) → 4 (desktop)
- Bottom navigation fixe pour mobile
- Touch-friendly buttons et interactions

### Performance
- Lazy loading des images
- CSS optimisé avec animations hardware-accelerated
- JavaScript vanilla (pas de framework lourd)
- Images compressées avec placeholder

### UX/UI
- Design moderne inspiré de Vinted
- Couleurs : Vert principal (#00b894), gris clair background
- Typographie : Inter font family
- Animations subtiles et transitions fluides
- Messages toast pour les retours utilisateur

## 🛠️ Technologies utilisées

- **HTML5** : Sémantique moderne
- **CSS3** : Grid, Flexbox, animations, variables CSS
- **JavaScript ES6+** : Fonctions fléchées, destructuring, async/await
- **Font Awesome** : Icônes
- **Google Fonts** : Inter typography

## 📋 Fonctionnalités détaillées

### Header
- Logo Vinted avec icône
- Boutons : recherche, favoris, panier avec compteur
- Barre de recherche cachée/toggle
- Navigation par catégories horizontale scrollable

### Filtres
- Panneau latéral sur mobile
- Prix : min/max
- Tailles : XS, S, M, L, XL, XXL
- État : Neuf, Comme neuf, Bon état, Acceptable
- Tri : Pertinence, prix, nouveauté, popularité

### Grille produits
- Cartes avec image, titre, marque, prix
- Badge favoris
- Information vendeur avec rating
- Taille et condition
- Prix original barré si promotion

### Navigation mobile
- Accueil, Catégories, Vendre (prominent), Favoris, Profil
- Fixed bottom navigation
- Active states et hover effects

## 🚀 Lancement

1. Clonez ou téléchargez le projet
2. Ouvrez `index.html` dans un navigateur moderne
3. Testez sur mobile avec Chrome DevTools (Device Mode)

## 📱 Test mobile

Pour tester l'expérience mobile :
1. Ouvrez Chrome DevTools (F12)
2. Cliquez sur l'icône "Toggle device toolbar"
3. Sélectionnez un appareil mobile (iPhone 12, Galaxy S20, etc.)
4. Testez les interactions tactiles

## 🔧 Personnalisation

### Couleurs
Modifiez les variables CSS principales :
```css
:root {
    --primary-color: #00b894;
    --secondary-color: #ff6b6b;
    --background-color: #f8f9fa;
    --text-color: #212529;
}
```

### Produits
Éditez le tableau `products` dans `script.js` pour ajouter vos propres articles.

### Catégories
Ajoutez de nouvelles catégories dans le HTML et mettez à jour le JavaScript.

## 🌟 Points forts

- **Performance** : Chargement rapide, optimisé mobile
- **UX** : Navigation intuitive, gestures support
- **Design** : Moderne, épuré, inspiré Vinted
- **Responsive** : Parfait sur tous les appareils
- **Accessible** : Sémantique HTML, contrast respecté

## 📈 Prochaines améliorations

- [ ] Page détail produit avec galerie d'images
- [ ] Système de panier fonctionnel
- [ ] Profil utilisateur avec historique
- [ ] Formulaire de vente d'articles
- [ ] Système de messagerie
- [ ] Notifications push
- [ ] Mode offline avec Service Worker
- [ ] PWA capabilities

## 🤝 Contribution

Ce projet est un démonstrateur. N'hésitez pas à fork et améliorer les fonctionnalités !

## 📄 Licence

Projet éducatif - libre d'utilisation pour apprendre et s'inspirer.

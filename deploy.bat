@echo off
chcp 65001 >nul
title Vinted Clone - Déploiement Automatique

echo.
echo 🚀 VINTED CLONE - DÉPLOIEMENT AUTOMATIQUE
echo ==========================================
echo.
echo Choisissez votre méthode de déploiement :
echo.
echo 1️⃣  Netlify (Le plus rapide - Gratuit)
echo 2️⃣  GitHub Pages (Le plus professionnel - Gratuit)
echo 3️⃣  Vercel (Le plus avancé - Gratuit)
echo 4️⃣  Firebase Hosting (Google - Gratuit)
echo 5️⃣  Instructions manuelles
echo.
set /p choice="Votre choix (1-5): "

if "%choice%"=="1" goto netlify
if "%choice%"=="2" goto github
if "%choice%"=="3" goto vercel
if "%choice%"=="4" goto firebase
if "%choice%"=="5" goto manual
goto invalid

:netlify
echo.
echo 🌐 DÉPLOIEMENT NETLIFY
echo =====================
echo.
echo 1. Allez sur https://netlify.com
echo 2. Créez un compte gratuit
echo 3. Glissez-déposez tout le dossier courant sur la page
echo 4. Votre site sera instantanément en ligne !
echo.
echo 🔗 Lien direct : https://netlify.com
echo.
echo ⏱️  Temps estimé : 2 minutes
echo.
echo 🌐 Ouverture du site Netlify...
start https://netlify.com
goto end

:github
echo.
echo 🐙 DÉPLOIEMENT GITHUB PAGES
echo ==============================
echo.
echo 1. Créez un compte GitHub : https://github.com
echo 2. Créez un nouveau dépôt nommé 'vinted-clone'
echo 3. Exécutez les commandes suivantes :
echo.
echo    git init
echo    git add .
echo    git commit -m "Initial commit"
echo    git branch -M main
echo    git remote add origin https://github.com/VOTRE-USERNAME/vinted-clone.git
echo    git push -u origin main
echo.
echo 4. Allez dans Settings → Pages de votre dépôt
echo 5. Activez GitHub Pages avec la branche 'main'
echo 6. Votre site sera disponible à : https://VOTRE-USERNAME.github.io/vinted-clone
echo.
echo ⏱️  Temps estimé : 5 minutes
echo.
echo 🌐 Ouverture de GitHub...
start https://github.com
goto end

:vercel
echo.
echo ▲ DÉPLOIEMENT VERCEL
echo ====================
echo.
echo 1. Allez sur https://vercel.com
echo 2. Connectez-vous avec votre compte GitHub
echo 3. Importez votre projet GitHub
echo 4. Vercel détectera automatiquement votre projet
echo 5. Cliquez sur 'Deploy'
echo.
echo 🔗 Lien direct : https://vercel.com
echo.
echo ⏱️  Temps estimé : 3 minutes
echo.
echo 🌐 Ouverture de Vercel...
start https://vercel.com
goto end

:firebase
echo.
echo 🔥 DÉPLOIEMENT FIREBASE HOSTING
echo ===============================
echo.
echo 1. Allez sur https://console.firebase.google.com
echo 2. Créez un nouveau projet
echo 3. Activez Firebase Hosting
echo 4. Installez Firebase CLI :
echo    npm install -g firebase-tools
echo.
echo 5. Initialisez le projet :
echo    firebase init
echo.
echo 6. Déployez :
echo    firebase deploy
echo.
echo ⏱️  Temps estimé : 10 minutes
echo.
echo 🌐 Ouverture de Firebase Console...
start https://console.firebase.google.com
goto end

:manual
echo.
echo 📖 INSTRUCTIONS MANUELLES
echo ======================
echo.
echo 📁 ÉTAPE 1 : Préparation des fichiers
echo    - Assurez-vous que tous les fichiers sont dans le même dossier
echo    - Vérifiez que index.html est bien à la racine
echo.
echo 🌐 ÉTAPE 2 : Choix de l'hébergeur
echo    - Netlify : Glisser-déposer (le plus simple)
echo    - GitHub Pages : Professionnel et gratuit
echo    - Vercel : Moderne avec CI/CD
echo    - Firebase : Google et scalable
echo.
echo 🚀 ÉTAPE 3 : Déploiement
echo    - Suivez les instructions de votre plateforme choisie
echo    - Votre site sera accessible via une URL publique
echo.
echo ✅ ÉTAPE 4 : Vérification
echo    - Testez toutes les fonctionnalités
echo    - Vérifiez le responsive design
echo    - Testez l'IA Vendeur et la messagerie
goto end

:invalid
echo.
echo ❌ Choix invalide. Veuillez sélectionner 1, 2, 3, 4 ou 5.
pause
exit /b 1

:end
echo.
echo 🎉 FÉLICITATIONS ! Votre site Vinted Clone sera bientôt en ligne !
echo.
echo 📱 Fonctionnalités incluses :
echo    ✅ Design responsive mobile/desktop
echo    ✅ Messagerie avec envoi de photos
echo    ✅ IA Vendeur intelligent
echo    ✅ Publication d'articles
echo    ✅ Recherche et filtres avancés
echo    ✅ Navigation intuitive
echo.
echo 🔗 Liens utiles :
echo    📖 Documentation : README.md
echo    🌐 Netlify : https://netlify.com
echo    🐙 GitHub : https://github.com
echo    ▲ Vercel : https://vercel.com
echo    🔥 Firebase : https://console.firebase.google.com
echo.
echo 📞 Pour toute aide : Consultez le README.md
echo.
pause

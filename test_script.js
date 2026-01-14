// Test simple pour le bouton vendre
console.log('Script chargé');

function showSellForm() {
    console.log('showSellForm appelée');
    alert('Bouton Vendre cliqué!');
    
    const modal = document.getElementById('sellModal');
    if (modal) {
        console.log('Modal trouvé:', modal);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        console.error('Modal non trouvé!');
    }
}

function closeSellModal() {
    console.log('closeSellModal appelée');
    const modal = document.getElementById('sellModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Test au chargement
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé');
    
    const sellModal = document.getElementById('sellModal');
    console.log('Modal au chargement:', sellModal);
    
    const sellBtn = document.querySelector('.sell-btn');
    console.log('Bouton vendre trouvé:', sellBtn);
});

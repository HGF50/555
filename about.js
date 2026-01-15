// Script pour la page À propos
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 PAGE À PROPOS CHARGÉE');
    
    updateCartCount();
    
    // Animation des statistiques au scroll
    animateStatsOnScroll();
    
    // Animation des éléments au scroll
    animateElementsOnScroll();
});

// Mettre à jour le compteur du panier
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        try {
            const cart = JSON.parse(localStorage.getItem('vinted_cart') || '[]');
            cartCount.textContent = cart.length;
        } catch (error) {
            cartCount.textContent = '0';
        }
    }
}

// Animer les statistiques quand elles deviennent visibles
function animateStatsOnScroll() {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
}

// Animer un nombre
function animateNumber(element) {
    const finalValue = element.textContent;
    const isPercentage = finalValue.includes('/');
    const isPlus = finalValue.includes('+');
    
    let numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
    let currentValue = 0;
    const increment = numericValue / 50;
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
            currentValue = numericValue;
            clearInterval(timer);
        }
        
        let displayValue = Math.floor(currentValue);
        if (isPercentage) {
            displayValue = displayValue + '/5';
        } else if (isPlus) {
            displayValue = displayValue + '+';
        }
        
        element.textContent = displayValue;
    }, 30);
}

// Animer les éléments au scroll
function animateElementsOnScroll() {
    const elements = document.querySelectorAll('.about-section, .feature-item, .team-member, .contact-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Effet de parallaxe sur le header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.about-header');
    if (header) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        header.style.transform = `translateY(${parallax}px)`;
    }
});

// Animation des feature items au hover
document.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-4px) scale(1)';
    });
});

// Animation des team members au hover
document.querySelectorAll('.team-member').forEach(member => {
    member.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) rotateY(5deg)';
    });
    
    member.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-4px) rotateY(0deg)';
    });
});

// Animation des contact items au hover
document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        this.style.color = 'white';
        
        const icon = this.querySelector('i');
        if (icon) {
            icon.style.color = 'white';
        }
        
        const h4 = this.querySelector('h4');
        if (h4) {
            h4.style.color = 'white';
        }
        
        const p = this.querySelector('p');
        if (p) {
            p.style.color = 'rgba(255, 255, 255, 0.9)';
        }
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.background = 'white';
        this.style.color = 'inherit';
        
        const icon = this.querySelector('i');
        if (icon) {
            icon.style.color = '#667eea';
        }
        
        const h4 = this.querySelector('h4');
        if (h4) {
            h4.style.color = '#2c3e50';
        }
        
        const p = this.querySelector('p');
        if (p) {
            p.style.color = '#7f8c8d';
        }
    });
});

// Navigation fluide vers les sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Bouton retour en haut
const createBackToTop = () => {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'back-to-top';
    button.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(button);
    
    // Afficher/masquer le bouton au scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.style.opacity = '1';
            button.style.visibility = 'visible';
        } else {
            button.style.opacity = '0';
            button.style.visibility = 'hidden';
        }
    });
};

// Initialiser le bouton retour en haut
createBackToTop();

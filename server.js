const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://yourdomain.com'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Base de données en mémoire (temporaire)
let products = [
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
        description: "Jean slim fit noir, parfait pour toutes occasions.",
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '3',
        title: "Sac à main en cuir",
        brand: "Mango",
        price: 45.00,
        originalPrice: 89.99,
        size: "Unique",
        condition: "Neuf",
        category: "accessories",
        image: "https://picsum.photos/seed/sac1/300/400",
        seller: {
            name: "Sophie",
            rating: 4.7,
            avatar: "https://picsum.photos/seed/sophie/50/50"
        },
        likes: 32,
        description: "Magnifique sac à main en cuir véritable, jamais utilisé.",
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

let nextId = 4;

// Routes API
// GET tous les produits
app.get('/api/products', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            category, 
            minPrice, 
            maxPrice, 
            size, 
            condition, 
            sort = 'relevant',
            search 
        } = req.query;

        let filteredProducts = products.filter(p => p.status === 'available');

        // Filtres
        if (category && category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }
        
        if (minPrice || maxPrice) {
            const min = parseFloat(minPrice) || 0;
            const max = parseFloat(maxPrice) || Infinity;
            filteredProducts = filteredProducts.filter(p => p.price >= min && p.price <= max);
        }
        
        if (size) {
            filteredProducts = filteredProducts.filter(p => p.size === size);
        }
        
        if (condition) {
            filteredProducts = filteredProducts.filter(p => 
                p.condition.toLowerCase() === condition.toLowerCase()
            );
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.title.toLowerCase().includes(searchLower) ||
                p.brand.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        // Tri
        let sortedProducts = [...filteredProducts];
        switch(sort) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'popular':
                sortedProducts.sort((a, b) => b.likes - a.likes);
                break;
            default: // relevant
                sortedProducts.sort((a, b) => b.likes - a.likes);
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

        const total = sortedProducts.length;

        res.json({
            products: paginatedProducts,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Erreur GET /api/products:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET un produit par ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = products.find(p => p._id === req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        // Incrémenter les vues
        product.views = (product.views || 0) + 1;
        
        res.json(product);
    } catch (error) {
        console.error('Erreur GET /api/products/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST créer un produit
app.post('/api/products', async (req, res) => {
    try {
        const productData = {
            _id: nextId.toString(),
            ...req.body,
            status: 'available',
            createdAt: new Date(),
            updatedAt: new Date(),
            likes: 0,
            views: 0
        };
        
        products.push(productData);
        nextId++;
        
        console.log('Produit créé:', productData);
        res.status(201).json(productData);
    } catch (error) {
        console.error('Erreur POST /api/products:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT mettre à jour un produit
app.put('/api/products/:id', async (req, res) => {
    try {
        const index = products.findIndex(p => p._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        products[index] = {
            ...products[index],
            ...req.body,
            updatedAt: new Date()
        };
        
        res.json(products[index]);
    } catch (error) {
        console.error('Erreur PUT /api/products/:id:', error);
        res.status(400).json({ error: error.message });
    }
});

// DELETE supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        const index = products.findIndex(p => p._id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        products.splice(index, 1);
        res.json({ message: 'Produit supprimé' });
    } catch (error) {
        console.error('Erreur DELETE /api/products/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST like/unlike un produit
app.post('/api/products/:id/like', async (req, res) => {
    try {
        const product = products.find(p => p._id === req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        const userId = req.body.userId || 'demo-user';
        const isLiked = product.likedBy && product.likedBy.includes(userId);
        
        if (!product.likedBy) {
            product.likedBy = [];
        }
        
        if (isLiked) {
            product.likedBy = product.likedBy.filter(id => id !== userId);
            product.likes = Math.max(0, product.likes - 1);
        } else {
            product.likedBy.push(userId);
            product.likes = (product.likes || 0) + 1;
        }
        
        product.updatedAt = new Date();
        
        res.json({ 
            liked: !isLiked, 
            likes: product.likes 
        });
    } catch (error) {
        console.error('Erreur POST /api/products/:id/like:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET catégories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = [...new Set(products.map(p => p.category))];
        res.json(categories);
    } catch (error) {
        console.error('Erreur GET /api/categories:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET statistiques
app.get('/api/stats', async (req, res) => {
    try {
        const stats = {
            availableProducts: products.filter(p => p.status === 'available').length,
            soldProducts: products.filter(p => p.status === 'sold').length,
            totalProducts: products.length,
            totalUsers: 1 // Simulation
        };

        res.json(stats);
    } catch (error) {
        console.error('Erreur GET /api/stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour servir l'application frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Erreur middleware:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log('Base de données: Mode mémoire (temporaire)');
});

module.exports = app;

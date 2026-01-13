const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
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

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vinted-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion MongoDB:', err));

// Schémas Mongoose
const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    size: { type: String, required: true },
    condition: { 
        type: String, 
        enum: ['Neuf', 'Comme neuf', 'Bon état', 'Acceptable'],
        required: true 
    },
    category: { 
        type: String, 
        enum: ['women', 'men', 'kids', 'accessories', 'shoes', 'bags'],
        required: true 
    },
    image: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, trim: true },
    seller: { 
        name: { type: String, required: true },
        rating: { type: Number, min: 0, max: 5, default: 0 },
        avatar: { type: String }
    },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['available', 'sold', 'reserved'],
        default: 'available' 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: { type: String },
    phone: { type: String },
    location: {
        city: { type: String },
        country: { type: String }
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);

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

        const query = { status: 'available' };

        // Filtres
        if (category && category !== 'all') query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (size) query.size = size;
        if (condition) query.condition = condition;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Tri
        let sortOptions = {};
        switch (sort) {
            case 'price-low':
                sortOptions.price = 1;
                break;
            case 'price-high':
                sortOptions.price = -1;
                break;
            case 'newest':
                sortOptions.createdAt = -1;
                break;
            case 'popular':
                sortOptions.likes = -1;
                break;
            default:
                sortOptions.likes = -1;
        }

        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET un produit par ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        
        // Incrémenter les vues
        product.views += 1;
        await product.save();
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST créer un produit
app.post('/api/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT mettre à jour un produit
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }
        res.json({ message: 'Produit supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST like/unlike un produit
app.post('/api/products/:id/like', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        const userId = req.body.userId; // À remplacer par l'ID utilisateur authentifié
        
        const isLiked = product.likedBy.includes(userId);
        
        if (isLiked) {
            product.likedBy.pull(userId);
            product.likes = Math.max(0, product.likes - 1);
        } else {
            product.likedBy.push(userId);
            product.likes += 1;
        }
        
        await product.save();
        res.json({ liked: !isLiked, likes: product.likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET catégories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET statistiques
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Promise.all([
            Product.countDocuments({ status: 'available' }),
            Product.countDocuments({ status: 'sold' }),
            Product.countDocuments(),
            User.countDocuments()
        ]);

        res.json({
            availableProducts: stats[0],
            soldProducts: stats[1],
            totalProducts: stats[2],
            totalUsers: stats[3]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour servir l'application frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
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
});

// Initialisation des données de démonstration
async function initializeData() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const sampleProducts = [
                {
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
                    description: "Belle robe d'été imprimée floral, portée quelques fois seulement."
                },
                {
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
                    description: "Jean slim fit noir, parfait pour toutes occasions."
                },
                {
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
                    description: "Magnifique sac à main en cuir véritable, jamais utilisé."
                }
            ];

            await Product.insertMany(sampleProducts);
            console.log('Données de démonstration insérées');
        }
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// Initialiser les données au démarrage
initializeData();

module.exports = app;

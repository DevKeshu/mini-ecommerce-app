// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply sorting
    if (sortOrder === 'lowToHigh') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'highToLow') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortOrder]);

  // Get unique categories for filter dropdown
  const categories = [...new Set(products.map(product => product.category))];

  // Cart utility functions
  const addToCart = (product) => {
    if (product.stock <= 0) return;

    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[product.id]) {
        newCart[product.id].quantity += 1;
      } else {
        newCart[product.id] = {
          ...product,
          quantity: 1
        };
      }
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[productId]) {
        newCart[productId].quantity = newQuantity;
      }
      return newCart;
    });
  };

  // Calculate cart totals
  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

  // Product Card Component
  const ProductCard = ({ product }) => {
    const isInStock = product.stock > 0;
    const cartItem = cart[product.id];

    return (
      <div className="product-card">
        <img src={product.image} alt={product.title} className="product-image" />
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-category">Category: {product.category}</p>
          <p className="product-price">${product.price}</p>
          <p className={`stock-status ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </p>
          <button
            onClick={() => addToCart(product)}
            disabled={!isInStock}
            className={`add-to-cart-btn ${!isInStock ? 'disabled' : ''}`}
          >
            {cartItem ? `Added (${cartItem.quantity})` : 'Add to Cart'}
          </button>
        </div>
      </div>
    );
  };

  // Cart Item Component
  const CartItem = ({ item }) => {
    return (
      <div className="cart-item">
        <div className="cart-item-info">
          <img src={item.image} alt={item.title} className="cart-item-image" />
          <div className="cart-item-details">
            <h4>{item.title}</h4>
            <p>${item.price}</p>
          </div>
        </div>
        <div className="cart-item-controls">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span>{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            +
          </button>
          <button onClick={() => removeFromCart(item.id)} className="remove-btn">
            Remove
          </button>
        </div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = ({ message }) => {
    return (
      <div className="empty-state">
        <p>{message}</p>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mini E-Commerce Store</h1>
      </header>

      <div className="main-content">
        <aside className="filters">
          <h2>Filters & Search</h2>
          
          <div className="filter-group">
            <label>Search by name:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
            />
          </div>

          <div className="filter-group">
            <label>Filter by category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by price:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="none">None</option>
              <option value="lowToHigh">Low → High</option>
              <option value="highToLow">High → Low</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSortOrder('none');
            }}
            className="clear-filters-btn"
          >
            Clear All Filters
          </button>
        </aside>

        <main className="product-list">
          <h2>Products ({filteredProducts.length})</h2>
          
          {filteredProducts.length === 0 ? (
            <EmptyState message="No products found" />
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

        <aside className="cart-sidebar">
          <h2>Shopping Cart</h2>
          
          {cartItems.length === 0 ? (
            <EmptyState message="Your cart is empty" />
          ) : (
            <>
              <div className="cart-summary">
                <p>Total Items: {totalItems}</p>
                <p>Total Price: ${totalPrice}</p>
              </div>
              <div className="cart-items">
                {cartItems.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
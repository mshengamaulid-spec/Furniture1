import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const apiBase = import.meta.env.VITE_API_TARGET || 'http://localhost:8000';
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
  });
  const [editProductError, setEditProductError] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState({
    quantity: 1,
    status: 'pending',
  });
  const [editOrderError, setEditOrderError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    if (currentUser) {
      setUser(currentUser);
    }
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchOrders();
      if (currentUser?.role === 'admin') {
        fetchUsers();
      } else {
        setUsers([]);
      }
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/');
      setUsers(response.data);
    } catch (error) {
      // Only admins can access this endpoint
      setUsers([]);
    }
  };

  const placeOrder = async (productId) => {
    try {
      const quantity = Number(quantities[productId] || 1);
      await axios.post('/api/orders/', { product: productId, quantity });
      alert('Order placed');
      fetchOrders();
    } catch (error) {
      alert('Error placing order');
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`/api/orders/${orderId}/`);
      alert('Order deleted');
      fetchOrders();
    } catch (error) {
      alert('Error deleting order');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`/api/products/${productId}/`);
      alert('Product deleted');
      fetchProducts();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/users/${userId}/`);
      alert('User deleted');
      fetchUsers();
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleProductChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditProductChange = (field, value) => {
    setEditProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({ ...prev, [productId]: value }));
  };

  const handleEditOrderChange = (field, value) => {
    setEditOrderForm((prev) => ({ ...prev, [field]: value }));
  };

  const createProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const { name, description, price, image } = productForm;
    if (!name.trim() || !description.trim() || !price) {
      setFormError('Name, description, and price are required.');
      return;
    }

    const payload = new FormData();
    payload.append('name', name.trim());
    payload.append('description', description.trim());
    payload.append('price', price);
    if (image) payload.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post('/api/products/', payload, { headers: authHeaders });
      setFormSuccess('Product created successfully.');
      setProductForm({ name: '', description: '', price: '', image: null });
      fetchProducts();
    } catch (error) {
      const detail = error?.response?.data;
      const message =
        typeof detail === 'string'
          ? detail
          : detail?.name?.[0] ||
            detail?.description?.[0] ||
            detail?.price?.[0] ||
            'Failed to create product.';
      setFormError(message);
    }
  };

  const startEditProduct = (product) => {
    setEditProductError('');
    setEditingProductId(product.id);
    setEditProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      image: null,
    });
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditProductError('');
    setEditProductForm({ name: '', description: '', price: '', image: null });
  };

  const updateProduct = async (productId) => {
    setEditProductError('');
    const { name, description, price, image } = editProductForm;
    if (!name.trim() || !description.trim() || !price) {
      setEditProductError('Name, description, and price are required.');
      return;
    }

    const payload = new FormData();
    payload.append('name', name.trim());
    payload.append('description', description.trim());
    payload.append('price', price);
    if (image) payload.append('image', image);

    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.patch(`/api/products/${productId}/`, payload, { headers: authHeaders });
      cancelEditProduct();
      fetchProducts();
    } catch (error) {
      const detail = error?.response?.data;
      const message =
        typeof detail === 'string'
          ? detail
          : detail?.name?.[0] ||
            detail?.description?.[0] ||
            detail?.price?.[0] ||
            'Failed to update product.';
      setEditProductError(message);
    }
  };

  const startEditOrder = (order) => {
    setEditOrderError('');
    setEditingOrderId(order.id);
    setEditOrderForm({
      quantity: order.quantity || 1,
      status: order.status || 'pending',
    });
  };

  const cancelEditOrder = () => {
    setEditingOrderId(null);
    setEditOrderError('');
    setEditOrderForm({ quantity: 1, status: 'pending' });
  };

  const updateOrder = async (orderId) => {
    setEditOrderError('');
    const payload = {
      quantity: Number(editOrderForm.quantity || 1),
    };
    if (user?.role === 'admin') {
      payload.status = editOrderForm.status;
    }

    try {
      await axios.patch(`/api/orders/${orderId}/`, payload);
      cancelEditOrder();
      fetchOrders();
    } catch (error) {
      const detail = error?.response?.data;
      const message =
        typeof detail === 'string'
          ? detail
          : detail?.quantity?.[0] ||
            detail?.status?.[0] ||
            'Failed to update order.';
      setEditOrderError(message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const resolveImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${apiBase}${url}`;
  };

  const canEditProduct = (product) => {
    if (!user?.role) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'carpenter') return product.carpenter === user.id;
    return false;
  };

  const canEditOrders = user?.role === 'admin' || user?.role === 'customer';

  return (
    <div className="dashboard-container">
      <div className="dashboard-top">
        <h1>Dashboard</h1>
        <div className="dashboard-actions">
          {user?.role && <span className="role-chip">{user.role}</span>}
          <button className="btn-outline" onClick={handleLogout}>Log out</button>
        </div>
      </div>
      <div className="dashboard-content">
        <section className="products-section">
          <div className="section-header">
            <h2>Products</h2>
          </div>
          {(user?.role === 'carpenter' || user?.role === 'admin') && (
            <form className="product-form" onSubmit={createProduct}>
              <h3>Post a new product</h3>
              {formError && <p className="form-error">{formError}</p>}
              {formSuccess && <p className="form-success">{formSuccess}</p>}
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={(e) => handleProductChange('name', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => handleProductChange('price', e.target.value)}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => handleProductChange('description', e.target.value)}
                  rows="3"
                  required
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProductChange('image', e.target.files?.[0] || null)}
                />
              </div>
              <button type="submit" className="btn-secondary">Publish Product</button>
            </form>
          )}
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                {product.image && (
                  <img
                    src={resolveImageUrl(product.image)}
                    alt={product.name}
                    className="product-image"
                  />
                )}
                <h3>{product.name}</h3>
                {product.carpenter_name && (
                  <p className="product-meta">From: {product.carpenter_name}</p>
                )}
                {editingProductId === product.id ? (
                  <div className="product-edit">
                    {editProductError && <p className="form-error">{editProductError}</p>}
                    <input
                      type="text"
                      placeholder="Product name"
                      value={editProductForm.name}
                      onChange={(e) => handleEditProductChange('name', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      value={editProductForm.price}
                      onChange={(e) => handleEditProductChange('price', e.target.value)}
                      required
                    />
                    <textarea
                      placeholder="Description"
                      value={editProductForm.description}
                      onChange={(e) => handleEditProductChange('description', e.target.value)}
                      rows="3"
                      required
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleEditProductChange('image', e.target.files?.[0] || null)}
                    />
                    <div className="edit-actions">
                      <button onClick={() => updateProduct(product.id)} className="btn-secondary">Save</button>
                      <button onClick={cancelEditProduct} className="btn-outline">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="product-description">{product.description}</p>
                    <p>${product.price}</p>
                  </>
                )}
                {user?.role === 'customer' && (
                  <div className="order-controls">
                    <input
                      type="number"
                      min="1"
                      value={quantities[product.id] || 1}
                      onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    />
                    <button onClick={() => placeOrder(product.id)} className="btn-secondary">Order</button>
                  </div>
                )}
                {(user?.role === 'admin' || user?.role === 'carpenter') && (
                  <div className="product-actions">
                    {canEditProduct(product) && (
                      <button
                        onClick={() => startEditProduct(product)}
                        className="btn-outline"
                        style={{ marginTop: '0.6rem' }}
                      >
                        Edit Product
                      </button>
                    )}
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="btn-danger"
                      style={{ marginTop: '0.6rem' }}
                    >
                      Delete Product
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="orders-section">
          <div className="section-header">
            <h2>{user?.role === 'admin' ? 'All Orders' : 'My Orders'}</h2>
          </div>
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-item">
                {editingOrderId === order.id ? (
                  <div className="order-edit">
                    {editOrderError && <p className="form-error">{editOrderError}</p>}
                    <p>{order.product_name}</p>
                    <input
                      type="number"
                      min="1"
                      value={editOrderForm.quantity}
                      onChange={(e) => handleEditOrderChange('quantity', e.target.value)}
                    />
                    {user?.role === 'admin' && (
                      <select
                        value={editOrderForm.status}
                        onChange={(e) => handleEditOrderChange('status', e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                    <div className="edit-actions">
                      <button onClick={() => updateOrder(order.id)} className="btn-secondary">Save</button>
                      <button onClick={cancelEditOrder} className="btn-outline">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{order.product_name} - Quantity: {order.quantity} - Status: {order.status}</p>
                    <div className="order-actions">
                      {canEditOrders && (
                        <button onClick={() => startEditOrder(order)} className="btn-outline">Edit</button>
                      )}
                      <button onClick={() => deleteOrder(order.id)} className="btn-danger">Delete Order</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {user?.role === 'admin' && (
            <div className="admin-users">
              <h3>Users</h3>
              <div className="users-list">
                {users.map((u) => (
                  <div key={u.id} className="user-row">
                    <span>{u.username}</span>
                    <span>{u.email || 'No email'}</span>
                    <span className="role-pill">{u.role}</span>
                    <button onClick={() => deleteUser(u.id)} className="btn-danger">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

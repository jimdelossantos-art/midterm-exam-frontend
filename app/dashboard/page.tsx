"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { CONFIG } from "@/lib/config";
import { clearTokens, isAuthenticated } from "@/lib/auth";

interface Client {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"clients" | "products">("clients");

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientError, setClientError] = useState("");
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", address: "" });

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "" });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(CONFIG.ROUTES.LOGIN);
      return;
    }
    fetchClients();
    fetchProducts();
  }, [router]);

  const getId = (item: { _id?: string; id?: string }) => item._id || item.id || "";

  // CLIENTS CRUD
  const fetchClients = async () => {
    setLoadingClients(true);
    setClientError("");
    try {
      const res = await apiClient<any>(CONFIG.ENDPOINTS.CLIENTS, { method: "GET", requiresAuth: true });
      setClients(Array.isArray(res) ? res : res.data || res.clients || []);
    } catch (err: any) {
      setClientError(err.message || "Failed to load clients.");
    } finally {
      setLoadingClients(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient(CONFIG.ENDPOINTS.CLIENTS, { method: "POST", requiresAuth: true, body: JSON.stringify(clientForm) });
      setClientForm({ name: "", email: "", phone: "", address: "" });
      setShowCreateClient(false);
      fetchClients();
    } catch (err: any) {
      alert(err.message || "Failed to create client.");
    }
  };

  const handleReadClient = async (id: string) => {
    try {
      const res = await apiClient<any>(`${CONFIG.ENDPOINTS.CLIENTS}/${id}`, { method: "GET", requiresAuth: true });
      setSelectedClient(res.data || res.client || res);
      setEditingClient(null);
      setShowCreateClient(false);
    } catch (err: any) {
      alert(err.message || "Failed to fetch client.");
    }
  };

  const handleOpenEditClient = (c: Client) => {
    setEditingClient(c);
    setClientForm({ name: c.name || "", email: c.email || "", phone: c.phone || "", address: c.address || "" });
    setSelectedClient(null);
    setShowCreateClient(false);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      await apiClient(`${CONFIG.ENDPOINTS.CLIENTS}/${getId(editingClient)}`, {
        method: "PUT",
        requiresAuth: true,
        body: JSON.stringify(clientForm),
      });
      setEditingClient(null);
      setClientForm({ name: "", email: "", phone: "", address: "" });
      fetchClients();
    } catch (err: any) {
      alert(err.message || "Failed to update client.");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm(`Are you sure you want to delete Client #${id}?`)) return;
    try {
      await apiClient(`${CONFIG.ENDPOINTS.CLIENTS}/${id}`, { method: "DELETE", requiresAuth: true });
      if (selectedClient && getId(selectedClient) === id) setSelectedClient(null);
      fetchClients();
    } catch (err: any) {
      alert(err.message || "Failed to delete client.");
    }
  };

  // PRODUCTS CRUD
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError("");
    try {
      const res = await apiClient<any>(CONFIG.ENDPOINTS.PRODUCTS, { method: "GET", requiresAuth: true });
      setProducts(Array.isArray(res) ? res : res.data || res.products || []);
    } catch (err: any) {
      setProductError(err.message || "Failed to load products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient(CONFIG.ENDPOINTS.PRODUCTS, {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({ ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) }),
      });
      setProductForm({ name: "", description: "", price: "", stock: "" });
      setShowCreateProduct(false);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to create product.");
    }
  };

  const handleReadProduct = async (id: string) => {
    try {
      const res = await apiClient<any>(`${CONFIG.ENDPOINTS.PRODUCTS}/${id}`, { method: "GET", requiresAuth: true });
      setSelectedProduct(res.data || res.product || res);
      setEditingProduct(null);
      setShowCreateProduct(false);
    } catch (err: any) {
      alert(err.message || "Failed to fetch product.");
    }
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({ name: p.name || "", description: p.description || "", price: String(p.price ?? ""), stock: String(p.stock ?? "") });
    setSelectedProduct(null);
    setShowCreateProduct(false);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await apiClient(`${CONFIG.ENDPOINTS.PRODUCTS}/${getId(editingProduct)}`, {
        method: "PUT",
        requiresAuth: true,
        body: JSON.stringify({ ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) }),
      });
      setEditingProduct(null);
      setProductForm({ name: "", description: "", price: "", stock: "" });
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to update product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(`Are you sure you want to delete Product #${id}?`)) return;
    try {
      await apiClient(`${CONFIG.ENDPOINTS.PRODUCTS}/${id}`, { method: "DELETE", requiresAuth: true });
      if (selectedProduct && getId(selectedProduct) === id) setSelectedProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  const handleLogout = () => {
    clearTokens();
    router.push(CONFIG.ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500">Manage clients and products inventory</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200">
            Logout
          </button>
        </div>

        <div className="flex gap-2 border-b border-zinc-200 pb-3">
          <button
            onClick={() => setActiveTab("clients")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "clients" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"}`}
          >
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === "products" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"}`}
          >
            Products ({products.length})
          </button>
        </div>

        {activeTab === "clients" && (
          <div className="space-y-6">
            {(showCreateClient || editingClient) && (
              <div className="border border-zinc-200 rounded-lg p-6 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {editingClient ? `Update Client #${getId(editingClient).slice(-6)}` : "Create New Client"}
                  </h2>
                  <button onClick={() => { setShowCreateClient(false); setEditingClient(null); }} className="text-zinc-400 hover:text-zinc-700">✕</button>
                </div>
                <form onSubmit={editingClient ? handleUpdateClient : handleCreateClient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" required placeholder="Client Name" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                    <input type="email" required placeholder="Email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                    <input type="text" required placeholder="Phone" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                    <input type="text" placeholder="Address" value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowCreateClient(false); setEditingClient(null); }} className="px-4 py-2 text-sm border border-zinc-300 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md">{editingClient ? "Save Changes" : "Create Client"}</button>
                  </div>
                </form>
              </div>
            )}

            {selectedClient && (
              <div className="border border-zinc-200 rounded-lg p-6 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Client Details (#{getId(selectedClient).slice(-6)})</h2>
                    <p className="text-xs text-zinc-500">Fetched directly from GET /clients/{getId(selectedClient)}</p>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="text-zinc-400 hover:text-zinc-700">✕</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs text-zinc-500">Name</p><p className="font-medium">{selectedClient.name}</p></div>
                  <div><p className="text-xs text-zinc-500">Email</p><p className="font-medium">{selectedClient.email}</p></div>
                  <div><p className="text-xs text-zinc-500">Phone</p><p className="font-medium">{selectedClient.phone}</p></div>
                  <div><p className="text-xs text-zinc-500">Address</p><p className="font-medium">{selectedClient.address || "N/A"}</p></div>
                </div>
              </div>
            )}

            <div className="border border-zinc-200 rounded-lg p-6 shadow-sm bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Clients</h2>
                  <p className="text-xs text-zinc-500">A list of all clients stored in the backend.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchClients} className="px-3 py-2 text-sm font-medium border border-zinc-300 rounded-md hover:bg-zinc-50">↻ Read / Refresh</button>
                  <button onClick={() => { setClientForm({ name: "", email: "", phone: "", address: "" }); setShowCreateClient(true); setEditingClient(null); setSelectedClient(null); }} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800">+ Create Client</button>
                </div>
              </div>
              {clientError && <p className="text-sm text-red-600 mb-4">{clientError}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 text-xs">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Name</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Phone</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingClients ? (
                      <tr><td colSpan={5} className="py-6 text-center text-zinc-500">Loading clients...</td></tr>
                    ) : clients.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-zinc-500">No clients found.</td></tr>
                    ) : (
                      clients.map((c, idx) => {
                        const id = getId(c);
                        return (
                          <tr key={id || idx} className="border-b border-zinc-100 hover:bg-zinc-50">
                            <td className="py-3 px-2 font-mono text-xs text-zinc-500">{id.slice(-6) || idx + 1}</td>
                            <td className="py-3 px-2 font-medium">{c.name}</td>
                            <td className="py-3 px-2">{c.email}</td>
                            <td className="py-3 px-2">{c.phone}</td>
                            <td className="py-3 px-2 text-right space-x-2">
                              <button onClick={() => handleReadClient(id)} className="px-2.5 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100">👁 Read</button>
                              <button onClick={() => handleOpenEditClient(c)} className="px-2.5 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100">✎ Update</button>
                              <button onClick={() => handleDeleteClient(id)} className="px-2.5 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100">🗑 Delete</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            {(showCreateProduct || editingProduct) && (
              <div className="border border-zinc-200 rounded-lg p-6 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    {editingProduct ? `Update Product #${getId(editingProduct).slice(-6)}` : "Create New Product"}
                  </h2>
                  <button onClick={() => { setShowCreateProduct(false); setEditingProduct(null); }} className="text-zinc-400 hover:text-zinc-700">✕</button>
                </div>
                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" required placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                    <input type="text" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                    <input type="number" step="0.01" required placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                    <input type="number" required placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="px-3 py-2 text-sm border border-zinc-300 rounded-md" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setShowCreateProduct(false); setEditingProduct(null); }} className="px-4 py-2 text-sm border border-zinc-300 rounded-md">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md">{editingProduct ? "Save Changes" : "Create Product"}</button>
                  </div>
                </form>
              </div>
            )}

            {selectedProduct && (
              <div className="border border-zinc-200 rounded-lg p-6 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Product Details (#{getId(selectedProduct).slice(-6)})</h2>
                    <p className="text-xs text-zinc-500">Fetched directly from GET /products/{getId(selectedProduct)}</p>
                  </div>
                  <button onClick={() => setSelectedProduct(null)} className="text-zinc-400 hover:text-zinc-700">✕</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs text-zinc-500">Product Name</p><p className="font-medium">{selectedProduct.name}</p></div>
                  <div><p className="text-xs text-zinc-500">Description</p><p className="font-medium">{selectedProduct.description || "N/A"}</p></div>
                  <div><p className="text-xs text-zinc-500">Price</p><p className="font-medium">₱{selectedProduct.price}</p></div>
                  <div><p className="text-xs text-zinc-500">Stock</p><p className="font-medium">{selectedProduct.stock}</p></div>
                </div>
              </div>
            )}

            <div className="border border-zinc-200 rounded-lg p-6 shadow-sm bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Products</h2>
                  <p className="text-xs text-zinc-500">A list of all products stored in the backend.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchProducts} className="px-3 py-2 text-sm font-medium border border-zinc-300 rounded-md hover:bg-zinc-50">↻ Read / Refresh</button>
                  <button onClick={() => { setProductForm({ name: "", description: "", price: "", stock: "" }); setShowCreateProduct(true); setEditingProduct(null); setSelectedProduct(null); }} className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800">+ Create Product</button>
                </div>
              </div>
              {productError && <p className="text-sm text-red-600 mb-4">{productError}</p>}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 text-xs">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Product Name</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Stock</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProducts ? (
                      <tr><td colSpan={5} className="py-6 text-center text-zinc-500">Loading products...</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan={5} className="py-6 text-center text-zinc-500">No products found.</td></tr>
                    ) : (
                      products.map((p, idx) => {
                        const id = getId(p);
                        return (
                          <tr key={id || idx} className="border-b border-zinc-100 hover:bg-zinc-50">
                            <td className="py-3 px-2 font-mono text-xs text-zinc-500">{id.slice(-6) || idx + 1}</td>
                            <td className="py-3 px-2 font-medium">{p.name}</td>
                            <td className="py-3 px-2">₱{p.price}</td>
                            <td className="py-3 px-2">{p.stock}</td>
                            <td className="py-3 px-2 text-right space-x-2">
                              <button onClick={() => handleReadProduct(id)} className="px-2.5 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100">👁 Read</button>
                              <button onClick={() => handleOpenEditProduct(p)} className="px-2.5 py-1 text-xs border border-zinc-300 rounded hover:bg-zinc-100">✎ Update</button>
                              <button onClick={() => handleDeleteProduct(id)} className="px-2.5 py-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100">🗑 Delete</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
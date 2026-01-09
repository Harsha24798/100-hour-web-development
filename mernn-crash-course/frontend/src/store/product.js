import { create } from "zustand";

export const useProductsStore = create((set) => ({
  products: [],
  pagination: null,

  setProducts: (products) => set({ products }),

  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      return { success: false, message: "Please fill in all the fields." };
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });
    await res.json();
    // Don't manually update - let the component refetch to get updated pagination
    return {
      success: true,
      message: "Product created successfully.",
      shouldRefetch: true,
    };
  },

  fetchProducts: async (page = 1, limit = 10) => {
    const res = await fetch(`/api/products?page=${page}&limit=${limit}`);
    const data = await res.json();
    set({ products: data.data, pagination: data.pagination });
  },

  deleteProduct: async (pid) => {
    const res = await fetch(`/api/products/${pid}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    // Return flag to trigger refetch for updated pagination
    return { success: true, message: data.message, shouldRefetch: true };
  },

  updateProduct: async (pid, updatedProduct) => {
    const res = await fetch(`/api/products/${pid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    // Update the UI immediately, without needing a refetch
    set((state) => ({
      products: state.products.map((product) =>
        product._id === pid ? data.data : product
      ),
    }));
    return { success: true, message: data.message };
  },
}));

const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory storage (no database)
let products = [];
let nextId = 1;

// Helper: check that name, price, category are valid
function isValid(body) {
  const { name, price, category } = body || {};
  return (
    typeof name === "string" && name.trim() !== "" &&
    typeof price === "number" && !isNaN(price) &&
    typeof category === "string" && category.trim() !== ""
  );
}

// 1. POST /api/products - create a product
app.post("/api/products", (req, res) => {
  if (!isValid(req.body)) {
    return res.status(400).json({ message: "name, price and category are required" });
  }

  const { name, price, category } = req.body;

  const exists = products.some(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (exists) {
    return res.status(409).json({ message: "Product with this name already exists" });
  }

  const product = { id: nextId++, name: name.trim(), price, category: category.trim() };
  products.push(product);
  res.status(201).json(product);
});

// 2. GET /api/products - list all (optional filter: ?category=Electronics)
app.get("/api/products", (req, res) => {
  const { category } = req.query;

  if (category) {
    const filtered = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    return res.status(200).json(filtered);
  }

  res.status(200).json(products);
});

// 3. GET /api/products/:id - get one product
app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

// 4. PUT /api/products/:id - update a product
app.put("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (!isValid(req.body)) {
    return res.status(400).json({ message: "name, price and category are required" });
  }

  const { name, price, category } = req.body;

  const duplicate = products.some(
    (p) => p.id !== product.id && p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ message: "Product with this name already exists" });
  }

  product.name = name.trim();
  product.price = price;
  product.category = category.trim();
  res.status(200).json(product);
});

// 5. DELETE /api/products/:id - delete a product
app.delete("/api/products/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const deleted = products.splice(index, 1)[0];
  res.status(200).json({ message: "Product deleted", product: deleted });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
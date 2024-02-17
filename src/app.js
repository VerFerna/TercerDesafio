import express from "express";
import ProductManager from "./controllers/productManager.js";

const app = express();
const productManager = new ProductManager();

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome, to access the products go to the route localhost:8080/products",
  });
});

app.post("/products", async (req, res) => {
  const { title, description, price, code, stock } = req.body;
  const thumbnail = req.body.thumbnail ? req.body.thumbnail : [];

  if (!title || !description || !code || !price || !stock) {
    res.json("All fields are required");
  }

  try {
    const createProduct = await productManager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      stock
    );

    if (createProduct !== undefined) {
      res.status(201).json("Successfully created product");
    } else {
      res.status(400).json("Product already exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/products", async (req, res) => {
  const { limit } = req.query;

  try {
    const products = await productManager.getProducts();

    if (products === undefined) {
      res.status(200).json([]);
    }

    if (!limit || limit < 1) {
      res.status(200).json(products);
    } else {
      const limitedProducts = products.slice(0, limit);
      res.status(206).json(limitedProducts);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/products/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    const product = await productManager.getProductById(Number(pid));

    if (product === undefined) {
      res.status(404).json("Not found");
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(error);
  }
});

app.put("/products/:pid", async (req, res) => {
  const { pid } = req.params;
  const props = req.body;

  try {
    const updatedProduct = await productManager.updateProduct(
      Number(pid),
      props
    );

    if (updatedProduct === undefined) {
      res.status(404).json(`Product with id: ${pid} not found.`);
    } else if (updatedProduct === false) {
      res.status(404).json("Cannot update 'id' or 'code' property");
    } else {
      res.status(200).json(updatedProduct);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/products/:pid", async (req, res) => {
  const { pid } = req.params;

  try {
    const product = await productManager.deleteProduct(Number(pid));

    if (product === undefined) {
      res.status(404).json("Not found");
    } else {
      res.status(200).json(`Product with id: ${pid} was removed`);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

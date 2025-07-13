import { Router } from 'express';

const router = Router();

router.get("/data/products", (req, res) => {
  res.json(products);
});

export default router;

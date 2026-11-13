import express, { type Request, type Response } from 'express';
import type { CreateOrderRequest, RawProductFilterQuery } from '../../shared/types.ts';
import { MASTER_PRODUCTS } from '../data/products.ts';
import { orderService, OrderValidationError } from '../services/orderService.ts';
import { queryProductInventory } from '../services/productQueryService.ts';

export const apiRouter = express.Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const rawQuery: RawProductFilterQuery = {
      categories: req.query.categories as string | string[] | undefined,
      minPrice: req.query.minPrice as string | undefined,
      maxPrice: req.query.maxPrice as string | undefined,
      minRating: req.query.minRating as string | undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
    };

    const result = queryProductInventory(MASTER_PRODUCTS, rawQuery);
    res.json(result);
  } catch (error) {
    console.error('Error querying products:', error);
    res.status(500).json({ error: 'Unable to process product query.' });
  }
});

apiRouter.get('/orders', (req: Request, res: Response) => {
  try {
    const statusFilter =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const response = orderService.listOrders(statusFilter);
    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Unable to fetch orders.' });
  }
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const payload = req.body as CreateOrderRequest;
    const created = orderService.createOrder(payload, MASTER_PRODUCTS);
    res.status(201).json({ order: created });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Unable to place order at this time.' });
  }
});

apiRouter.patch('/orders/:id/cancel', (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.id);
    const updated = orderService.cancelOrder(orderId);
    res.json({ order: updated });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Unable to cancel order.' });
  }
});

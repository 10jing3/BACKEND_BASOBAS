import express from 'express';
import { test } from '../controller/user.controller.js';

const router = express.Router();

// Route with the `test` handler
router.get('/test', test);

export default router;

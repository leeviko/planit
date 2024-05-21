import express, { Request, Response, Router } from 'express';
import { auth } from '../../middleware/auth';

const router: Router = express.Router();

export interface NewBoard {
  id: string;
  userId: string;
  slug: string;
  title: string;
}

/**
 * @route  GET api/boards
 * @desc   Get all boards
 * @access Private
 */
router.get('/', auth, (req: Request, res: Response) => {
  const user = req.session.user!;
});

module.exports = router;

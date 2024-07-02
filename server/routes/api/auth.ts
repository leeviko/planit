import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { login, logout } from '../../controllers/auth';
import { validationRes } from '../../middleware/validationRes';

const router: Router = express.Router();

/**
 * @route  GET api/auth
 * @desc   Check if auth
 * @access Public
 */
router.get('/', (req: Request, res: Response) => {
  const user = req.session.user;
  if (!user) return res.status(401).json({ msg: 'Not logged in' });

  return res.json(user);
});

/**
 * @route  POST api/auth
 * @desc   Authenticate user
 * @access Public
 */
router.post(
  '/',
  [
    body('username').escape().trim().isLength({ min: 3, max: 25 }),
    body('password').escape().trim().isLength({ min: 4, max: 100 }),
  ],
  validationRes,
  async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      const result = await login({ username, password });

      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      req.session.user = result.data;
      res.json(result.data);
    } catch (err: any) {
      console.log(err);
      res.status(400).json({ msg: 'Failed to login. Please try again later.' });
    }
  }
);

/**
 * @route  DELETE api/auth/logout
 * @desc   Logout user
 * @access Public
 */
router.delete('/logout', (req: Request, res: Response) => {
  try {
    logout(req);
    res.json({ msg: 'Logged out.' });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: 'Failed to logout. Please try again later.' });
  }
});

module.exports = router;

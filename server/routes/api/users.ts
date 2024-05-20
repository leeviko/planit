import express, { Request, Response, Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { NewUser, registerUser } from '../../controllers/users';

declare module 'express-session' {
  export interface SessionData {
    user?: {
      id: string;
      username: string;
      admin: boolean;
      created_at: Date;
    };
  }
}

const router: Router = express.Router();

/**
 * @route POST api/users
 * @desc  Create new user
 * @access Public
 **/
router.post(
  '/',
  [
    body('username').escape().trim().isLength({ min: 3, max: 25 }),
    body('email').escape().trim().isEmail(),
    body('password').escape().trim().isLength({ min: 4, max: 100 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;

    const newUser: NewUser = {
      username,
      email,
      password,
    };

    try {
      const result = await registerUser(newUser);
      req.session.user = result;
      res.status(200).json(result);
    } catch (err: any) {
      res.status(err.status ?? 400).json({ msg: err.message });
    }
  }
);

module.exports = router;

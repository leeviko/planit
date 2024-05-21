import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { NewUser, UserResult, registerUser } from '../../controllers/users';
import { Error } from '../../server';
import { validationRes } from '../../middleware/validationRes';

declare module 'express-session' {
  export interface SessionData {
    user?: UserResult;
  }
}

const router: Router = express.Router();

/**
 * @route  POST api/users
 * @desc   Create new user
 * @access Public
 **/
router.post(
  '/',
  [
    body('username').escape().trim().isLength({ min: 3, max: 25 }),
    body('email').escape().trim().isEmail(),
    body('password').escape().trim().isLength({ min: 4, max: 100 }),
  ],
  validationRes,
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    const newUser: NewUser = {
      username,
      email,
      password,
    };

    try {
      const result = await registerUser(newUser);
      if (result instanceof Error) throw result;

      req.session.user = result;
      res.status(200).json(result);
    } catch (err: any) {
      if (err instanceof Error) {
        return res.status(err.status).json({ msg: err.msg });
      }
      res
        .status(400)
        .json({ msg: 'Failed to register. Please try again later.' });
    }
  }
);

module.exports = router;

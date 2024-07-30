import express, { Request, Response, Router } from 'express';
import { body, param } from 'express-validator';
import {
  NewUser,
  UserResult,
  registerUser,
  updateUser,
  deleteUser,
} from '../../controllers/users';
import { validationRes } from '../../middleware/validationRes';
import { auth } from '../../middleware/auth';

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
    body('username')
      .escape()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage('Username must be between 3 and 25 characters'),
    body('email')
      .escape()
      .trim()
      .isEmail()
      .withMessage('Invalid email address'),
    body('password')
      .escape()
      .trim()
      .isLength({ min: 4, max: 100 })
      .withMessage('Password must be at least 4 characters long'),
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
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      req.session.user = result.data;
      res.json(result.data);
    } catch (err: any) {
      res
        .status(400)
        .json({ msg: 'Failed to register. Please try again later.' });
    }
  }
);

/**
 * @route  PUT api/users/:userId
 * @desc   Update user
 * @access Private
 **/
router.put(
  '/:user_id',
  [
    param('user_id').escape().trim().notEmpty(),
    body('username')
      .escape()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage('Username must be between 3 and 25 characters'),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const userId = req.params.user_id;
    const { username } = req.body;

    try {
      const result = await updateUser(user, userId, username);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      req.session.user!.username = username;

      res.json(result.data);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to update user. Please try again later.' });
    }
  }
);

/**
 * @route  DELETE api/users/:userId
 * @desc   Delete user
 * @access Private
 **/
router.delete(
  '/:user_id',
  [param('user_id').escape().trim().notEmpty()],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const userId = req.params.user_id;

    try {
      const result = await deleteUser(user, userId);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }
      });

      res.json(result);
    } catch (err) {
      console.log(err);
      res.status(400).json({ msg: 'Failed to delete user. Please try again.' });
    }
  }
);

module.exports = router;

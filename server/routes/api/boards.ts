import express, { Request, Response, Router } from 'express';
import { auth } from '../../middleware/auth';
import { body, param, validationResult } from 'express-validator';
import { createBoard, updateBoard } from '../../controllers/boards';
import { Error } from '../../server';

const router: Router = express.Router();

export interface NewBoard {
  id: string;
  userId: string;
  slug: string;
  title: string;
}

export type BoardUpdate = {
  [key: string]: string | boolean | undefined;
  title?: string;
  favorited?: boolean;
};

/**
 * @route  GET api/boards
 * @desc   Get all boards
 * @access Private
 */
router.get('/', auth, (req: Request, res: Response) => {
  const user = req.session.user!;
  res.json(user);
});

/**
 * @route  POST api/boards
 * @desc   Create new board
 * @access Private
 */
router.post(
  '/',
  [body('title').escape().trim().isLength({ min: 3, max: 45 })],
  auth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const user = req.session.user!;
    const { title } = req.body;

    try {
      const result = await createBoard(user, title);
      if (result instanceof Error) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to create board. Please try again later.' });
    }
  }
);

/**
 * @route  PUT api/boards/:boardId
 * @desc   Update board
 * @access Private
 */
router.put(
  '/:boardId',
  [
    param('boardId').escape().trim().notEmpty(),
    body('title')
      .optional()
      .escape()
      .trim()
      .isLength({ min: 3, max: 45 })
      .withMessage('Title must be between 3 and 45 characters.'),
    body('favorited').optional().escape().trim().toBoolean(),
  ],
  auth,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const user = req.session.user!;
    const boardId = req.params.boardId;

    const { title, favorited } = req.body;
    if (!title && typeof favorited !== 'boolean') {
      return res.status(400).json({ msg: 'No fields to update.' });
    }

    const updateValues = {
      title,
      favorited,
    };

    try {
      const result = await updateBoard(user, boardId, updateValues);
      if (result instanceof Error) {
        return res.status(result.status).json({ msg: result.msg });
      }

      if (result.length === 0) {
        return res.status(404).json({ msg: 'Board not found.' });
      }

      res.json({ board: { ...result[0] }, msg: 'Board updated.' });
    } catch (err: any) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to update board. Please try again later.' });
    }
  }
);

module.exports = router;

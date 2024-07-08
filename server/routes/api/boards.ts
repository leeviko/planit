import express, { Request, Response, Router } from 'express';
import { auth } from '../../middleware/auth';
import { validationRes } from '../../middleware/validationRes';
import { body, param } from 'express-validator';
import {
  createBoard,
  deleteBoard,
  getBoard,
  getBoards,
  updateBoard,
} from '../../controllers/boards';

const router: Router = express.Router();

/**
 * @route  GET api/boards
 * @desc   Get user's boards
 * @access Private
 */
router.get('/', auth, async (req: Request, res: Response) => {
  const user = req.session.user!;

  try {
    const result = await getBoards(user);
    if (!result.ok) {
      return res.status(result.status).json({ msg: result.msg });
    }
    res.json(result.data);
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ msg: 'Something went wrong. Please try again later.' });
  }
});

/**
 * @route  GET api/boards/:boardId
 * @desc   Get board by id or slug
 * @access Private
 */
router.get(
  '/:id',
  [param('id').escape().trim().notEmpty()],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;

    try {
      const result = await getBoard(user, req.params.id);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      if (!result.data) {
        return res.status(404).json({ msg: 'Board not found' });
      }

      res.json(result.data);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to retrieve board. Please try again later.' });
    }
  }
);

/**
 * @route  DELETE api/boards/:boardId
 * @desc   Delete board
 * @access Private
 */
router.delete(
  '/:boardId',
  [param('boardId').escape().trim().notEmpty()],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;

    try {
      const result = await deleteBoard(user, req.params.boardId);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json({ msg: 'Board deleted.' });
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to delete board. Please try again later.' });
    }
  }
);

/**
 * @route  POST api/boards
 * @desc   Create new board
 * @access Private
 */
router.post(
  '/',
  [
    body('title')
      .escape()
      .trim()
      .isLength({ min: 3, max: 45 })
      .withMessage('Title must be between 3 and 45 characters.'),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const { title } = req.body;

    try {
      const result = await createBoard(user, title);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json({ result: result.data });
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
  validationRes,
  async (req: Request, res: Response) => {
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
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      if (!result.data) {
        return res.status(404).json({ msg: 'Board not found.' });
      }

      res.json(result);
    } catch (err: any) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to update board. Please try again later.' });
    }
  }
);

module.exports = router;

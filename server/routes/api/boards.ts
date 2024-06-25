import express, { Request, Response, Router } from 'express';
import { auth } from '../../middleware/auth';
import { validationRes } from '../../middleware/validationRes';
import { body, param } from 'express-validator';
import {
  addCard,
  addList,
  createBoard,
  deleteBoard,
  getBoard,
  getBoards,
  getListBy,
  updateBoard,
  updateList,
} from '../../controllers/boards';
import { Error } from '../../server';

const router: Router = express.Router();

export interface Board {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  favorited: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface BoardWithLists extends Board {
  lists: ListWithCards[];
}

export interface NewBoard {
  id: string;
  user_id: string;
  slug: string;
  title: string;
}

export type BoardUpdate = {
  [key: string]: string | boolean | undefined;
  title?: string;
  favorited?: boolean;
};

export type ListUpdate = {
  title?: string;
  pos?: number;
};

export interface List {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

export interface ListWithCards extends List {
  cards: Card[];
}

export interface Card {
  id: string;
  list_id: string;
  title: string;
  position: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * @route  GET api/boards
 * @desc   Get user's boards
 * @access Private
 */
router.get('/', auth, async (req: Request, res: Response) => {
  const user = req.session.user!;

  try {
    const result = await getBoards(user);
    res.json(result);
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
  [param('id').escape().trim()],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;

    try {
      const result = await getBoard(user, req.params.id);
      if (result instanceof Error) {
        return res.status(result.status).json({ msg: result.msg });
      }

      if (!result) {
        return res.status(404).json({ msg: 'Board not found' });
      }

      res.json(result);
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
router.delete('/:boardId', auth, (req: Request, res: Response) => {
  const user = req.session.user!;

  try {
    const result = deleteBoard(user, req.params.boardId);
    if (result instanceof Error) {
      return res.status(result.status).json({ msg: result.msg });
    }
    res.json({ msg: 'Board deleted successfully' });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ msg: 'Failed to delete board. Please try again later.' });
  }
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
  validationRes,
  async (req: Request, res: Response) => {
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

/**
 * @route  POST api/boards/:boardId/lists
 * @desc   Create new list
 * @access Private
 */
router.post(
  '/:boardId/lists',
  [
    param('boardId').escape().trim().notEmpty(),
    body('title').escape().trim().isLength({ min: 1, max: 20 }),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const boardId = req.params.boardId;
    const user = req.session.user!;

    try {
      const result = await addList(user, boardId, req.body.title);
      if (result instanceof Error) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to create list. Please try again later.' });
    }
  }
);

/**
 * @route  DELETE api/boards/:boardId/lists/:listId
 * @desc   Delete list
 * @access Private
 */
router.delete(
  '/:boardId/lists/:listId',
  auth,
  async (req: Request, res: Response) => {
    try {
      const es = await getListBy(
        'id',
        req.params.listId,
        true,
        req.session.user!.id
      );
      res.json(es);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

/**
 * @route  PUT api/boards/:boardId/lists/:listId
 * @desc   Update list
 * @access Private
 */
router.put(
  '/:boardId/lists/:listId',
  [
    param('boardId').escape().trim().notEmpty(),
    param('listId').escape().trim().notEmpty(),
    body('title')
      .optional()
      .escape()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Title must be between 1 and 20 characters.'),
    body('pos').optional().escape().trim().toInt(),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const boardId = req.params.boardId;
    const listId = req.params.listId;
    const { title, pos } = req.body;

    if (!title && !pos) {
      return res.status(400).json({ msg: 'No fields to update.' });
    }

    const updateValues = { title, pos };

    try {
      const result = await updateList(user, boardId, listId, updateValues);

      // if (result instanceof Error) {
      //   return res.status(result.status).json({ msg: result.msg });
      // }
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to update list. Please try again later.' });
    }
  }
);

/**
 * @route  POST api/boards/:boardId/cards
 * @desc   Create new card
 * @access Private
 */
router.post(
  '/:boardId/cards',
  [
    // TODO: Hmmm
    param('boardId').escape().trim().notEmpty(),
    body('listId').escape().trim().notEmpty(),
    body('title').escape().trim().isLength({ min: 1, max: 100 }),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;

    const values = {
      boardId: req.params.boardId,
      listId: req.body.listId,
      title: req.body.title,
    };

    try {
      const result = await addCard(user, values);
      if (result instanceof Error) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to create card. Please try again later.' });
    }
  }
);

module.exports = router;

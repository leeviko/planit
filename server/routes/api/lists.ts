import express, { Router, Request, Response } from 'express';
import { param, body } from 'express-validator';
import { auth } from '../../middleware/auth';
import { validationRes } from '../../middleware/validationRes';
import {
  createList,
  deleteList,
  getListBy,
  updateList,
} from '../../controllers/lists';

const router: Router = express.Router();
/**
 * @route  POST api/lists
 * @desc   Create new list
 * @access Private
 */
router.post(
  '/',
  [
    body('boardId').escape().trim().notEmpty().isString(),
    body('title')
      .escape()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('List name must be between 1 and 20 characters.'),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const boardId = req.params.boardId;
    const user = req.session.user!;

    try {
      const result = await createList(user, boardId, req.body.title);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json({ result: result.data });
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to create list. Please try again later.' });
    }
  }
);

/**
 * @route  DELETE api/lists/:listId
 * @desc   Delete list
 * @access Private
 */
router.delete(
  '/:listId',
  [
    param('listId').escape().trim().notEmpty(),
    body('boardId').escape().trim().notEmpty(),
  ],
  validationRes,
  auth,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const listId = req.params.listId;
    const boardId = req.body.boardId;

    try {
      const result = await deleteList(user, listId, boardId);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      res.json(result.msg);
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

/**
 * @route  PUT api/lists/:listId
 * @desc   Update list
 * @access Private
 */
router.put(
  '/:listId',
  [
    param('listId').escape().trim().notEmpty(),
    body('boardId').escape().trim().notEmpty(),
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
    const listId = req.params.listId;
    const { boardId, title, pos } = req.body;

    if (!title && pos === undefined) {
      return res.status(400).json({ msg: 'No fields to update.' });
    }

    const updateValues = { title, pos };

    try {
      const result = await updateList(user, boardId, listId, updateValues);

      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }

      res.json(result.ok);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to update list. Please try again later.' });
    }
  }
);

module.exports = router;

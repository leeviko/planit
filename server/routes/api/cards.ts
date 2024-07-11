import express, { Request, Response, Router } from 'express';
import { auth } from '../../middleware/auth';
import { validationRes } from '../../middleware/validationRes';
import { body, param } from 'express-validator';
import { createCard, deleteCard, updateCard } from '../../controllers/cards';

const router: Router = express.Router();

/**
 * @route  POST api/cards
 * @desc   Create new card
 * @access Private
 */
router.post(
  '/',
  [
    body('boardId').escape().trim().notEmpty(),
    body('listId').escape().trim().notEmpty(),
    body('title')
      .escape()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Card name must be between 1 and 50 characters.'),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;

    const { boardId, listId, title } = req.body;

    const values = {
      boardId,
      listId,
      title,
    };

    try {
      const result = await createCard(user, values);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json({ result: result.data });
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to create card. Please try again later.' });
    }
  }
);

/**
 * @route  PUT api/cards/:cardId
 * @desc   Update card
 * @access Private
 */
router.put(
  '/:cardId',
  [
    param('cardId').escape().trim().notEmpty(),
    body('title')
      .optional()
      .escape()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Card name must be between 1 and 50 characters.'),
    body('listId').optional().escape().trim(),
    body('pos').optional().escape().trim().toInt(),
  ],
  auth,
  validationRes,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const { cardId } = req.params;
    const { title, listId, pos } = req.body;

    if (!title && !listId && pos === undefined) {
      return res.status(400).json({ msg: 'No fields to update.' });
    }

    const updateValues = {
      title,
      listId,
      pos,
    };

    try {
      const result = await updateCard(user, cardId, updateValues);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to update card. Please try again later.' });
    }
  }
);
/**
 * @route  DELETE api/cards/:cardId
 * @desc   Delete card
 * @access Private
 */
router.delete(
  '/:cardId',
  [param('cardId').escape().trim().notEmpty()],
  validationRes,
  auth,
  async (req: Request, res: Response) => {
    const user = req.session.user!;
    const { cardId } = req.params;
    try {
      const result = await deleteCard(user, cardId);
      if (!result.ok) {
        return res.status(result.status).json({ msg: result.msg });
      }
      res.json(result);
    } catch (err) {
      console.log(err);
      res
        .status(400)
        .json({ msg: 'Failed to delete card. Please try again later.' });
    }
  }
);

module.exports = router;

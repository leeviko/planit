import { useEffect } from 'react';
import './BoardItem.css';
import {
  hideFormModal,
  formModalError,
  setFormModalLoading,
  showFormModal,
} from '../ui/uiSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { useCreateBoardMutation } from '../api/apiSlice';

const NewBoardItem = () => {
  const dispatch = useDispatch();
  const submitted = useSelector(
    (state: RootState) => state.ui.formModalSubmitted
  );
  const modalValues = useSelector(
    (state: RootState) => state.ui.formModal?.inputs
  );
  const [createBoard] = useCreateBoardMutation();

  const handleClick = () => {
    dispatch(
      showFormModal({
        title: 'New board',
        buttonText: 'Create',
        inputs: [
          {
            name: 'Name',
            type: 'text',
            value: '',
            required: { min: 4, max: 25 },
          },
          {
            name: 'Private',
            type: 'checkbox',
            value: false,
          },
        ],
      })
    );
  };

  const handleSubmit = async () => {
    const data = {
      name: modalValues[0].value as string,
      private: modalValues[1].value as boolean,
    };

    dispatch(setFormModalLoading(true));

    try {
      await createBoard(data).unwrap();
      dispatch(hideFormModal());
    } catch (err: any) {
      console.log(err);
      dispatch(formModalError(err.data.msg || 'Something went wrong'));
    }

    dispatch(setFormModalLoading(false));
  };

  useEffect(() => {
    if (!submitted) return;

    handleSubmit();
  }, [submitted]);

  return (
    <button className="board-item new" onClick={handleClick}>
      Create new board
    </button>
  );
};

export default NewBoardItem;

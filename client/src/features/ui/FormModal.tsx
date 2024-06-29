import React from 'react';
import { RootState } from '../../app/store';
import { useDispatch, useSelector } from 'react-redux';
import useForm from '../../hooks/useForm';
import './FormModal.css';
import { hideFormModal, submitFormModal } from './uiSlice';
import { createPortal } from 'react-dom';
import Loader from './Loader';

const FormModalContainer = () => {
  const show = useSelector((state: RootState) => state.ui.showFormModal);
  if (!show) return;

  return <FormModal />;
};

const FormModal = () => {
  const modal = useSelector((state: RootState) => state.ui.formModal);
  const initialValues = modal.inputs.reduce((acc: any, input) => {
    acc[input.name] = '';
    return acc;
  }, {});
  const [values, handleChange] = useForm(initialValues);
  const dispatch = useDispatch();

  const handleSubmit = () => {
    let valid = true;

    modal.inputs.forEach((input) => {
      const required = input.required;
      if (!required) return;
      const inputValue = values[input.name];

      if (
        inputValue.length < required.min ||
        inputValue.length > required.max
      ) {
        valid = false;
        return;
      }
    });

    if (!valid) return;

    const data = modal.inputs.map((input) => values[input.name]);

    dispatch(submitFormModal(data));
  };

  const handleClose = () => {
    dispatch(hideFormModal());
  };

  return createPortal(
    <>
      <div className="overlay" onClick={handleClose}></div>
      <div className="form-modal">
        <h3>{modal.title}</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          {modal.inputs.map((input) => (
            <React.Fragment key={input.name}>
              <label>{input.name}</label>
              <input
                type={input.type}
                name={input.name}
                value={values[input.name]}
                onChange={handleChange}
              />
            </React.Fragment>
          ))}
          <button
            className="btn"
            type="submit"
            onClick={handleSubmit}
            onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
          >
            {modal.isLoading ? <Loader /> : modal.buttonText}
          </button>
          {modal.error && <p className="errors">{modal.error}</p>}
        </form>
      </div>
    </>,
    document.getElementById('modal-root')!
  );
};

export default FormModalContainer;

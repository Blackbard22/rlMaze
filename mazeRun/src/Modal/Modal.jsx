import React, { useEffect } from 'react';
import styles from './modal.module.css';

const Modal = ({ title, content, isOpen }) => {


    const handleResponseClose = () => {
        const response_modal = document.querySelector(`.${styles.modal_overlay}`);
        response_modal.classList.toggle(styles.hide);
        console.log('response_modal_triggered');
    }

    if (!isOpen) return null;

    useEffect(() => {
        const response_modal = document.querySelector(`.${styles.modal_overlay}`);
        if (response_modal && isOpen) {
            response_modal.classList.remove(styles.hide);
            response_modal.classList.add(styles.animate);

        }
    }, [title, content, isOpen]);

    return (
        <div className={styles.modal_overlay} onClick={() => handleResponseClose()}>
            <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{content}</p>
                <div className={styles.close_btn} onClick={() => handleResponseClose()}>Close</div>
            </div>
        </div>




    );
};

export default Modal;

import React from 'react';
import ReactModal from 'react-modal';

const MODAL_STYLES = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  content: {
    position: 'static',
    background: 'none',
    border: 'none',
    maxHeight: '100vh',
    maxWidth: '1200px'
  }
};

export default function Modal({ children, ...props }) {
  return (
    <ReactModal contentLabel="Modal" style={MODAL_STYLES} {...props}>
      {children}
    </ReactModal>
  );
}

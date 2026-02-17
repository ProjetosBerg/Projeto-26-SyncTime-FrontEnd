import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const DefaultModal = ({ isOpen, toggle, title, children, confirmLabel, onConfirm, cancelLabel, size='lg' }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size={size} fade>
      {title && <ModalHeader toggle={toggle}>{title}</ModalHeader>}

      <ModalBody style={{ lineHeight: '1.6', fontSize: '15px', color: '#333' }}>
        {children}
      </ModalBody>

      <ModalFooter>
        {cancelLabel && (
          <Button color="danger" onClick={toggle}>
            {cancelLabel}
          </Button>
        )}
        {confirmLabel && (
          <Button color="sucess" onClick={onConfirm || toggle}>
            {confirmLabel}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};


export default DefaultModal;

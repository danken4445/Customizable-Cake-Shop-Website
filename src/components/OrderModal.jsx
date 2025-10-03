import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from '@nextui-org/react';

export default function OrderModal({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'baking': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    await onUpdateStatus(order.id, newStatus);
    onClose();
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader>Order Details</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Customer Information</h4>
                <p>Name: {order.customerName}</p>
                <p>Email: {order.customerEmail}</p>
                <p>Phone: {order.customerPhone}</p>
              </div>
              <div>
                <h4 className="font-semibold">Order Information</h4>
                <p>Order ID: {order.id}</p>
                <p>Status: <Chip color={getStatusColor(order.status)} size="sm">{order.status}</Chip></p>
                <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <h4 className="font-semibold mb-2">Order Items</h4>
              {order.items?.map((item, index) => (
                <div key={index} className="border rounded p-3 mb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.cakeName}</span>
                    <span>₱{item.totalPrice}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Base: {item.base}</p>
                    <p>Size: {item.size}</p>
                    {item.toppings?.length > 0 && (
                      <p>Toppings: {item.toppings.join(', ')}</p>
                    )}
                  </div>
                </div>
              )) || (
                <p>No detailed items available</p>
              )}
            </div>
            
            <div className="text-right font-semibold text-lg">
              Total: ₱{order.totalAmount}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
          {order.status === 'pending' && (
            <Button
              color="warning"
              onClick={() => handleStatusUpdate('baking')}
            >
              Start Baking
            </Button>
          )}
          {order.status === 'baking' && (
            <Button
              color="success"
              onClick={() => handleStatusUpdate('completed')}
            >
              Mark Completed
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
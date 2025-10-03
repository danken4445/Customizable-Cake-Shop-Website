import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
} from '@nextui-org/react';
import { useState } from 'react';

export default function ToppingsTab({ 
  toppings, 
  onCreateTopping, 
  onEditTopping, 
  onDeleteTopping 
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTopping, setSelectedTopping] = useState(null);
  const [toppingForm, setToppingForm] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setSelectedTopping(null);
    setToppingForm({
      name: '',
      price: '',
      description: '',
      category: ''
    });
    onOpen();
  };

  const handleEdit = (topping) => {
    setSelectedTopping(topping);
    setToppingForm({
      name: topping.name || '',
      price: topping.price || '',
      description: topping.description || '',
      category: topping.category || ''
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!toppingForm.name || !toppingForm.price) {
      alert('Please fill in name and price');
      return;
    }

    setSaving(true);
    try {
      const toppingData = {
        name: toppingForm.name,
        price: Number(toppingForm.price),
        description: toppingForm.description,
        category: toppingForm.category,
        updatedAt: new Date().toISOString()
      };

      if (!selectedTopping) {
        toppingData.createdAt = new Date().toISOString();
      }

      await (selectedTopping ? onEditTopping : onCreateTopping)(toppingData, selectedTopping?.id);
      onClose();
    } catch (error) {
      console.error('Error saving topping:', error);
      alert('Failed to save topping');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (toppingId) => {
    if (!confirm('Are you sure you want to delete this topping?')) return;
    await onDeleteTopping(toppingId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Toppings</h2>
        <Button color="primary" onClick={handleCreate}>
          + Add New Topping
        </Button>
      </div>

      <Table aria-label="Toppings table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>CATEGORY</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No toppings found">
          {toppings.map((topping) => (
            <TableRow key={topping.id}>
              <TableCell>
                <div className="font-semibold">{topping.name}</div>
              </TableCell>
              <TableCell>
                <Chip color="success" variant="flat">
                  ₱{topping.price}
                </Chip>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="secondary">
                  {topping.category || 'General'}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="text-sm text-gray-500 max-w-[200px] truncate">
                  {topping.description || 'No description'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="light"
                    onClick={() => handleEdit(topping)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onClick={() => handleDelete(topping.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Topping Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>
            {selectedTopping ? 'Edit Topping' : 'Add New Topping'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Topping Name"
                placeholder="e.g., Fresh Strawberries"
                value={toppingForm.name}
                onChange={(e) => setToppingForm({...toppingForm, name: e.target.value})}
              />
              <Input
                label="Price (₱)"
                type="number"
                placeholder="25"
                value={toppingForm.price}
                onChange={(e) => setToppingForm({...toppingForm, price: e.target.value})}
              />
              <Input
                label="Category (Optional)"
                placeholder="e.g., Fruits, Chocolates, Nuts"
                value={toppingForm.category}
                onChange={(e) => setToppingForm({...toppingForm, category: e.target.value})}
              />
              <Textarea
                label="Description (Optional)"
                placeholder="Brief description of the topping"
                value={toppingForm.description}
                onChange={(e) => setToppingForm({...toppingForm, description: e.target.value})}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSave}
              isLoading={saving}
            >
              {selectedTopping ? 'Update Topping' : 'Add Topping'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
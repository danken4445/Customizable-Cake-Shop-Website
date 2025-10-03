import { useState } from 'react';
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Image,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import BulkCakeModal from './BulkCakeModal';

export default function ProductsTab({ 
  cakes, 
  onCreateCake, 
  onEditCake, 
  onDeleteCake,
  shopId,
  onRefresh
}) {
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const handleDelete = async (cakeId) => {
    if (!confirm('Are you sure you want to delete this cake?')) return;
    await onDeleteCake(cakeId);
  };

  const handleBulkSuccess = () => {
    onRefresh?.();
    setBulkModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Cakes</h2>
        <div className="flex gap-2">
          <Dropdown>
            <DropdownTrigger>
              <Button color="secondary" variant="bordered">
                ⚡ Bulk Add Cakes
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem
                key="bulk"
                description="Create multiple cakes efficiently"
                onPress={() => setBulkModalOpen(true)}
              >
                🚀 Advanced Bulk Creator
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" onClick={onCreateCake}>
            + Add Single Cake
          </Button>
        </div>
      </div>

      <Table aria-label="Cakes table">
        <TableHeader>
          <TableColumn>IMAGE</TableColumn>
          <TableColumn>NAME</TableColumn>
          <TableColumn>TIER PRICING</TableColumn>
          <TableColumn>FLAVORS</TableColumn>
          <TableColumn>TAGS</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No cakes found">
          {cakes.map((cake) => (
            <TableRow key={cake.id}>
              <TableCell>
                <Image
                  src={cake.imageUrl || 'https://via.placeholder.com/60?text=Cake'}
                  alt={cake.name}
                  width={60}
                  height={60}
                  className="object-cover rounded"
                />
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">{cake.name}</div>
                  <div className="text-sm text-gray-500">{cake.description}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                  {cake.tierPricing && Object.keys(cake.tierPricing).length > 0 ? (
                    Object.entries(cake.tierPricing)
                      .filter(([_, price]) => price !== null && price !== undefined)
                      .sort(([a], [b]) => {
                        const numA = parseInt(a.replace('tier', ''));
                        const numB = parseInt(b.replace('tier', ''));
                        return numA - numB;
                      })
                      .map(([tierKey, price], index) => {
                        const tierNumber = tierKey.replace('tier', '');
                        const tierName = cake.tierNames?.[tierKey] ? 
                          cake.tierNames[tierKey].replace(' Cake', '') : 
                          `${tierNumber}T`;
                        const colors = ['success', 'primary', 'secondary', 'warning', 'danger'];
                        const color = colors[index % colors.length];
                        
                        return (
                          <Chip key={tierKey} color={color} variant="flat" size="sm">
                            {tierName}: ₱{price}
                          </Chip>
                        );
                      })
                  ) : (
                    <Chip color="success" variant="flat" size="sm">
                      Base: ₱{cake.basePrice || 0}
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {cake.flavors?.slice(0, 2).map((flavor, idx) => (
                    <Chip key={idx} size="sm" variant="flat">
                      {flavor}
                    </Chip>
                  ))}
                  {cake.flavors?.length > 2 && (
                    <Chip size="sm" variant="flat">
                      +{cake.flavors.length - 2}
                    </Chip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {cake.tags?.slice(0, 3).map((tag, idx) => (
                    <Chip key={idx} size="sm" variant="bordered" color="primary">
                      {tag}
                    </Chip>
                  ))}
                  {cake.tags?.length > 3 && (
                    <Chip size="sm" variant="bordered" color="primary">
                      +{cake.tags.length - 3}
                    </Chip>
                  )}
                  {(!cake.tags || cake.tags.length === 0) && (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="light"
                    onClick={() => onEditCake(cake)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onClick={() => handleDelete(cake.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <BulkCakeModal 
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        shopId={shopId}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
}
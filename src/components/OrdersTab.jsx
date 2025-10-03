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
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Badge,
  Tooltip,
} from '@nextui-org/react';

export default function OrdersTab({ 
  orders, 
  onViewOrder, 
  onUpdateOrderStatus 
}) {
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending-approval': return { color: 'warning', bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' };
      case 'pending': return { color: 'warning', bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' };
      case 'baking': return { color: 'primary', bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };
      case 'completed': return { color: 'success', bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' };
      case 'cancelled': return { color: 'danger', bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' };
      default: return { color: 'default', bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' };
    }
  };

  const statusOptions = [
    { key: 'pending-approval', label: '📋 Pending Approval', description: 'Waiting for admin review' },
    { key: 'pending', label: '⏳ Confirmed', description: 'Order confirmed, ready to start' },
    { key: 'baking', label: '👩‍🍳 In Progress', description: 'Currently being prepared' },
    { key: 'completed', label: '✅ Completed', description: 'Ready for pickup/delivery' },
    { key: 'cancelled', label: '❌ Cancelled', description: 'Order cancelled' },
  ];

  // Calendar helper functions
  const getCurrentMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    return { year, month };
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getOrdersForDate = (date) => {
    const dateStr = formatDate(date);
    return orders.filter(order => {
      // Use preferred delivery/pickup date for calendar display
      if (order.preferredDate || order.requestedDeliveryDate) {
        const deliveryDate = order.preferredDate || order.requestedDeliveryDate;
        // Convert MM/DD/YYYY format to date for comparison
        const [month, day, year] = deliveryDate.split('/');
        const preferredDateObj = new Date(year, month - 1, day);
        const preferredDateStr = formatDate(preferredDateObj);
        return preferredDateStr === dateStr;
      }
      // Fallback to creation date if no preferred date
      const orderDate = new Date(order.createdAt || order.orderDate);
      const orderDateStr = formatDate(orderDate);
      return orderDateStr === dateStr;
    });
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    setShowOrderModal(false);
  };

  const renderCalendarView = () => {
    const { year, month } = getCurrentMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const days = [];
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOrders = getOrdersForDate(date);
      const isToday = formatDate(date) === formatDate(new Date());
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-300' : ''
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 'text-gray-700'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayOrders.slice(0, 2).map((order, index) => {
              const statusInfo = getStatusColor(order.status);
              return (
                <Tooltip key={index} content={`${order.customerName} - ${order.status}`}>
                  <div 
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowOrderModal(true);
                    }}
                  >
                    {order.customerName.split(' ')[0]}
                  </div>
                </Tooltip>
              );
            })}
            {dayOrders.length > 2 && (
              <div className="text-xs text-gray-500 font-medium">
                +{dayOrders.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="light" 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              ←
            </Button>
            <h3 className="text-xl font-semibold">
              {monthNames[month]} {year}
            </h3>
            <Button 
              variant="light" 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              →
            </Button>
          </div>
          <Button 
            color="primary" 
            variant="light" 
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardBody className="p-0">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center font-medium text-gray-600 border-b border-gray-200">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {days}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderTableView = () => (
    <Table aria-label="Orders table">
      <TableHeader>
        <TableColumn>ORDER ID</TableColumn>
        <TableColumn>CUSTOMER</TableColumn>
        <TableColumn>ITEMS</TableColumn>
        <TableColumn>TOTAL</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>ORDER DATE</TableColumn>
        <TableColumn>DELIVERY DATE</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No orders found">
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {order.id.slice(-8)}
              </code>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-semibold">{order.customerName}</div>
                <div className="text-sm text-gray-500">{order.customerEmail || order.customerPhone}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {order.items?.length || 1} item(s)
              </div>
            </TableCell>
            <TableCell>
              <Chip color="success" variant="flat">
                ₱{order.totalAmount}
              </Chip>
            </TableCell>
            <TableCell>
              <Chip
                color={getStatusColor(order.status).color}
                variant="flat"
                className="capitalize"
              >
                {order.status.replace('-', ' ')}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div className="font-medium">Ordered:</div>
                <div>{new Date(order.createdAt || order.orderDate).toLocaleDateString()}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {order.preferredDate || order.requestedDeliveryDate ? (
                  <>
                    <div className="font-medium text-blue-600">
                      {order.isPickup ? 'Pickup:' : 'Delivery:'}
                    </div>
                    <div className="text-blue-800 font-semibold">
                      {order.preferredDate || order.requestedDeliveryDate}
                    </div>
                    {(order.preferredTime || order.requestedDeliveryTime) && (
                      <div className="text-xs text-blue-600">
                        {order.preferredTime || order.requestedDeliveryTime}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">Not specified</span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  color="primary"
                  variant="light"
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                >
                  View
                </Button>
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="light"
                    >
                      Update
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Status actions"
                    onAction={(key) => handleStatusUpdate(order.id, key)}
                  >
                    {statusOptions.map((status) => (
                      <DropdownItem
                        key={status.key}
                        description={status.description}
                        className={order.status === status.key ? 'bg-primary-50' : ''}
                      >
                        {status.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📋 Order Management</h2>
          <p className="text-gray-600">Manage and track your cake orders</p>
        </div>
        
        <Tabs 
          selectedKey={viewMode} 
          onSelectionChange={setViewMode}
          color="primary"
          variant="bordered"
        >
          <Tab key="calendar" title="📅 Calendar View" />
          <Tab key="table" title="📊 Table View" />
        </Tabs>
      </div>

      {/* Status Legend */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-800">🎨 Status Legend</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4">
            {statusOptions.map((status) => {
              const statusInfo = getStatusColor(status.key);
              const count = orders.filter(order => order.status === status.key).length;
              return (
                <Badge key={status.key} content={count} color="primary" variant="solid">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${statusInfo.bg} ${statusInfo.border}`}>
                    <div className={`w-3 h-3 rounded-full ${statusInfo.bg.replace('bg-', 'bg-').replace('-100', '-400')}`}></div>
                    <span className={`font-medium ${statusInfo.text}`}>
                      {status.label}
                    </span>
                  </div>
                </Badge>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* View Content */}
      <div className="min-h-[500px]">
        {viewMode === 'calendar' ? renderCalendarView() : renderTableView()}
      </div>

      {/* Order Details Modal */}
      <Modal 
        isOpen={showOrderModal} 
        onClose={() => setShowOrderModal(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {selectedOrder && (
            <>
              <ModalHeader className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">Order Details</h3>
                    <p className="text-sm text-gray-500">#{selectedOrder.id.slice(-8)}</p>
                  </div>
                  <Chip 
                    color={getStatusColor(selectedOrder.status).color}
                    variant="shadow"
                    className="capitalize"
                  >
                    {selectedOrder.status.replace('-', ' ')}
                  </Chip>
                </div>
              </ModalHeader>
              
              <ModalBody>
                <div className="space-y-4">
                  {/* Customer Info */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-semibold">👤 Customer Information</h4>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Contact:</span>
                          <p className="font-medium">{selectedOrder.customerEmail || selectedOrder.customerPhone}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Address:</span>
                          <p className="font-medium">{selectedOrder.deliveryAddress || selectedOrder.isPickup ? 'Store Pickup' : 'N/A'}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Order Items */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-semibold">🍰 Order Items</h4>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-2">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{item.cakeName}</p>
                              <p className="text-sm text-gray-600">{item.selectedSize}</p>
                              {item.placedToppings?.length > 0 && (
                                <p className="text-xs text-gray-500">
                                  Toppings: {item.placedToppings.map(t => t.name).join(', ')}
                                </p>
                              )}
                            </div>
                            <Chip color="success" variant="flat">
                              ₱{item.totalPrice}
                            </Chip>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Special Instructions */}
                  {selectedOrder.specialInstructions && (
                    <Card>
                      <CardHeader>
                        <h4 className="font-semibold">📝 Special Instructions</h4>
                      </CardHeader>
                      <CardBody>
                        <p className="text-sm">{selectedOrder.specialInstructions}</p>
                      </CardBody>
                    </Card>
                  )}

                  {/* Order Timeline */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-semibold">� Order Timeline</h4>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {/* Order Placed */}
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Order Placed:</p>
                            <p className="font-medium">{new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-gray-400">📋</div>
                        </div>
                        
                        {/* Requested Delivery/Pickup */}
                        {(selectedOrder.preferredDate || selectedOrder.requestedDeliveryDate) && (
                          <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div>
                              <p className="text-sm text-blue-600">
                                Requested {selectedOrder.isPickup ? 'Pickup' : 'Delivery'} Date:
                              </p>
                              <p className="font-bold text-blue-800">
                                {selectedOrder.preferredDate || selectedOrder.requestedDeliveryDate}
                              </p>
                              {(selectedOrder.preferredTime || selectedOrder.requestedDeliveryTime) && (
                                <p className="text-sm text-blue-600">
                                  at {selectedOrder.preferredTime || selectedOrder.requestedDeliveryTime}
                                </p>
                              )}
                            </div>
                            <div className="text-blue-400 text-xl">
                              {selectedOrder.isPickup ? '🏪' : '🚚'}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Delivery Info */}
                  <Card>
                    <CardHeader>
                      <h4 className="font-semibold">🚚 Delivery Information</h4>
                    </CardHeader>
                    <CardBody>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Service Type:</span>
                          <p className="font-medium">{selectedOrder.isPickup ? '🏪 Store Pickup' : '🚚 Delivery'}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <p className="font-medium">
                            {selectedOrder.isPickup ? 'Store Location' : (selectedOrder.deliveryAddress || 'Not specified')}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Total Amount:</span>
                          <p className="text-lg font-bold text-green-600">₱{selectedOrder.totalAmount}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </ModalBody>
              
              <ModalFooter>
                <Button 
                  variant="light" 
                  onPress={() => setShowOrderModal(false)}
                >
                  Close
                </Button>
                <Dropdown>
                  <DropdownTrigger>
                    <Button color="primary">
                      Update Status
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Status actions"
                    onAction={(key) => handleStatusUpdate(selectedOrder.id, key)}
                  >
                    {statusOptions.map((status) => (
                      <DropdownItem
                        key={status.key}
                        description={status.description}
                        className={selectedOrder.status === status.key ? 'bg-primary-50' : ''}
                      >
                        {status.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
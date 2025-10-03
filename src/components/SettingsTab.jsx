import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  Textarea,
  Switch,
} from '@nextui-org/react';

export default function SettingsTab({ 
  settings, 
  onSettingsChange, 
  onSaveSettings 
}) {
  const handleInputChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">Shop Settings</h2>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Delivery & Pickup</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Enable Delivery</span>
            <Switch
              isSelected={settings.deliveryEnabled}
              onValueChange={(value) => handleInputChange('deliveryEnabled', value)}
            />
          </div>
          <div className="flex justify-between items-center">
            <span>Enable Pickup</span>
            <Switch
              isSelected={settings.pickupEnabled}
              onValueChange={(value) => handleInputChange('pickupEnabled', value)}
            />
          </div>
          <Input
            label="Delivery Fee (₱)"
            type="number"
            value={String(settings.deliveryFee || '')}
            onChange={(e) => handleInputChange('deliveryFee', Number(e.target.value))}
          />
          <Input
            label="Minimum Order Amount (₱)"
            type="number"
            value={String(settings.minimumOrder || '')}
            onChange={(e) => handleInputChange('minimumOrder', Number(e.target.value))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Contact Information</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Contact Number"
            value={settings.contactNumber || ''}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          />
          <Textarea
            label="Shop Address"
            value={settings.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
          <Input
            label="Operating Hours"
            value={settings.operatingHours || ''}
            onChange={(e) => handleInputChange('operatingHours', e.target.value)}
          />
        </CardBody>
      </Card>

      <Button color="primary" onClick={onSaveSettings}>
        Save Settings
      </Button>
    </div>
  );
}
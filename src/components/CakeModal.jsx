import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Image,
  Card,
  CardBody,
  Divider,
  Chip,
  Select,
  SelectItem,
} from '@nextui-org/react';

export default function CakeModal({ 
  isOpen, 
  onClose, 
  selectedCake, 
  onSave, 
  shopId 
}) {
  const [cakeForm, setCakeForm] = useState({
    name: selectedCake?.name || '',
    description: selectedCake?.description || '',
    flavors: Array.isArray(selectedCake?.flavors) 
      ? selectedCake.flavors.join(', ') 
      : (selectedCake?.flavors || ''),
    toppings: Array.isArray(selectedCake?.toppings) 
      ? selectedCake.toppings.join(', ') 
      : (selectedCake?.toppings || ''),
    imageFile: null,
    imageUrl: selectedCake?.imageUrl || ''
  });

  // Predefined tag categories for better UX
  const predefinedTags = [
    { category: 'Occasions', tags: ['Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Graduation', 'Retirement', 'Engagement'] },
    { category: 'Celebrations', tags: ['Holiday', 'Christmas', 'New Year', 'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day', 'Easter'] },
    { category: 'Style', tags: ['Elegant', 'Rustic', 'Modern', 'Classic', 'Vintage', 'Minimalist', 'Luxury'] },
    { category: 'Dietary', tags: ['Gluten-Free', 'Vegan', 'Sugar-Free', 'Keto', 'Low-Carb', 'Organic', 'Nut-Free'] },
    { category: 'Themes', tags: ['Floral', 'Cartoon', 'Sports', 'Music', 'Travel', 'Nature', 'Princess', 'Superhero'] },
    { category: 'Size', tags: ['Personal', 'Small Party', 'Medium Party', 'Large Event', 'Corporate', 'Intimate'] }
  ];

  // Tags state
  const [selectedTags, setSelectedTags] = useState(selectedCake?.tags || []);
  const [customTag, setCustomTag] = useState('');

  // Dynamic tier pricing state
  const [tiers, setTiers] = useState([
    { id: 1, name: '1-Tier Cake', price: selectedCake?.tierPricing?.tier1 || selectedCake?.basePrice || '' }
  ]);

  // Initialize tiers from selected cake
  useEffect(() => {
    if (selectedCake?.tierPricing) {
      const existingTiers = [];
      Object.entries(selectedCake.tierPricing).forEach(([key, price]) => {
        const tierNumber = parseInt(key.replace('tier', ''));
        if (price) {
          existingTiers.push({
            id: tierNumber,
            name: `${tierNumber}-Tier Cake`,
            price: price
          });
        }
      });
      if (existingTiers.length > 0) {
        setTiers(existingTiers.sort((a, b) => a.id - b.id));
      }
    } else if (selectedCake?.basePrice) {
      setTiers([{ id: 1, name: '1-Tier Cake', price: selectedCake.basePrice }]);
    }
  }, [selectedCake]);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tier management functions
  const addTier = () => {
    const newTierNumber = Math.max(...tiers.map(t => t.id)) + 1;
    setTiers([...tiers, {
      id: newTierNumber,
      name: `${newTierNumber}-Tier Cake`,
      price: ''
    }]);
  };

  const removeTier = (tierId) => {
    if (tiers.length > 1) { // Keep at least one tier
      setTiers(tiers.filter(t => t.id !== tierId));
    }
  };

  const updateTierPrice = (tierId, price) => {
    setTiers(tiers.map(t => t.id === tierId ? {...t, price} : t));
  };

  const updateTierName = (tierId, name) => {
    setTiers(tiers.map(t => t.id === tierId ? {...t, name} : t));
  };

  // Tag management functions
  const addPredefinedTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const selectAllTags = () => {
    const allPredefinedTags = predefinedTags.flatMap(category => category.tags);
    const uniqueTags = Array.from(new Set([...selectedTags, ...allPredefinedTags]));
    setSelectedTags(uniqueTags);
  };

  const selectCategoryTags = (categoryTags) => {
    const uniqueTags = Array.from(new Set([...selectedTags, ...categoryTags]));
    setSelectedTags(uniqueTags);
  };

  const deselectCategoryTags = (categoryTags) => {
    setSelectedTags(selectedTags.filter(tag => !categoryTags.includes(tag)));
  };

  const deselectAllTags = () => {
    setSelectedTags([]);
  };

  const handleImageUpload = async (file) => {
    if (!file) return '';
    
    setUploading(true);
    try {
      const imageRef = ref(storage, `cakes/${shopId}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!cakeForm.name || tiers.length === 0 || !tiers[0].price) {
      alert('Please fill in cake name and at least one tier price');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = cakeForm.imageUrl;
      
      // Upload new image if selected
      if (cakeForm.imageFile) {
        imageUrl = await handleImageUpload(cakeForm.imageFile);
      }

      // Build tierPricing object from tiers array
      const tierPricing = {};
      tiers.forEach(tier => {
        if (tier.price) {
          tierPricing[`tier${tier.id}`] = Number(tier.price);
        }
      });

      const cakeData = {
        name: cakeForm.name,
        basePrice: Number(tiers[0].price), // Base price is the first tier price
        description: cakeForm.description,
        flavors: cakeForm.flavors.split(',').map(f => f.trim()).filter(f => f),
        toppings: cakeForm.toppings.split(',').map(t => t.trim()).filter(t => t),
        tags: selectedTags,
        tierPricing: tierPricing,
        tierNames: tiers.reduce((acc, tier) => {
          acc[`tier${tier.id}`] = tier.name;
          return acc;
        }, {}),
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (!selectedCake) {
        cakeData.createdAt = new Date().toISOString();
      }

      await onSave(cakeData, selectedCake?.id);
      onClose();
    } catch (error) {
      console.error('Error saving cake:', error);
      alert('Failed to save cake');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setCakeForm({
      name: '',
      description: '',
      flavors: '',
      toppings: '',
      imageFile: null,
      imageUrl: ''
    });
    setTiers([{ id: 1, name: '1-Tier Cake', price: '' }]);
    setSelectedTags([]);
    setCustomTag('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalContent>
        <ModalHeader>
          {selectedCake ? 'Edit Cake' : 'Add New Cake'}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <Input
              label="Cake Name"
              value={cakeForm.name}
              onChange={(e) => setCakeForm({...cakeForm, name: e.target.value})}
            />
            
            {/* Dynamic Tier Pricing Section */}
            <Card>
              <CardBody className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-700">Tier Pricing</h4>
                  <Button
                    color="primary"
                    size="sm"
                    onPress={addTier}
                  >
                    + Add Tier
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {tiers.map((tier, index) => (
                    <div key={tier.id} className="flex gap-3 items-end">
                      <Input
                        label={`Tier ${tier.id} Name`}
                        placeholder={`${tier.id}-Tier Cake`}
                        value={tier.name}
                        onChange={(e) => updateTierName(tier.id, e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        label="Price (₱)"
                        type="number"
                        placeholder="500"
                        value={tier.price}
                        onChange={(e) => updateTierPrice(tier.id, e.target.value)}
                        className="w-32"
                      />
                      {tiers.length > 1 && (
                        <Button
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => removeTier(tier.id)}
                          className="px-2"
                        >
                          🗑️
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {tiers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No tiers configured. Add at least one tier.</p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Tags Section */}
            <Card>
              <CardBody className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-700">Cake Tags</h4>
                  <p className="text-sm text-gray-500">Help customers find your cakes</p>
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag, index) => (
                        <Chip
                          key={index}
                          color="primary"
                          variant="flat"
                          size="sm"
                          onClose={() => removeTag(tag)}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}

                {/* Select All/None Actions */}
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="bordered"
                    color="primary"
                    onPress={selectAllTags}
                  >
                    Select All Tags
                  </Button>
                  <Button
                    size="sm"
                    variant="bordered" 
                    color="danger"
                    onPress={deselectAllTags}
                  >
                    Clear All Tags
                  </Button>
                </div>

                {/* Predefined Tags by Category */}
                <div className="space-y-3">
                  {predefinedTags.map((category) => {
                    const categorySelected = category.tags.every(tag => selectedTags.includes(tag));
                    const categoryPartiallySelected = category.tags.some(tag => selectedTags.includes(tag));
                    
                    return (
                      <div key={category.category}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-semibold text-gray-600">{category.category}</p>
                          <div className="flex gap-1">
                            <Button
                              size="tiny"
                              variant="light"
                              color="primary"
                              className="text-xs h-6 px-2"
                              onPress={() => selectCategoryTags(category.tags)}
                              isDisabled={categorySelected}
                            >
                              Select All
                            </Button>
                            <Button
                              size="tiny"
                              variant="light"
                              color="danger"
                              className="text-xs h-6 px-2"
                              onPress={() => deselectCategoryTags(category.tags)}
                              isDisabled={!categoryPartiallySelected}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {category.tags.map((tag) => (
                          <Chip
                            key={tag}
                            variant={selectedTags.includes(tag) ? "solid" : "bordered"}
                            color={selectedTags.includes(tag) ? "success" : "default"}
                            size="sm"
                            className="cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => addPredefinedTag(tag)}
                          >
                            {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                          </Chip>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>                {/* Custom Tag Input */}
                <div className="flex gap-2 items-end">
                  <Input
                    label="Custom Tag"
                    placeholder="Enter custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                    className="flex-1"
                  />
                  <Button
                    color="secondary"
                    size="sm"
                    onPress={addCustomTag}
                    isDisabled={!customTag.trim() || selectedTags.includes(customTag.trim())}
                  >
                    Add
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Divider />
            
            <Textarea
              label="Description"
              value={cakeForm.description}
              onChange={(e) => setCakeForm({...cakeForm, description: e.target.value})}
            />
            <Input
              label="Available Flavors (comma separated)"
              placeholder="Chocolate, Vanilla, Strawberry"
              value={cakeForm.flavors}
              onChange={(e) => setCakeForm({...cakeForm, flavors: e.target.value})}
            />
            <Input
              label="Available Toppings (comma separated)"
              placeholder="Cherry, Sprinkles, Nuts"
              value={cakeForm.toppings}
              onChange={(e) => setCakeForm({...cakeForm, toppings: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium mb-2">Cake Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCakeForm({...cakeForm, imageFile: e.target.files[0]})}
                className="w-full"
              />
              {(cakeForm.imageUrl || cakeForm.imageFile) && (
                <div className="mt-2">
                  <Image
                    src={cakeForm.imageFile ? URL.createObjectURL(cakeForm.imageFile) : cakeForm.imageUrl}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSave}
            isLoading={saving || uploading}
          >
            {selectedCake ? 'Update Cake' : 'Add Cake'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
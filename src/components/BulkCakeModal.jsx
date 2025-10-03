import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  Input,
  Textarea,
  Select,
  SelectItem,
  Chip,
  Divider,
  Progress,
  Alert,
} from '@nextui-org/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function BulkCakeModal({ isOpen, onClose, shopId, onSuccess }) {
  const [activeTab, setActiveTab] = useState('template');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  // Template-based bulk creation
  const [templateData, setTemplateData] = useState({
    baseNames: ['Chocolate', 'Vanilla', 'Strawberry', 'Red Velvet', 'Carrot'],
    suffixes: ['Birthday Cake', 'Wedding Cake', 'Anniversary Cake'],
    basePrice: 500,
    priceIncrement: 100,
    commonTags: ['Birthday', 'Celebration'],
    commonFlavors: ['Rich', 'Moist', 'Delicious'],
    description: 'A delicious and beautifully crafted cake perfect for your special occasion.',
  });

  // CSV-based bulk creation
  const [csvData, setCsvData] = useState('');
  const [csvPreview, setCsvPreview] = useState([]);

  // Manual bulk creation
  const [manualCakes, setManualCakes] = useState([
    { name: '', description: '', basePrice: '', tags: [], flavors: [] }
  ]);

  // Predefined cake templates
  const cakeTemplates = [
    {
      name: 'Classic Collection',
      cakes: [
        { name: 'Classic Chocolate Cake', price: 450, tags: ['Classic', 'Chocolate'], flavors: ['Rich Chocolate', 'Moist'] },
        { name: 'Vanilla Dream Cake', price: 400, tags: ['Classic', 'Vanilla'], flavors: ['Pure Vanilla', 'Light'] },
        { name: 'Strawberry Delight', price: 480, tags: ['Fruity', 'Strawberry'], flavors: ['Fresh Strawberry', 'Sweet'] },
      ]
    },
    {
      name: 'Wedding Collection',
      cakes: [
        { name: 'Elegant White Wedding Cake', price: 800, tags: ['Wedding', 'Elegant', 'Multi-tier'], flavors: ['Vanilla', 'Buttercream'] },
        { name: 'Rose Garden Wedding Cake', price: 850, tags: ['Wedding', 'Floral', 'Romantic'], flavors: ['Rose', 'Vanilla'] },
        { name: 'Modern Minimalist Wedding Cake', price: 750, tags: ['Wedding', 'Modern', 'Minimalist'], flavors: ['Lemon', 'Clean'] },
      ]
    },
    {
      name: 'Birthday Special',
      cakes: [
        { name: 'Rainbow Birthday Cake', price: 550, tags: ['Birthday', 'Colorful', 'Kids'], flavors: ['Vanilla', 'Colorful'] },
        { name: 'Character Birthday Cake', price: 600, tags: ['Birthday', 'Custom', 'Kids'], flavors: ['Chocolate', 'Fun'] },
        { name: 'Adult Birthday Cake', price: 500, tags: ['Birthday', 'Sophisticated'], flavors: ['Red Velvet', 'Elegant'] },
      ]
    }
  ];

  const handleTemplateGeneration = async () => {
    setIsLoading(true);
    setProgress(0);
    const results = { success: [], failed: [] };

    try {
      const combinations = [];
      templateData.baseNames.forEach(baseName => {
        templateData.suffixes.forEach((suffix, suffixIndex) => {
          combinations.push({
            name: `${baseName} ${suffix}`,
            description: templateData.description,
            basePrice: templateData.basePrice + (suffixIndex * templateData.priceIncrement),
            tags: [...templateData.commonTags, baseName],
            flavors: [...templateData.commonFlavors, baseName]
          });
        });
      });

      for (let i = 0; i < combinations.length; i++) {
        try {
          const cakeData = {
            ...combinations[i],
            createdAt: new Date().toISOString(),
            tierPricing: {
              tier1: combinations[i].basePrice,
              tier2: combinations[i].basePrice + 200,
              tier3: combinations[i].basePrice + 400
            },
            tierNames: {
              tier1: '6" Small Cake',
              tier2: '8" Medium Cake', 
              tier3: '10" Large Cake'
            }
          };

          await addDoc(collection(db, 'cakeShops', shopId, 'cakes'), cakeData);
          results.success.push(combinations[i].name);
        } catch (error) {
          results.failed.push({ name: combinations[i].name, error: error.message });
        }
        
        setProgress(((i + 1) / combinations.length) * 100);
      }

      setResults(results);
      if (results.success.length > 0) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Template generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplatePreset = (template) => {
    setIsLoading(true);
    setProgress(0);
    const results = { success: [], failed: [] };

    const createCakes = async () => {
      for (let i = 0; i < template.cakes.length; i++) {
        try {
          const cake = template.cakes[i];
          const cakeData = {
            name: cake.name,
            description: `A premium ${cake.name.toLowerCase()} designed for special occasions.`,
            basePrice: cake.price,
            tags: cake.tags,
            flavors: cake.flavors,
            createdAt: new Date().toISOString(),
            tierPricing: {
              tier1: cake.price,
              tier2: cake.price + 250,
              tier3: cake.price + 500
            },
            tierNames: {
              tier1: '6" Small Cake',
              tier2: '9" Medium Cake',
              tier3: '12" Large Cake'
            }
          };

          await addDoc(collection(db, 'cakeShops', shopId, 'cakes'), cakeData);
          results.success.push(cake.name);
        } catch (error) {
          results.failed.push({ name: template.cakes[i].name, error: error.message });
        }
        
        setProgress(((i + 1) / template.cakes.length) * 100);
      }

      setResults(results);
      if (results.success.length > 0) {
        onSuccess?.();
      }
      setIsLoading(false);
    };

    createCakes();
  };

  const parseCsvData = () => {
    if (!csvData.trim()) return;
    
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
    
    setCsvPreview(preview);
  };

  const handleCsvImport = async () => {
    if (!csvData.trim()) return;
    
    setIsLoading(true);
    setProgress(0);
    const results = { success: [], failed: [] };

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const dataLines = lines.slice(1);

      for (let i = 0; i < dataLines.length; i++) {
        try {
          const values = dataLines[i].split(',').map(v => v.trim());
          const cakeObj = headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});

          const cakeData = {
            name: cakeObj.name || `Cake ${i + 1}`,
            description: cakeObj.description || 'Delicious cake',
            basePrice: parseInt(cakeObj.basePrice) || 400,
            tags: cakeObj.tags ? cakeObj.tags.split('|').map(t => t.trim()) : [],
            flavors: cakeObj.flavors ? cakeObj.flavors.split('|').map(f => f.trim()) : [],
            createdAt: new Date().toISOString(),
            tierPricing: {
              tier1: parseInt(cakeObj.basePrice) || 400,
              tier2: (parseInt(cakeObj.basePrice) || 400) + 200,
              tier3: (parseInt(cakeObj.basePrice) || 400) + 400
            },
            tierNames: {
              tier1: '6" Small Cake',
              tier2: '8" Medium Cake',
              tier3: '10" Large Cake'
            }
          };

          await addDoc(collection(db, 'cakeShops', shopId, 'cakes'), cakeData);
          results.success.push(cakeData.name);
        } catch (error) {
          results.failed.push({ name: `Line ${i + 2}`, error: error.message });
        }
        
        setProgress(((i + 1) / dataLines.length) * 100);
      }

      setResults(results);
      if (results.success.length > 0) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('CSV import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addManualCake = () => {
    setManualCakes([...manualCakes, { name: '', description: '', basePrice: '', tags: [], flavors: [] }]);
  };

  const updateManualCake = (index, field, value) => {
    const updated = [...manualCakes];
    updated[index][field] = value;
    setManualCakes(updated);
  };

  const removeManualCake = (index) => {
    setManualCakes(manualCakes.filter((_, i) => i !== index));
  };

  const handleManualCreation = async () => {
    const validCakes = manualCakes.filter(cake => cake.name.trim() && cake.basePrice);
    if (validCakes.length === 0) return;

    setIsLoading(true);
    setProgress(0);
    const results = { success: [], failed: [] };

    try {
      for (let i = 0; i < validCakes.length; i++) {
        try {
          const cake = validCakes[i];
          const cakeData = {
            name: cake.name.trim(),
            description: cake.description.trim() || 'Delicious cake',
            basePrice: parseInt(cake.basePrice),
            tags: cake.tags,
            flavors: cake.flavors,
            createdAt: new Date().toISOString(),
            tierPricing: {
              tier1: parseInt(cake.basePrice),
              tier2: parseInt(cake.basePrice) + 200,
              tier3: parseInt(cake.basePrice) + 400
            },
            tierNames: {
              tier1: '6" Small Cake',
              tier2: '8" Medium Cake',
              tier3: '10" Large Cake'
            }
          };

          await addDoc(collection(db, 'cakeShops', shopId, 'cakes'), cakeData);
          results.success.push(cake.name);
        } catch (error) {
          results.failed.push({ name: validCakes[i].name, error: error.message });
        }
        
        setProgress(((i + 1) / validCakes.length) * 100);
      }

      setResults(results);
      if (results.success.length > 0) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Manual creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResults(null);
    setProgress(0);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="5xl" 
      scrollBehavior="inside"
      className="max-h-[90vh]"
    >
      <ModalContent>
        <ModalHeader>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">Bulk Add Cakes</h2>
            <p className="text-sm text-gray-500">Create multiple cakes efficiently</p>
          </div>
        </ModalHeader>
        
        <ModalBody>
          {isLoading && (
            <div className="space-y-2">
              <Progress value={progress} color="success" />
              <p className="text-sm text-center">Creating cakes... {Math.round(progress)}%</p>
            </div>
          )}

          {results && (
            <Alert color="success" variant="flat" className="mb-4">
              <div>
                <h4 className="font-semibold">Bulk Creation Complete!</h4>
                <p>Successfully created: {results.success.length} cakes</p>
                {results.failed.length > 0 && (
                  <p className="text-red-600">Failed: {results.failed.length} cakes</p>
                )}
              </div>
            </Alert>
          )}

          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={setActiveTab}
            variant="underlined"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
            }}
          >
            <Tab key="template" title="Template Generator">
              <Card>
                <CardBody className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Template Configuration</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate cakes by combining base names with suffixes
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Base Names</label>
                      <Textarea
                        value={templateData.baseNames.join('\n')}
                        onChange={(e) => setTemplateData({
                          ...templateData,
                          baseNames: e.target.value.split('\n').filter(n => n.trim())
                        })}
                        placeholder="Enter base names (one per line)"
                        rows={5}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Suffixes</label>
                      <Textarea
                        value={templateData.suffixes.join('\n')}
                        onChange={(e) => setTemplateData({
                          ...templateData,
                          suffixes: e.target.value.split('\n').filter(s => s.trim())
                        })}
                        placeholder="Enter suffixes (one per line)"
                        rows={5}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Base Price"
                      type="number"
                      value={templateData.basePrice}
                      onChange={(e) => setTemplateData({
                        ...templateData,
                        basePrice: parseInt(e.target.value) || 0
                      })}
                    />
                    <Input
                      label="Price Increment per Suffix"
                      type="number"
                      value={templateData.priceIncrement}
                      onChange={(e) => setTemplateData({
                        ...templateData,
                        priceIncrement: parseInt(e.target.value) || 0
                      })}
                    />
                  </div>

                  <Textarea
                    label="Common Description"
                    value={templateData.description}
                    onChange={(e) => setTemplateData({
                      ...templateData,
                      description: e.target.value
                    })}
                  />

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      This will generate {templateData.baseNames.length * templateData.suffixes.length} cakes
                    </p>
                    <Button 
                      color="primary" 
                      onPress={handleTemplateGeneration}
                      isDisabled={isLoading || templateData.baseNames.length === 0 || templateData.suffixes.length === 0}
                    >
                      Generate Cakes
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="presets" title="Quick Presets">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Choose from pre-made cake collections to quickly populate your shop
                </p>
                
                {cakeTemplates.map((template, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {template.cakes.length} cakes included
                        </p>
                        <div className="space-y-2">
                          {template.cakes.map((cake, cakeIndex) => (
                            <div key={cakeIndex} className="flex justify-between items-center text-sm">
                              <span>{cake.name}</span>
                              <span className="font-medium">₱{cake.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={() => handleTemplatePreset(template)}
                        isDisabled={isLoading}
                      >
                        Add Collection
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Tab>

            <Tab key="csv" title="CSV Import">
              <Card>
                <CardBody className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">CSV Format</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Use this format (first line must be headers):
                    </p>
                    <code className="block text-xs bg-gray-100 p-2 rounded">
                      name,description,basePrice,tags,flavors<br/>
                      "Chocolate Cake","Rich chocolate cake",450,"Birthday|Chocolate","Rich|Moist"<br/>
                      "Vanilla Cake","Light vanilla cake",400,"Classic|Vanilla","Pure|Light"
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      Use | to separate multiple tags or flavors
                    </p>
                  </div>

                  <Textarea
                    label="CSV Data"
                    placeholder="Paste your CSV data here..."
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={8}
                  />

                  <div className="flex gap-2">
                    <Button variant="bordered" onPress={parseCsvData}>
                      Preview Data
                    </Button>
                    <Button 
                      color="primary" 
                      onPress={handleCsvImport}
                      isDisabled={!csvData.trim() || isLoading}
                    >
                      Import CSV
                    </Button>
                  </div>

                  {csvPreview.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Preview (first 5 rows):</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="bg-gray-50">
                              {Object.keys(csvPreview[0]).map(header => (
                                <th key={header} className="border p-2 text-left">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((row, index) => (
                              <tr key={index}>
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="border p-2">{value}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Tab>

            <Tab key="manual" title="Manual Entry">
              <Card>
                <CardBody className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Manual Cake Entry</h4>
                    <Button size="sm" onPress={addManualCake}>
                      + Add Row
                    </Button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {manualCakes.map((cake, index) => (
                      <Card key={index} className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            size="sm"
                            label="Cake Name"
                            value={cake.name}
                            onChange={(e) => updateManualCake(index, 'name', e.target.value)}
                            isRequired
                          />
                          <Input
                            size="sm"
                            label="Base Price"
                            type="number"
                            value={cake.basePrice}
                            onChange={(e) => updateManualCake(index, 'basePrice', e.target.value)}
                            isRequired
                          />
                          <div className="flex gap-2">
                            <Input
                              size="sm"
                              label="Tags (comma-separated)"
                              value={cake.tags.join(', ')}
                              onChange={(e) => updateManualCake(index, 'tags', 
                                e.target.value.split(',').map(t => t.trim()).filter(t => t)
                              )}
                            />
                            {manualCakes.length > 1 && (
                              <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                onPress={() => removeManualCake(index)}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Input
                            size="sm"
                            label="Description"
                            value={cake.description}
                            onChange={(e) => updateManualCake(index, 'description', e.target.value)}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="text-center">
                    <Button 
                      color="primary" 
                      onPress={handleManualCreation}
                      isDisabled={isLoading || !manualCakes.some(cake => cake.name.trim() && cake.basePrice)}
                    >
                      Create {manualCakes.filter(cake => cake.name.trim() && cake.basePrice).length} Cakes
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {results ? 'Done' : 'Cancel'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
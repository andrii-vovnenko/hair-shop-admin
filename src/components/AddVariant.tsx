import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  message, 
  Select, 
  Upload, 
  InputNumber,
  Modal,
  Space,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  InboxOutlined 
} from '@ant-design/icons';
import { apiService, type CreateVariantRequest, type CreateColorRequest, type Product, type Color } from '../services/api';

const { Option } = Select;
const { Dragger } = Upload;

interface AddVariantProps {
  preselectedProductId?: string;
}

const AddVariant: React.FC<AddVariantProps> = ({ preselectedProductId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [colorForm] = Form.useForm();
  const [colorLoading, setColorLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  // Load products and colors on component mount
  useEffect(() => {
    loadProducts();
    loadColors();
    
    // Set preselected product if provided
    if (preselectedProductId) {
      form.setFieldValue('product_id', preselectedProductId);
    }
  }, [preselectedProductId]);

  const loadProducts = async () => {
    try {
      const productsData = await apiService.getProducts();
      setProducts(productsData);
    } catch (error: any) {
      message.error('Failed to load products');
    }
  };

  const loadColors = async () => {
    try {
      const colorsData = await apiService.getColors();
      setColors(colorsData);
    } catch (error: any) {
      message.error('Failed to load colors');
    }
  };

  const handleColorCreate = async (values: CreateColorRequest) => {
    setColorLoading(true);
    try {
      await apiService.createColor(values);
      message.success('Color created successfully!');
      colorForm.resetFields();
      setColorModalVisible(false);
      // Reload colors to get the updated list
      await loadColors();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create color');
    } finally {
      setColorLoading(false);
    }
  };

  const handleColorDelete = async (colorId: string) => {
  Modal.confirm({
    title: 'Ви впевнені, що хочете видалити цей колір?',
    okText: 'Так',
    cancelText: 'Ні',
    onOk: async () => {
      try {
        await apiService.deleteColor(colorId);
        message.success('Колір успішно видалено!');
        await loadColors(); // оновити список
      } catch (error: any) {
        message.error(error.response?.data?.error || 'Не вдалося видалити колір');
      }
    },
  });
};


  const onFinish = async (values: CreateVariantRequest) => {
    if (fileList.length === 0) {
      message.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const variantData = {
        ...values,
        images: fileList.map(file => file.originFileObj).filter(Boolean) as File[]
      };
      
      await apiService.createVariant(variantData);
      message.success('Variant created successfully!');
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create variant');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange: (info: any) => {
      setFileList(info.fileList);
    },
    onRemove: (file: any) => {
      const newFileList = fileList.filter(item => item.uid !== file.uid);
      setFileList(newFileList);
    },
  };

  return (
    <div>
      <Card title="Add New Variant" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Product"
            name="product_id"
            rules={[{ required: true, message: 'Please select a product!' }]}
          >
            <Select
              placeholder="Select a product"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: 'Please input SKU!' }]}
          >
            <Input placeholder="Enter SKU" />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter price"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="Promo Price"
            name="promo_price"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter promo price"
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: 'Please select or create a color!' }]}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Select
                placeholder="Select or create a color"
                showSearch
                allowClear
                style={{ flex: 1 }}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={() => setColorModalVisible(true)}
                      style={{ width: '100%' }}
                    >
                      Create New Color
                    </Button>
                  </div>
                )}
                onSelect={(value) => {
                  form.setFieldValue('color', value);
                }}
              >
               {colors.map(color => (
  <Option key={color.id} value={color.name}>
    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
      <span>{color.display_name || color.name}</span>
      <Button
        type="link"
        danger
        size="small"
        onClick={(e) => {
          e.stopPropagation(); // щоб не вибирався елемент
          handleColorDelete(color.id);
        }}
      >
        Delete
      </Button>
    </Space>
  </Option>
))}


              </Select>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            label="Stock Quantity"
            name="stock_quantity"
            rules={[{ required: true, message: 'Please input stock quantity!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter stock quantity"
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Images"
            required
          >
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for single or bulk upload. Only image files are allowed.
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
              block
            >
              Create Variant
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Color Creation Modal */}
      <Modal
        title="Create New Color"
        open={colorModalVisible}
        onCancel={() => {
          setColorModalVisible(false);
          colorForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={colorForm}
          layout="vertical"
          onFinish={handleColorCreate}
          autoComplete="off"
        >
          <Form.Item
            label="Color Name"
            name="name"
            rules={[{ required: true, message: 'Please input color name!' }]}
          >
            <Input placeholder="Enter color name" />
          </Form.Item>

          <Form.Item
            label="Display Name"
            name="display_name"
          >
            <Input placeholder="Enter display name" />
          </Form.Item>

          <Form.Item
            label="Color Category"
            name="color_category"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter color category number"
              min={0}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={colorLoading}
                icon={<PlusOutlined />}
              >
                Create Color
              </Button>
              <Button onClick={() => setColorModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddVariant;

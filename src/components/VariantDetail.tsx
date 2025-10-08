import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Button, 
  Card, 
  Typography, 
  Space, 
  message, 
  Spin,
  Row,
  Col,
  Tag,
  Upload,
  Image,
  Popconfirm,
  Table,
  Select,
  Modal,
  Divider
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiService, getImageUrlByKey, COLOR_CATEGORIES } from '../services/api';
import type { Variant, Product, UpdateVariantRequest, Color } from '../services/api';

const { Title, Text } = Typography;

const COLOR_CATEGORY_OPTIONS = [
  { label: 'Light', value: COLOR_CATEGORIES.LIGHT },
  { label: 'Dark', value: COLOR_CATEGORIES.DARK }
];

interface VariantDetailProps {
  variantId: string;
  onBack?: () => void;
}

const VariantDetail: React.FC<VariantDetailProps> = ({ variantId, onBack }) => {
  const [form] = Form.useForm();
  const [variant, setVariant] = useState<Variant | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [colorForm] = Form.useForm();
  const [colorLoading, setColorLoading] = useState(false);

  useEffect(() => {
    fetchVariant();
    fetchColors();
  }, [variantId]);

  const fetchVariant = async () => {
    try {
      setLoading(true);
      const variantData = await apiService.getVariant(variantId);
      setVariant(variantData);
      
      // Fetch product details
      const productData = await apiService.getProduct(variantData.product_id);
      setProduct(productData);
      
      // Populate form with variant data
      form.setFieldsValue({
        sku: variantData.sku,
        price: variantData.price,
        promo_price: variantData.promo_price,
        color: variantData.color,
        stock_quantity: variantData.stock_quantity,
      });
    } catch (error) {
      message.error('Failed to fetch variant details');
      console.error('Error fetching variant:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchColors = async () => {
    try {
      const colorsData = await apiService.getColors();
      setColors(colorsData);
    } catch (error) {
      message.error('Failed to fetch colors');
      console.error('Error fetching colors:', error);
    }
  };

  const handleColorCreate = async (values: any) => {
    setColorLoading(true);
    try {
      await apiService.createColor(values);
      message.success('Color created successfully!');
      colorForm.resetFields();
      setColorModalVisible(false);
      // Reload colors to get the updated list
      await fetchColors();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create color');
    } finally {
      setColorLoading(false);
    }
  };

  const handleSave = async (values: UpdateVariantRequest) => {
    try {
      setSaving(true);
      const updatedVariant = await apiService.updateVariant(variantId, values);
      setVariant(updatedVariant);
      message.success('Variant updated successfully');
      // Refresh variant data to get updated images
      await fetchVariant();
    } catch (error) {
      message.error('Failed to update variant');
      console.error('Error updating variant:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      await apiService.addVariantImages(variantId, [file]);
      message.success('Image uploaded successfully');
      fetchVariant(); // Refresh to get updated images
    } catch (error) {
      message.error('Failed to upload image');
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await apiService.deleteImage(imageId);
      message.success('Image deleted successfully');
      fetchVariant(); // Refresh to get updated images
    } catch (error) {
      message.error('Failed to delete image');
      console.error('Error deleting image:', error);
    }
  };

  const imageColumns = [
    {
      title: 'Image',
      dataIndex: 'url',
      key: 'url',
      render: (url: string) => {
        // Extract the key from the URL (assuming the URL contains the image key)
        const imageKey = url.split('/').pop() || url;
        const optimizedUrl = getImageUrlByKey(imageKey, {
          width: 60,
          height: 60,
          quality: 60, // Lower quality for thumbnails
          format: 'webp'
        });
        
        return (
          <Image
            width={60}
            height={60}
            src={optimizedUrl}
            style={{ objectFit: 'cover', borderRadius: '4px' }}
          />
        );
      },
    },
    {
      title: 'Sort Order',
      dataIndex: 'sort_order',
      key: 'sort_order',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="default" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              const imageKey = record.url.split('/').pop() || record.url;
              const optimizedUrl = getImageUrlByKey(imageKey, {
                width: 800,
                height: 600,
                quality: 80,
                format: 'webp'
              });
              window.open(optimizedUrl, '_blank');
            }}
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this image?"
            onConfirm={() => handleDeleteImage(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading variant details...</div>
      </div>
    );
  }

  if (!variant) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Variant not found</Title>
        <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Space>
          {onBack && (
            <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
              Back
            </Button>
          )}
          <Title level={2} style={{ margin: 0 }}>
            Variant: {variant.color}
          </Title>
        </Space>
        {product && (
          <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
            Product: {product.name}
          </Text>
        )}
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Variant Information" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                sku: variant.sku,
                price: variant.price,
                promo_price: variant.promo_price,
                color: variant.color,
                stock_quantity: variant.stock_quantity,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="SKU"
                    name="sku"
                  >
                    <Input placeholder="Enter SKU" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Color"
                    name="color"
                    rules={[{ required: true, message: 'Please select a color!' }]}
                  >
                    <Select
                      placeholder="Select a color"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
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
                    >
                      {colors.map(color => (
                        <Select.Option key={color.id} value={color.name}>
                          {`${color.display_name} ${color.name || ''}`} 
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: 'Please input price!' }]}
                  >
                    <InputNumber 
                      placeholder="Enter price" 
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      suffix="грн"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Promo Price"
                    name="promo_price"
                  >
                    <InputNumber 
                      placeholder="Enter promo price" 
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      suffix="грн"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Stock Quantity"
                name="stock_quantity"
                rules={[{ required: true, message: 'Please input stock quantity!' }]}
              >
                <InputNumber 
                  placeholder="Enter stock quantity" 
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={saving}
                  >
                    Save Changes
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Images">
            <div style={{ marginBottom: '16px' }}>
              <Upload
                beforeUpload={(file) => {
                  handleImageUpload(file);
                  return false; // Prevent default upload
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button 
                  icon={<UploadOutlined />} 
                  loading={uploading}
                  disabled={uploading}
                >
                  Upload Image
                </Button>
              </Upload>
            </div>
            
            <Table
              columns={imageColumns}
              dataSource={variant.images}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} images`,
              }}
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="Variant Stats" style={{ marginBottom: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Variant ID:</Text>
                <br />
                <Text code>{variant.id}</Text>
              </div>
              <div>
                <Text strong>Product ID:</Text>
                <br />
                <Text code>{variant.product_id}</Text>
              </div>
              <div>
                <Text strong>Price:</Text>
                <br />
                <Text>{variant.price.toFixed(2)} грн</Text>
              </div>
              {variant.promo_price && (
                <div>
                  <Text strong>Promo Price:</Text>
                  <br />
                  <Text style={{ color: '#52c41a' }}>{variant.promo_price.toFixed(2)} грн</Text>
                </div>
              )}
              <div>
                <Text strong>Stock:</Text>
                <br />
                <Tag color={variant.stock_quantity > 0 ? 'green' : 'red'}>
                  {variant.stock_quantity} units
                </Tag>
              </div>
              <div>
                <Text strong>Images:</Text>
                <br />
                <Text>{variant.images?.length || 0} images</Text>
              </div>
            </Space>
          </Card>

          {product && (
            <Card title="Product Info">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Product Name:</Text>
                  <br />
                  <Text>{product.name}</Text>
                </div>
                {product.display_name && (
                  <div>
                    <Text strong>Display Name:</Text>
                    <br />
                    <Text>{product.display_name}</Text>
                  </div>
                )}
                <div>
                  <Text strong>Type:</Text>
                  <br />
                  <Text>{product.type || 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Length:</Text>
                  <br />
                  <Text>{product.length ? `${product.length}cm` : 'N/A'}</Text>
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

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
            <Select
              placeholder="Select color category"
              options={COLOR_CATEGORY_OPTIONS}
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

export default VariantDetail;

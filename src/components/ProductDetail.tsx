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
  Table,
  Popconfirm
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Product, Variant, UpdateProductRequest } from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProductDetailProps {
  productId: string;
  onBack?: () => void;
  onVariantSelect?: (variantId: string) => void;
  onNavigate?: (key: string) => void;
  onNavigateToAddVariant?: (productId: string) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ productId, onBack, onVariantSelect, onNavigate, onNavigateToAddVariant }) => {
  const [form] = Form.useForm();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProduct(productId);
      setProduct(data);
      setVariants(data.variants || []);
      
      // Populate form with product data
      form.setFieldsValue({
        name: data.name,
        display_name: data.display_name,
        description: data.description,
        short_description: data.short_description,
        type: data.type,
        length: data.length,
        base_price: data.base_price,
        base_promo_price: data.base_promo_price,
        category_id: data.category,
      });
    } catch (error) {
      message.error('Failed to fetch product details');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: UpdateProductRequest) => {
    try {
      setSaving(true);
      const updatedProduct = await apiService.updateProduct(productId, values);
      setProduct(updatedProduct);
      message.success('Product updated successfully');
    } catch (error) {
      message.error('Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    try {
      await apiService.deleteVariant(variantId);
      message.success('Variant deleted successfully');
      fetchProduct(); // Refresh to get updated variants
    } catch (error) {
      message.error('Failed to delete variant');
      console.error('Error deleting variant:', error);
    }
  };

  const variantColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Tag color="blue">{color}</Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toFixed(2)} грн`,
    },
    {
      title: 'Promo Price',
      dataIndex: 'promo_price',
      key: 'promo_price',
      render: (price: number) => price ? `${price.toFixed(2)} грн` : 'N/A',
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock} units
        </Tag>
      ),
    },
    {
      title: 'Images',
      dataIndex: 'images',
      key: 'images',
      render: (images: any[]) => (
        <Text>{images?.length || 0} images</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Variant) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => onVariantSelect?.(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this variant?"
            onConfirm={() => handleDeleteVariant(record.id)}
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
        <div style={{ marginTop: '16px' }}>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={3}>Product not found</Title>
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
            {product.name}
          </Title>
        </Space>
        {product.display_name && (
          <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
            {product.display_name}
          </Text>
        )}
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="Product Information" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                name: product.name,
                display_name: product.display_name,
                description: product.description,
                short_description: product.short_description,
                type: product.type,
                length: product.length,
                base_price: product.base_price,
                base_promo_price: product.base_promo_price,
                category_id: product.category_id,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Product Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input product name!' }]}
                  >
                    <Input placeholder="Enter product name" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Display Name"
                    name="display_name"
                  >
                    <Input placeholder="Enter display name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Type"
                    name="type"
                  >
                    <Input placeholder="Enter product type" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Length (cm)"
                    name="length"
                  >
                    <InputNumber 
                      placeholder="Enter length" 
                      style={{ width: '100%' }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Short Description"
                name="short_description"
              >
                <Input placeholder="Enter short description" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Enter product description" 
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Base Price"
                    name="base_price"
                  >
                    <InputNumber 
                      placeholder="Enter base price" 
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      prefix="$"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Base Promo Price"
                    name="base_promo_price"
                  >
                    <InputNumber 
                      placeholder="Enter promo price" 
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      prefix="$"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Category ID"
                name="category_id"
                rules={[{ required: true, message: 'Please input category ID!' }]}
              >
                <Input placeholder="Enter category ID" />
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
        </Col>

        <Col span={8}>
          <Card title="Product Stats" style={{ marginBottom: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Product ID:</Text>
                <br />
                <Text code>{product.id}</Text>
              </div>
              <div>
                <Text strong>Category:</Text>
                <br />
                <Tag color="blue">{product.category || 'N/A'}</Tag>
              </div>
              <div>
                <Text strong>Variants:</Text>
                <br />
                <Text>{variants.length} variants</Text>
              </div>
              <div>
                <Text strong>Base Price:</Text>
                <br />
                <Text>{product.base_price ? `$${product.base_price.toFixed(2)}` : 'N/A'}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Product Variants">
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Variants ({variants.length})</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              if (onNavigateToAddVariant) {
                onNavigateToAddVariant(productId);
              } else {
                onNavigate?.('add-variant');
                window.location.hash = '#add-variant';
              }
            }}
          >
            Add Variant
          </Button>
        </div>
        
        <Table
          columns={variantColumns}
          dataSource={variants}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} variants`,
          }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default ProductDetail;

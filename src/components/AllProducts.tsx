import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Popconfirm, 
  message, 
  Card,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  ShoppingOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { apiService } from '../services/api';
import type { Product } from '../services/api';

const { Title } = Typography;

const PRODUCT_CATEGORIES = {
  WIGS: 1,
  TAILS: 2,
  TOPPERS: 3
};

const CATEGORY_NAMES = {
  [PRODUCT_CATEGORIES.WIGS]: 'Перуки',
  [PRODUCT_CATEGORIES.TAILS]: 'Хвости',
  [PRODUCT_CATEGORIES.TOPPERS]: 'Топпера'
};

interface AllProductsProps {
  onProductSelect?: (productId: string) => void;
  onNavigate?: (key: string) => void;
}

const AllProducts: React.FC<AllProductsProps> = ({ onProductSelect, onNavigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (error) {
      message.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      message.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.display_name && (
            <div style={{ color: '#666', fontSize: '12px' }}>{record.display_name}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{CATEGORY_NAMES[(category as unknown as number) as keyof typeof CATEGORY_NAMES] || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type || 'N/A',
    },
    {
      title: 'Length',
      dataIndex: 'length',
      key: 'length',
      render: (length: number) => length ? `${length}cm` : 'N/A',
    },
    {
      title: 'Base Price',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (price: number) => price ? `$${price.toFixed(2)}` : 'N/A',
    },
    {
      title: 'Variants',
      dataIndex: 'variants',
      key: 'variants',
      render: (variants: any[]) => (
        <Tag color="green">{variants?.length || 0} variants</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Product) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => onProductSelect?.(record.id)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
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

  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, product) => sum + (product.variants?.length || 0), 0);
  const averagePrice = products.length > 0 
    ? products.reduce((sum, product) => sum + (product.base_price || 0), 0) / products.length 
    : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>All Products</Title>
        <p>Manage your hair shop products and variants</p>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Variants"
              value={totalVariants}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Price"
              value={averagePrice}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Products List</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              onNavigate?.('add-product');
              window.location.hash = '#add-product';
            }}
          >
            Add New Product
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AllProducts;

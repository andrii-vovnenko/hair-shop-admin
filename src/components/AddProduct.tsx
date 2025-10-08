import React, { useState } from 'react';
import { Form, Input, Button, Card, message, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { apiService, type CreateProductRequest, HAIR_TYPES } from '../services/api';

const { TextArea } = Input;

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

const PRODUCT_CATEGORIES_OPTIONS = Object.entries(PRODUCT_CATEGORIES).map(([, value]) => ({
  label: CATEGORY_NAMES[value],
  value: value
}));

const HAIR_TYPE_OPTIONS = [
  { label: 'Натуральний', value: HAIR_TYPES.NATURAL },
  { label: 'Синтетичний', value: HAIR_TYPES.SYNTHETIC }
];

console.log(PRODUCT_CATEGORIES_OPTIONS);

const AddProduct: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateProductRequest) => {
    setLoading(true);
    try {
      await apiService.createProduct(values);
      message.success('Product created successfully!');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Add New Product" style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="Product Name"
          name="name"
          rules={[{ required: true, message: 'Please input product name!' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          label="Display Name"
          name="display_name"
        >
          <Input placeholder="Enter display name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <TextArea rows={4} placeholder="Enter product description" />
        </Form.Item>

        <Form.Item
          label="Short Description"
          name="short_description"
        >
          <Input placeholder="Enter short description" />
        </Form.Item>

        <Form.Item
          label="Type"
          name="type"
        >
          <Select
            placeholder="Select hair type"
            options={HAIR_TYPE_OPTIONS}
          />
        </Form.Item>

        <Form.Item
          label="Length"
          name="length"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter length"
            min={0}
          />
        </Form.Item>

        <Form.Item
          label="Base Price"
          name="base_price"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter base price"
            min={0}
            step={0.01}
          />
        </Form.Item>

        <Form.Item
          label="Base Promo Price"
          name="base_promo_price"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter base promo price"
            min={0}
            step={0.01}
          />
        </Form.Item>

        <Form.Item
          label="Category ID"
          name="category_id"
          rules={[{ required: true, message: 'Please input category ID!' }]}
        >
          <Select placeholder="Enter category ID" options={PRODUCT_CATEGORIES_OPTIONS} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<PlusOutlined />}
            block
          >
            Create Product
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddProduct;

import React from 'react';
import { Card, List } from 'antd';
import type { CreateProductRequest } from '../services/api';

type ProductsProps = {
  products: CreateProductRequest[];
};

const Products: React.FC<ProductsProps> = ({ products }) => {
  return (
    <Card title="Added Products" style={{ marginTop: 32 }}>
      <List
        dataSource={products}
        renderItem={(product, index) => (
          <List.Item key={index}>
            <strong>{product.name}</strong>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Products;

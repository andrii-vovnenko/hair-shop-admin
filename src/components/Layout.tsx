import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import { 
  PlusOutlined, 
  BarcodeOutlined,
  HomeOutlined 
} from '@ant-design/icons';
import AddProduct from './AddProduct';
import AddVariant from './AddVariant';

const { Header, Content, Sider } = AntLayout;
const { Title } = Typography;

type MenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  component: React.ReactNode;
};

const Layout: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('home');
  const [collapsed, setCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      component: (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={2}>Hair Shop Admin</Title>
          <p>Welcome to the Hair Shop Admin Panel</p>
          <p>Use the navigation menu to add products and variants.</p>
        </div>
      ),
    },
    {
      key: 'add-product',
      icon: <PlusOutlined />,
      label: 'Add Product',
      component: <AddProduct />,
    },
    {
      key: 'add-variant',
      icon: <BarcodeOutlined />,
      label: 'Add Variant',
      component: <AddVariant />,
    },
  ];

  const selectedItem = menuItems.find(item => item.key === selectedKey);

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'HS' : 'Hair Shop'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => setSelectedKey(key)}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Title level={3} style={{ margin: 0 }}>
            {selectedItem?.label || 'Hair Shop Admin'}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          {selectedItem?.component}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;

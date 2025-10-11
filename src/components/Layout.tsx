import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import { 
  PlusOutlined, 
  BarcodeOutlined,
  HomeOutlined,
  ShoppingOutlined,
  EditOutlined
} from '@ant-design/icons';
import AddProduct from './AddProduct';
import AddVariant from './AddVariant';
import AllProducts from './AllProducts';
import ProductDetail from './ProductDetail';
import VariantDetail from './VariantDetail';
import LoginForm from './LoginForm';
import { apiService } from '../services/api';

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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [preselectedProductId, setPreselectedProductId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    setIsAuthenticated(true);
  }
}, []);

useEffect(() => {
  if (loginError) {
    const timer = setTimeout(() => setLoginError(''), 4000);
    return () => clearTimeout(timer);
  }
}, [loginError]);


const handleLogin = async (username: string, password: string) => {
  try {
    const data = await apiService.login(username, password);

    if (data.success) {
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('token', data.token || '');
    } else {
      setLoginError('Невірний логін або пароль');
    }
  } catch (err) {
    console.error('Login error:', err);
    setLoginError('Помилка з’єднання з сервером');
  }
};





  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedVariantId(null);
    setSelectedKey('product-detail');
    window.location.hash = '#product-detail';
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);
    setSelectedProductId(null);
    setSelectedKey('variant-detail');
    window.location.hash = '#variant-detail';
  };

  const handleBack = () => {
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setPreselectedProductId(null);
    setSelectedKey('home');
  };

  const handleNavigateToAddVariant = (productId?: string) => {
    if (productId) {
      setPreselectedProductId(productId);
    }
    setSelectedKey('add-variant');
    window.location.hash = '#add-variant';
  };

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash !== selectedKey) {
        // Only reset product/variant selection for specific navigation items
        if (hash === 'home' || hash === 'all-products' || hash === 'add-product' || hash === 'add-variant') {
          setSelectedProductId(null);
          setSelectedVariantId(null);
          if (hash !== 'add-variant') {
            setPreselectedProductId(null);
          }
        }
        setSelectedKey(hash);
      }
    };

    // Set initial hash
    if (!window.location.hash) {
      window.location.hash = '#home';
    } else {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedKey]);

  const menuItems: MenuItem[] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      component: (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={2}>Hair Shop Admin</Title>
          <p>Welcome to the Hair Shop Admin Panel</p>
          <p>Use the navigation menu to manage products and variants.</p>
        </div>
      ),
    },
    {
      key: 'all-products',
      icon: <ShoppingOutlined />,
      label: 'All Products',
      component: <AllProducts onProductSelect={handleProductSelect} onNavigate={(key) => setSelectedKey(key)} />,
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
      component: <AddVariant preselectedProductId={preselectedProductId || undefined} />,
    },
  ];

  // Add dynamic components for product and variant details
  if (selectedKey === 'product-detail' && selectedProductId) {
    menuItems.push({
      key: 'product-detail',
      icon: <EditOutlined />,
      label: 'Product Detail',
      component: <ProductDetail productId={selectedProductId} onBack={handleBack} onVariantSelect={handleVariantSelect} onNavigate={(key) => setSelectedKey(key)} onNavigateToAddVariant={handleNavigateToAddVariant} />,
    });
  }

  if (selectedKey === 'variant-detail' && selectedVariantId) {
    menuItems.push({
      key: 'variant-detail',
      icon: <EditOutlined />,
      label: 'Variant Detail',
      component: <VariantDetail variantId={selectedVariantId} onBack={handleBack} />,
    });
  }

  const selectedItem = menuItems.find(item => item.key === selectedKey);

  if (!isAuthenticated) {
  return (
    <div>
      <LoginForm onLogin={handleLogin} />
      {loginError && (
  <p style={{ color: 'red', marginTop: '12px' }}>{loginError}</p>
)}
    </div>
  );
}


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
          onClick={({ key }) => {
            setSelectedKey(key);
            window.location.hash = `#${key}`;
          }}
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

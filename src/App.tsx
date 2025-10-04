import { ConfigProvider } from 'antd';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <Layout />
    </ConfigProvider>
  );
}

export default App;
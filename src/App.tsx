import 'antd/dist/reset.css';

import { Layout } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { Playground } from './components/Playground';

function App() {
  return (
    <>
      <Layout>
        <Header className='header'>Playground</Header>

        <Content className='content'>
          <Playground />
        </Content>
      </Layout>
    </>
  );
}

export default App;

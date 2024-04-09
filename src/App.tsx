import { Button, Col, Input, Layout, Radio, Row } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import { load } from 'cheerio';
import cls from 'classnames';
import debounce from 'lodash/debounce';
import { highlight, languages } from 'prismjs';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { ConfigFactory, extract } from './configurable-html-parser/src';
import { samples } from './samples';

import 'antd/dist/reset.css';

import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';

import 'prismjs/themes/prism.min.css';
import './App.css';
import { SampleConfigurationSelect } from './components/SampleConfigurationSelect';

function App() {
  const [fileContents, setFileContents] = useState<string | null>(null);
  const [editorVals, setEditorVals] = useState({
    input: samples.basic.simple.html as string, // html
    config: samples.basic.simple.config as string, // yaml
    output: '', // json
  });
  const onSampleChange = useCallback(
    (sampleName: keyof typeof samples) => {
      for (const category of Object.values(samples)) {
        if (Object.hasOwn(category, sampleName)) {
          const sample = (
            category as Record<string, { html: string; config: string }>
          )[sampleName];

          setEditorVals({
            input: sample.html,
            config: sample.config,
            output: '',
          });
        }
      }
    },
    [setEditorVals]
  );
  const [debounceDuration, setDebounceDuration] = useState<
    '250ms' | '1s' | 'disabled'
  >('250ms');

  const config = useMemo(() => {
    try {
      return ConfigFactory.fromYAML(editorVals.config);
    } catch (err) {
      console.log((err as Error).message);
      return null;
    }
  }, [editorVals.config]);
  const isValidConfig = config !== null;
  const parseHtml = useCallback(() => {
    const $ = load(fileContents ?? editorVals.input);

    const result =
      config === null ? null : extract($, config, 'file://sample.html');

    setEditorVals({
      input: editorVals.input,
      config: editorVals.config,
      output: JSON.stringify(result, null, '  '),
    });
  }, [config, editorVals.config, editorVals.input, fileContents]);
  const debouncedParseHtml = useMemo(() => {
    if (debounceDuration === 'disabled') {
      return debounce(parseHtml, 0);
    }

    return debounce(parseHtml, debounceDuration === '250ms' ? 250 : 1000);
  }, [parseHtml, debounceDuration]);

  const onFileInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files) {
      const [file] = ev.target.files;

      console.log(file);

      const reader = new FileReader();

      reader.readAsText(file, 'utf-8');

      reader.onload = (evt) => setFileContents(evt.target!.result as string);

      reader.onerror = (err) => alert('Dosya okunamadı: ' + err);
    } else {
      setFileContents(null);
    }
  }, []);

  useEffect(() => {
    return () => debouncedParseHtml.cancel();
  }, [debouncedParseHtml]);

  // automatic html parse
  useEffect(() => {
    if (debounceDuration === 'disabled') {
      return;
    }

    debouncedParseHtml();
  }, [parseHtml, debounceDuration, debouncedParseHtml, editorVals]);

  return (
    <>
      <Layout>
        <Header className='header'>Playground</Header>

        <Content className='content'>
          <Row justify='center' gutter={10} style={{ paddingTop: '1em' }}>
            <Col span={21}>
              Sample: <SampleConfigurationSelect onChange={onSampleChange} />
            </Col>
          </Row>
          <Row justify='center' gutter={10} style={{ paddingTop: '1em' }}>
            <Col span={7}>
              <header className='playground-tab-header'>HTML</header>

              <Editor
                className='editor-wrapper'
                value={editorVals.input}
                onValueChange={(code) =>
                  setEditorVals({ ...editorVals, input: code })
                }
                highlight={(code) => highlight(code, languages.html, 'html')}
                padding={10}
                disabled={fileContents !== null}
              />

              <Input
                type='file'
                style={{ marginTop: '1em' }}
                onChange={onFileInputChange}
              />
            </Col>

            <Col span={7}>
              <header className='playground-tab-header'>
                Parser Configuration
              </header>
              <Editor
                className={cls(
                  'editor-wrapper',
                  !isValidConfig && 'invalid-parser-config'
                )}
                value={editorVals.config}
                onValueChange={(code) =>
                  setEditorVals({ ...editorVals, config: code })
                }
                highlight={(code) => highlight(code, languages.yaml, 'yaml')}
                padding={10}
              />
              <Button style={{ marginTop: '1em' }} onClick={parseHtml}>
                Parse
              </Button>{' '}
              Debounce:{' '}
              <Radio.Group
                optionType='button'
                options={[
                  { value: '250ms', label: '250ms' },
                  { value: '1s', label: '1 second' },
                  { value: 'disabled', label: 'Disabled' },
                ]}
                size='small'
                value={debounceDuration}
                onChange={(ev) => setDebounceDuration(ev.target.value)}
              />
            </Col>

            <Col span={7}>
              <header className='playground-tab-header'>Output</header>
              <Editor
                className='editor-wrapper'
                preClassName='editor-highlighted-pre'
                value={editorVals.output}
                onValueChange={(code) =>
                  setEditorVals({ ...editorVals, output: code })
                }
                highlight={(code) => highlight(code, languages.json, 'json')}
                padding={10}
                textareaClassName='editor-highlighted'
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
}

export default App;

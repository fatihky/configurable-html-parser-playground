import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Layout, Row } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import Editor from "react-simple-code-editor";
import { ConfigFactory, extract } from "configurable-html-parser";
import { highlight, languages } from "prismjs/components/prism-core";
import { load } from "cheerio";
import cls from 'classnames'

import './App.css'

const debounce = require('lodash.debounce');

const samples = {
  basic: {
    simple: {
      html: `<div class="foo">Hello World!</div>`,
      config: `selector: .foo`,
    },
    getNumber: {
      html: `<div class="foo">123</div>`,
      config: `selector: .foo
transform: number`,
    },
    trim: {
      html: `<div class="foo">    Hello World!   </div>`,
      config: `selector: .foo
transform: trim # try commenting-out this see non-trimmed result`,
    },
    attr: {
      html: `<div foo="bar">Hello World!</div>`,
      config: `selector: div
transform: attr(foo)`,
    },
    attrMulti: {
      html: `<div foo="aaa" bar="bbb">Hello World!</div>`,
      config: `selector: div
transform: attr(foo, bar)`,
    },
    attrAll: {
      html: `<div foo="aaa" bar="bbb">Hello World!</div>`,
      config: `selector: div
transform: attr()`,
    },
  },
  intermediate: {
    html: {
      html: `<div class="foo">
  <span>Hello world!</span>
</div>`,
      config: `selector: .foo
transform: html
`,
    },
    $self: {
      html: `<div class="foo">
  Hello <span>World!</span>
</div>`,
      config: `selector: $self`,
    },
    html$self: {
      html: `<div class="foo">
  <div>
    Hello <span>World!</span>
  </div>
</div>`,
      config: `selector: .foo
properties:
  innerHTML:
    selector: $self
    transform: html`,
    },
    multiTransform: {
      html: `<span foo="123">Hello World!</span>`,
      config: `selector: span
transform: [attr(foo), number]`
    },
  },
  advanced: {
    union: {
      html: `<div>Hello </div><span>World!</span>`,
      config: `union: # union must be the only config property
  - selector: p # the first config, will search for p element
  - selector: a # the second config. searches a elements and converts these to number
    transform: number
  - selector: div, span # both of div's and span's will be matched.`,
    },
    unionDefault: {
      html: `<div>Hello </div><span>World!</span>`,
      config: `union: # union must be the only config property
  - selector: p # the first config, will search for p element
  - selector: a # the second config. searches a elements and converts these to number
    transform: number
  - selector: non-existent
  # $self will always be matched, so this will be
  # the default if any of the configs above don't match
  - selector: $self
    properties:
      foo: { constant: nothing-matched }`
    },
  },
};

function App() {
  const [editorVals, setEditorVals] = useState({
    input: samples.basic.simple.html, // html
    config: samples.basic.simple.config, // yaml
    output: "", // json
  });
  const onSampleChange = useCallback(
    (sampleName: string) => {
      for (const category of Object.values(samples)) {
        if (Object.hasOwn(category, sampleName)) {
          const sample = (category as any)[sampleName];

          setEditorVals({
            input: sample.html,
            config: sample.config,
            output: "",
          });
        }
      }
    },
    [setEditorVals]
  );
  const $ = useMemo(() => {
    return load(editorVals.input);
  }, [editorVals.input]);
  const config = useMemo(() => {
    try {
      return ConfigFactory.fromYAML(editorVals.config);
    } catch (err) {
      console.log((err as any).message);
      return null;
    }
  }, [editorVals.config]);
  const isValidConfig = config !== null;

  const inputChangeHandler = () => {
    const result = config === null
      ? null
      : extract($, config);

    setEditorVals({
      input: editorVals.input,
      config: editorVals.config,
      output: JSON.stringify(result, null, "  "),
    });
  };
  const debouncedInputChangeHandler = useMemo(
    () => debounce(inputChangeHandler, 500)
    , [$, config, editorVals.input, editorVals.config, setEditorVals]);

  useEffect(debouncedInputChangeHandler, [$, config, editorVals.input, editorVals.config, setEditorVals]);

  useEffect(() => {
    return () =>
      debouncedInputChangeHandler.cancel()
  }, [debouncedInputChangeHandler]);

  return (
    <>
      <Layout>
        <Header className="header">
          Playground
          <select
            onChange={(ev) => onSampleChange(ev.target.value)}
            className="preset-selector"
          >
            <optgroup label="Basic">
              <option value="simple">Simple</option>
              <option value="getNumber">Get Number</option>
              <option value="trim">Trim</option>
              <option value="attr">Get Attribute</option>
              <option value="attrMulti">Get Multiple Attributes</option>
              <option value="attrAll">Get All Attributes</option>
            </optgroup>
            <optgroup label="Intermediate">
              <option value="html">Get Inner HTML</option>
              <option value="$self">$self selector</option>
              <option value="html$self">Get Parent Selector's Inner HTML</option>
              <option value="multiTransform">Multiple Transformers</option>
            </optgroup>
            <optgroup label="Advanced">
              <option value="union">Union Configuration</option>
              <option value="unionDefault">Union Configuration With Default Case</option>
            </optgroup>
          </select>
        </Header>

        <Content className="content" >
          <Row justify='center' gutter={10} >
            <Col span={7}>
              <header className="playground-tab-header">HTML</header>

              <Editor
                className="editor-wrapper"
                value={editorVals.input}
                onValueChange={(code) =>
                  setEditorVals({ ...editorVals, input: code })
                }
                highlight={(code) => highlight(code, languages.html)}
                padding={10}
              />
            </Col>

            <Col span={7}>
              <header className="playground-tab-header">Parser Configuration</header>
              <Editor
                className={cls('editor-wrapper', (!isValidConfig) && 'invalid-parser-config')}
                value={editorVals.config}
                onValueChange={(code) =>
                  setEditorVals({ ...editorVals, config: code })
                }
                highlight={(code) => highlight(code, languages.yaml)}
                padding={10}
              />
            </Col>

            <Col span={7}>
              <header className="playground-tab-header">Output</header>
              <Editor
                className="editor-wrapper"
                value={editorVals.output}
                onValueChange={(code) =>
                  setEditorVals({ ...editorVals, output: code })
                }
                highlight={(code) => highlight(code, languages.js)}
                padding={10}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    </>
  );
}

export default App;

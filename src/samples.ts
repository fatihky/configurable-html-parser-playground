export const samples = {
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
    parentHTML: {
      html: `<div class="foo">
  <div>
    Hello <span>World!</span>
  </div>
</div>`,
      config: `selector: .foo
properties:
  innerHTML:
    transform: html`,
    },
    multiTransform: {
      html: `<span foo="123">Hello World!</span>`,
      config: `selector: span
transform: [attr(foo), number]`,
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
  # the default if any of the configs above don't match
  # (selector was not passed)
  - properties:
      foo: { constant: nothing-matched }`,
    },
  },
} as const;

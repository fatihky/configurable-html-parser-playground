declare module 'prismjs/components/prism-core' {
  declare const languages: { [key: string]: any }
  declare function highlight(code: string, lang: any)
}

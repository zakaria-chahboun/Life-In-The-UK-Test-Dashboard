<script>
  import "highlight.js/styles/github.css";
  import "github-markdown-css";
  import hljs from "highlight.js";
  import { marked } from "marked";

  let source = `
# H1 heading

## H2 heading

### H3 heading

--------

**bold text**

*italicized text*

this is a \`tag\`

--------

1. First item
2. Second item
3. Third item

- First item
  - child 1
  - child 2
- Second item
- Third item

[Link](https://svelte.dev/)

![avatar image](https://www.gravatar.com/avatar/81a148e10b30cbf52db1d45a3e133328)

\`\`\`js
let name = 'zaki'
\`\`\`

|animal|cuteness|
|----------|--------------|
|cat|95%|
|dog|45%|

> this is a note
>> this is a nested note
>>> ....
`;
  marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: "hljs language-", // highlight.js css expects a top-level 'hljs' class.
    pedantic: false,
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    xhtml: false,
  });

  $: viwer = marked.parse(source);
</script>

<div class="tile">
  <!-- ** section 1: Editor ** -->
  <div class="tile is-vertical mx-4 i-2">
    <h1 class="title is-3">Blog Editor</h1>
    <div class="box">
      <textarea spellcheck="false" class="editor" bind:value={source} />
      <!-- Clean editor -->
      <button class="button is-fullwidth is-info" on:click={() => (source = "")}>
        <span class="icon">
          <i class="fa fa-broom" />
        </span>
        <span>Clean</span>
      </button>
    </div>
  </div>
  <!-- ** section 1: Viwer ** -->
  <div class="tile is-vertical mx-4">
    <h1 class="title is-3">Viwer</h1>
    <div class="box">
      <article class="full-height markdown-body">
        {@html viwer}
      </article>
      <!-- Send Blog Post -->
      <button class="button is-fullwidth is-info" on:click={() => (source = "")}>
        <span class="icon">
          <i class="fa fa-paper-plane" />
        </span>
        <span>Post</span>
      </button>
    </div>
  </div>
</div>

<style>
  .full-height {
    height: 70vh;
    overflow: auto;
  }

  .editor {
    width: 100%;
    height: 70vh;
    padding: 2rem;
    font-family: Courier;
    color: #484848;
  }

  /* github-markdown-css */
  .markdown-body {
    box-sizing: border-box;
    min-width: 200px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
  }
  /* github-markdown-css */
  @media (max-width: 767px) {
    .markdown-body {
      padding: 15px;
    }
  }
</style>

[plugin:vite:react-babel] /home/project/src/pages/Page11.tsx: Missing semicolon. (1:3)

  4 | import { useNavigate } from 'react-router-dom';
/home/project/src/pages/Page11.tsx:1:3
1  |  Ah! The issue is that the bullet points (•) in the template strings are being interpreted as code. We need to escape them or use regular dashes. Let me fix that:
   |     ^
2  |  
3  |  ```typescript
    at constructor (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:362:19)
    at TypeScriptParserMixin.raise (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:3259:19)
    at TypeScriptParserMixin.semicolon (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:3585:10)
    at TypeScriptParserMixin.parseExpressionStatement (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:12765:10)
    at TypeScriptParserMixin.parseExpressionStatement (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:9241:26)
    at TypeScriptParserMixin.parseStatementContent (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:12380:19)
    at TypeScriptParserMixin.parseStatementContent (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:9157:18)
    at TypeScriptParserMixin.parseStatementLike (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:12243:17)
    at TypeScriptParserMixin.parseModuleItem (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:12220:17)
    at TypeScriptParserMixin.parseBlockOrModuleBlockBody (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:12796:36
Click outside, press Esc key, or fix the code to dismiss.
You can also disable this overlay by setting server.hmr.overlay to false in vite.config.ts.
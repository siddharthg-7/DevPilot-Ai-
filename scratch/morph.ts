import { Project, SyntaxKind, CallExpression, PropertyAccessExpression } from "ts-morph";

const project = new Project();
const sourceFile = project.addSourceFileAtPath("c:/project-self-1/DevPilot AI/server/index.ts");

// 1. Replace the import
const importDecl = sourceFile.getImportDeclaration(d => d.getModuleSpecifierValue() === "./db.js");
if (importDecl) {
  importDecl.remove();
  sourceFile.insertStatements(0, `import pool from "./db.js";\nconst db = pool;`);
}

// 2. Transform DB calls
const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

// We need to do this in reverse or collect them first, because replacing nodes modifies the AST
const callsToTransform: { node: CallExpression, type: 'run' | 'get' | 'all', queryText: string, argsText: string }[] = [];

for (const callExpr of callExpressions) {
  const expr = callExpr.getExpression();
  if (expr.getKind() === SyntaxKind.PropertyAccessExpression) {
    const propAccess = expr as PropertyAccessExpression;
    const name = propAccess.getName();
    if (name === "run" || name === "get" || name === "all") {
      const innerExpr = propAccess.getExpression();
      if (innerExpr.getKind() === SyntaxKind.CallExpression) {
        const innerCall = innerExpr as CallExpression;
        const innerProp = innerCall.getExpression();
        if (innerProp.getKind() === SyntaxKind.PropertyAccessExpression) {
          const innerPropAccess = innerProp as PropertyAccessExpression;
          if (innerPropAccess.getExpression().getText() === "db" && innerPropAccess.getName() === "prepare") {
            const queryArgs = innerCall.getArguments();
            const queryText = queryArgs.length > 0 ? queryArgs[0].getText() : '""';
            
            const outerArgs = callExpr.getArguments();
            const argsText = outerArgs.map(a => a.getText()).join(", ");
            
            callsToTransform.push({
              node: callExpr,
              type: name,
              queryText,
              argsText
            });
          }
        }
      }
    }
  }
}

// Replace from bottom to top to avoid invalidating nodes
for (let i = callsToTransform.length - 1; i >= 0; i--) {
  const { node, type, queryText, argsText } = callsToTransform[i];
  
  let replacement = "";
  let executeCall = argsText.length > 0 ? `await db.execute(${queryText}, [${argsText}])` : `await db.execute(${queryText})`;
  
  if (type === "run") {
    replacement = executeCall;
  } else if (type === "get") {
    replacement = `(${executeCall} as any[])[0][0]`;
  } else if (type === "all") {
    replacement = `(${executeCall} as any[])[0]`;
  }
  
  // Find enclosing arrow function or function expression to make it async
  const enclosingFunc = node.getFirstAncestorByKind(SyntaxKind.ArrowFunction) || node.getFirstAncestorByKind(SyntaxKind.FunctionExpression);
  if (enclosingFunc && !enclosingFunc.isAsync()) {
    enclosingFunc.setIsAsync(true);
  }

  node.replaceWithText(replacement);
}

sourceFile.saveSync();
console.log("AST transformation complete.");

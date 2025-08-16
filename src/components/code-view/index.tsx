/**
 * Code View Component
 * 
 * A syntax-highlighted code display component using Prism.js for highlighting.
 * Supports multiple programming languages with automatic syntax detection
 * and theme-based styling.
 * 
 * Key Features:
 * - Syntax highlighting via Prism.js
 * - Support for TypeScript, JavaScript, JSX, and TSX
 * - Automatic re-highlighting on content changes
 * - Custom theme styling via CSS
 * - Responsive text sizing
 * - Seamless background integration
 * 
 * Supported Languages:
 * - TypeScript (.ts, .tsx)
 * - JavaScript (.js, .jsx)
 * - And other languages supported by Prism.js
 */

import { useEffect } from "react"
import "./code-theme.css"
import Prism from "prismjs"

// Import language support for common web technologies
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"

/**
 * Props for CodeView component
 */
interface Props {
    /** The source code to display and highlight */
    code: string
    /** Programming language identifier for syntax highlighting */
    lang: string
}

/**
 * CodeView Component
 * 
 * Renders source code with syntax highlighting using Prism.js.
 * Automatically re-highlights content when code or language changes.
 * 
 * Features:
 * - Real-time syntax highlighting
 * - Language-specific color schemes
 * - Responsive text sizing (text-xs)
 * - Transparent background for theme integration
 * - No margins/padding for seamless embedding
 * 
 * @param code - The source code string to display
 * @param lang - Language identifier (e.g., 'typescript', 'javascript', 'jsx')
 * 
 * @example
 * <CodeView 
 *   code="const hello = 'world';" 
 *   lang="javascript" 
 * />
 */
export const CodeView = ({ code, lang }: Props) => {

    /**
     * Effect to trigger Prism.js highlighting when content changes
     * Re-runs whenever code or language changes to ensure proper highlighting
     */
    useEffect(() => {
        Prism.highlightAll()
    }, [code, lang])

    return (
        <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
            <code className={`language-${lang}`}>{code}</code>
        </pre>
    )
};
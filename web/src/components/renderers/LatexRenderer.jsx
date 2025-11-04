import { useState, useEffect, useRef } from 'react';
import { CustomLoader } from '../custom-loader';
import VsCodeEditor from '../editors/vscode-editor';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { toPng } from 'html-to-image';

const LatexRenderer = ({ content, onEditorChange, onSvgChange }) => {
  const [latexCode, setLatexCode] = useState(content || '');
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [renderedLatex, setRenderedLatex] = useState('');

  const previewRef = useRef(null);

  const handleCodeChange = (value) => {
    const val = value || '';
    setLatexCode(val);
    onEditorChange?.(val);
  };

  useEffect(() => {
    setLatexCode(content || '');
  }, [content]);

  useEffect(() => {
    try {
      const html = katex.renderToString(latexCode, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      });
      setRenderedLatex(html);
    } catch (error) {
      setRenderedLatex(`<pre style="color: red;">Error rendering LaTeX: ${error?.message}</pre>`);
      onSvgChange?.(null);
    }
  }, [latexCode]);

  useEffect(() => {
    if (!renderedLatex || !previewRef.current) return;

    const convertToImage = async () => {
      await new Promise((r) => requestAnimationFrame(r));

      try {
        const dataUrl = await toPng(previewRef.current, {
          pixelRatio: 3,
          cacheBust: true,
        });

        const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <image href="${dataUrl}" x="0" y="0" height="100%" width="100%" />
        </svg>`;

        onSvgChange?.(svgData);
      } catch (error) {
        console.error('Error converting preview to PNG:', error);
        onSvgChange?.(null);
      }
    };

    convertToImage();
  }, [renderedLatex]);

  return (
    <div className="relative flex flex-row h-[480px]">
      {isEditorLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-gray-900">
          <CustomLoader />
        </div>
      )}

      <div
        className={`w-[30%] min-w-[540px] transition-opacity duration-300 ${
          isEditorLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <VsCodeEditor
          language="latex"
          value={latexCode}
          onChange={handleCodeChange}
          height="100%"
          theme="vs-dark"
          onMount={() => setIsEditorLoading(false)}
        />
      </div>

      <div
        className={`flex-1 flex flex-col overflow-hidden pl-2 max-h-screen box-border transition-opacity duration-300 ${
          isEditorLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <h2 className="mb-2 text-gray-600 font-semibold">LaTeX Preview</h2>
        <div className="flex justify-center items-start">
          <div
            ref={previewRef}
            style={{
              display: 'inline-block',
              padding: '8px',
              backgroundColor: 'white',
              fontSize: '1.2rem',
              fontFamily: 'KaTeX_Main, serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              width: 'fit-content',
              height: 'fit-content',
              maxWidth: 'none',
              overflow: 'visible',
              whiteSpace: 'nowrap',
            }}
            dangerouslySetInnerHTML={{ __html: renderedLatex }}
          />
        </div>
      </div>
    </div>
  );
};

export default LatexRenderer;

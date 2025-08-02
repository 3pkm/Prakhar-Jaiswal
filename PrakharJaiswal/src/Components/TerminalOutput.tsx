import { useState, useEffect } from 'react';

interface TerminalOutputProps {
  command: string;
  output: string | string[];
  timestamp: Date;
  theme?: 'default' | 'matrix' | 'retro';
  onTyping?: () => void;
}

export const TerminalOutput = ({ command, output, timestamp, theme = 'default', onTyping }: TerminalOutputProps) => {
  const [displayedOutput, setDisplayedOutput] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!output || (Array.isArray(output) && output.length === 0)) {
      setDisplayedOutput([]);
      return;
    }

    const outputArray = Array.isArray(output) ? output : [output];
    
    if (outputArray.length === 0) {
      setDisplayedOutput([]);
      return;
    }

    setIsTyping(true);
    setDisplayedOutput([]);

    let currentLineIndex = 0;
    let currentCharIndex = 0;
    let currentDisplayedLines: string[] = [];

    const typeInterval = setInterval(() => {
      if (currentLineIndex >= outputArray.length) {
        setIsTyping(false);
        clearInterval(typeInterval);
        return;
      }

      const currentLine = outputArray[currentLineIndex];
      
      if (currentCharIndex <= currentLine.length) {
        const partialLine = currentLine.substring(0, currentCharIndex);
        currentDisplayedLines = [
          ...currentDisplayedLines.slice(0, currentLineIndex),
          partialLine
        ];
        setDisplayedOutput([...currentDisplayedLines]);
        onTyping?.(); // Trigger scroll during typing
        currentCharIndex++;
      } else {
        currentLineIndex++;
        currentCharIndex = 0;
        currentDisplayedLines.push('');
      }
    }, Math.random() * 20 + 10); // Variable typing speed for more natural feel

    return () => clearInterval(typeInterval);
  }, [output]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!command && !output) return null;

  // Theme-based color classes
  const getThemeTextColor = (type: string) => {
    const baseClasses = {
      prompt: theme === 'matrix' ? 'text-green-400' : theme === 'retro' ? 'text-amber-400' : 'text-terminal-prompt',
      text: theme === 'matrix' ? 'text-green-300' : theme === 'retro' ? 'text-amber-300' : 'text-terminal-text',
      accent: theme === 'matrix' ? 'text-green-500' : theme === 'retro' ? 'text-amber-500' : 'text-terminal-cyan',
      error: theme === 'matrix' ? 'text-red-400' : theme === 'retro' ? 'text-red-400' : 'text-terminal-red'
    };
    return baseClasses[type as keyof typeof baseClasses] || baseClasses.text;
  };

  return (
    <div className="mb-2">
      {command && (
        <div className="flex items-center mb-1">
          <span className={`${getThemeTextColor('prompt')} terminal-glow mr-2`}>
            user@portfolio:~$
          </span>
          <span className={getThemeTextColor('text')}>{command}</span>
          <span className={`ml-auto text-xs ${getThemeTextColor('prompt')}/60`}>
            {formatTime(timestamp)}
          </span>
        </div>
      )}
      
      {displayedOutput.length > 0 && (
        <div className={`${getThemeTextColor('text')} ml-4 mb-2`}>
          {displayedOutput.map((line, index) => (
            <div key={index} className="leading-relaxed">
              {line.startsWith('╔') || line.startsWith('║') || line.startsWith('╚') || line.startsWith('█') ? (
                <span className={`${getThemeTextColor('prompt')} terminal-glow`}>{line}</span>
              ) : line.startsWith('📱') || line.startsWith('🚀') || line.startsWith('🌐') || line.startsWith('🤖') ? (
                <span className={`${getThemeTextColor('accent')} terminal-glow`}>{line}</span>
              ) : line.startsWith('💻') || line.startsWith('🔧') || line.startsWith('🗄️') || line.startsWith('☁️') ? (
                <span className={`${getThemeTextColor('accent')} terminal-glow`}>{line}</span>
              ) : line.startsWith('🏢') || line.startsWith('💼') || line.startsWith('🎓') ? (
                <span className={`${getThemeTextColor('accent')} terminal-glow`}>{line}</span>
              ) : line.startsWith('📧') || line.startsWith('🐙') || line.startsWith('🐦') || line.startsWith('🌐') || line.startsWith('🔗') ? (
                <span className={`${getThemeTextColor('prompt')} terminal-glow hover:underline cursor-pointer`}>{line}</span>
              ) : line.startsWith('  ') || line.startsWith('   •') ? (
                <span className={`${getThemeTextColor('text')}/80`}>{line}</span>
              ) : line.includes('Available commands:') || line.includes('Technical Skills:') || line.includes('Professional Experience:') || line.includes(':') && (line.includes('📋') || line.includes('🖥️') || line.includes('🎨') || line.includes('🎮')) ? (
                <span className={`${getThemeTextColor('prompt')} terminal-glow font-bold`}>{line}</span>
              ) : line.includes('Command not found:') || line.includes('not found') || line.includes('Error:') ? (
                <span className={`${getThemeTextColor('error')} terminal-glow`}>{line}</span>
              ) : line.includes('████') ? (
                <span className={`${getThemeTextColor('accent')} font-mono`}>{line}</span>
              ) : line.includes('🟢') || line.includes('Wake up') || line.includes('Matrix') ? (
                <span className={`${theme === 'matrix' ? 'text-green-400' : getThemeTextColor('accent')} terminal-glow animate-pulse`}>{line}</span>
              ) : (
                <span className={getThemeTextColor('text')}>{line}</span>
              )}
            </div>
          ))}
          {isTyping && (
            <span className={`${getThemeTextColor('prompt')} cursor-blink`}>█</span>
          )}
        </div>
      )}
    </div>
  );
};
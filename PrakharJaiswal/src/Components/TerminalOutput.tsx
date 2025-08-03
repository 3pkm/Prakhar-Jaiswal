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
    }, Math.random() * 10 + 10); // Variable typing speed for more natural feel

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

  // Helper function to make links clickable and apply styling
  const renderLineWithLinks = (line: string, index: number) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    if (urlRegex.test(line)) {
      const parts = line.split(urlRegex);
      return (
        <div key={index} className="leading-relaxed">
          {parts.map((part, partIndex) => {
            if (urlRegex.test(part)) {
              return (
                <a
                  key={partIndex}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${getThemeTextColor('prompt')} terminal-glow underline hover:brightness-125 cursor-pointer transition-all duration-200`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {part}
                </a>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </div>
      );
    }

    // Apply styling based on line content
    const getLineStyle = () => {
      // Box drawing characters
      if (line.match(/^[╔╗╚╝║═├┤┌┐└┘│─┬┴┼]/)) {
        return `${getThemeTextColor('prompt')} terminal-glow font-bold`;
      }
      // Project titles with 📦
      if (line.includes('📦') && !line.includes('Technologies') && !line.includes('Repository')) {
        return `${getThemeTextColor('accent')} terminal-glow font-bold text-lg`;
      }
      // Technology lines with ⚡
      if (line.includes('⚡ Technologies:')) {
        return `${theme === 'matrix' ? 'text-yellow-400' : theme === 'retro' ? 'text-yellow-300' : 'text-yellow-400'} terminal-glow`;
      }
      // Link lines with 🔗
      if (line.includes('🔗')) {
        return `${getThemeTextColor('prompt')} terminal-glow`;
      }
      // Section headers
      if (line.includes('MY NOTABLE PROJECTS')) {
        return `${getThemeTextColor('accent')} terminal-glow font-bold text-center`;
      }
      // Tips and hints
      if (line.includes('💡 Tip:')) {
        return `${theme === 'matrix' ? 'text-cyan-400' : theme === 'retro' ? 'text-cyan-300' : 'text-cyan-400'} terminal-glow italic`;
      }
      // Error messages
      if (line.includes('Command not found:') || line.includes('not found') || line.includes('Error:')) {
        return `${getThemeTextColor('error')} terminal-glow`;
      }
      // Progress bars
      if (line.includes('████')) {
        return `${getThemeTextColor('accent')} font-mono`;
      }
      // Matrix-style lines
      if (line.includes('🟢') || line.includes('Wake up') || line.includes('Matrix')) {
        return `${theme === 'matrix' ? 'text-green-400' : getThemeTextColor('accent')} terminal-glow animate-pulse`;
      }
      // Command help sections
      if (line.includes('Available commands:') || line.includes('Technical Skills:') || line.includes('Professional Experience:') || (line.includes(':') && (line.includes('📋') || line.includes('🖥️') || line.includes('🎨') || line.includes('🎮')))) {
        return `${getThemeTextColor('prompt')} terminal-glow font-bold`;
      }
      // Indented items
      if (line.startsWith('  ') || line.startsWith('   •')) {
        return `${getThemeTextColor('text')}/80`;
      }
      // Default styling
      return getThemeTextColor('text');
    };

    return (
      <div key={index} className="leading-relaxed">
        <span className={getLineStyle()}>{line}</span>
      </div>
    );
  };

  if (!command && !output) return null;

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
        <div className={`${getThemeTextColor('text')} ml-4 mb-2 space-y-1`}>
          {displayedOutput.map((line, index) => renderLineWithLinks(line, index))}
          {isTyping && (
            <span className={`${getThemeTextColor('prompt')} cursor-blink`}>█</span>
          )}
        </div>
      )}
    </div>
  );
};

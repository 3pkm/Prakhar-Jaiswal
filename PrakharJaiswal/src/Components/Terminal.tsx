import { useState, useEffect, useRef, useCallback } from 'react';
import { TerminalOutput } from './TerminalOutput';

interface TerminalLine {
  id: string;
  command: string;
  output: string | string[];
  timestamp: Date;
}

interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemItem[];
}

const Terminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('terminal-command-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [theme, setTheme] = useState<'default' | 'matrix' | 'retro'>('matrix');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // File system simulation
  const fileSystem: FileSystemItem = {
    name: 'home',
    type: 'directory',
    children: [
      {
        name: 'user',
        type: 'directory',
        children: [
          { name: 'resume.txt', type: 'file', content: 'Download my resume: https://example.com/resume.pdf' },
          { name: 'projects.txt', type: 'file', content: 'My projects are listed in the projects command' },
          { name: 'about.txt', type: 'file', content: 'Learn more about me with the about command' },
          {
            name: 'games',
            type: 'directory',
            children: [
              { name: 'guess.txt', type: 'file', content: 'Number guessing game' },
              { name: 'quiz.txt', type: 'file', content: 'Tech quiz game' }
            ]
          }
        ]
      }
    ]
  };

  const asciiArt = String.raw
  `
__________                __   .__                        ____.      .__                        .__   
\______   \____________  |  | _|  |__ _____ _______      |    |____  |__| ________  _  _______  |  |  
 |     ___/\_  __ \__  \ |  |/ /  |  \\__  \\_  __ \     |    \__  \ |  |/  ___/\ \/ \/ /\__  \ |  |  
 |    |     |  | \// __ \|    <|   Y  \/ __ \|  | \/ /\__|    |/ __ \|  |\___ \  \     /  / __ \|  |__
 |____|     |__|  (____  /__|_ \___|  (____  /__|    \________(____  /__/____  >  \/\_/  (____  /____/
                       \/     \/    \/     \/                      \/        \/               \/      
  `.replace(/ /g, '\u00A0');
//   const asciiArt = String.raw
//   `
// ________         __
// \_____  \______ |  | __ _____  
//   _(__  <\____ \|  |/ //     \ 
//  /       \  |_> >    <|  Y Y  \
// /______  /   __/|__|_ \__|_|  /
//        \/|__|        \/     \/ 
//   `.replace(/ /g, '\u00A0');
  
    // Enhanced command system
    const allCommands = [
     'help', 'about', 'projects', 'skills', 'contact', 'experience', 'clear',
     'whoami', 'history', 'resume', 'theme', 'matrix', 'games',
     'cls', 'weather', 'social', 'banner'
    ];

    const commands = {
     help: () => [
      'Available commands:',
      '',
      '📋 Information:',
      '  about      - Learn more about me',
      '  projects   - View my projects',
      '  skills     - See my technical skills',
      '  contact    - Get my contact information',
      '  experience - View my work experience',
      '  resume     - View/download my resume',
      '',
      '🖥️  System:',
      '  whoami     - Display current user',
      '  clear/cls  - Clear the terminal',
      '  history    - Show command history',
      '',
      '🎨 Customization:',
      '  theme [name] - Change color theme (default/matrix/retro)',
      '',
      '🎮 Fun:',
      '  games      - Play interactive games',
      '  matrix     - Enter the matrix',
      '  weather    - Check the weather',
      '  social     - Social media links',
      '',
      'Tips: Use Tab for autocomplete, ↑↓ for command history'
     ],

     about: () => [
      'Hello! there people I\'m Prakhar Jaiswal a full-stack developer.',
      '',
      'My place of production is M.P and currently existing in Pune,',
      'My hobbies are Cycling, Listening To Music and Existing',
      'In my free time I try to finish the projects that I am working on.',
      '',
      'When I\'m not coding, you can find me exploring new technologies or drinking Chai,',
      'trying to contribute to open source projects, or sharing knowledge with the developer community.',
      '',
     ],

     projects: () => [
      '╔═══════════════════════════════════════════════════════════════════════════════╗',
      '║                             MY NOTABLE PROJECTS                            ',
      '╚═══════════════════════════════════════════════════════════════════════════════╝',
      '',
      '┌─────────────────────────────────────────────────────────────────────────────┐',
      '│  ADVISOR-OP                                                              ',
      '├─────────────────────────────────────────────────────────────────────────────┤',
      '│   A Gemini-powered wrapper designed to address the growing               ',
      '│   mental health concerns with AI-driven advisory solutions.             ',
      '│                                                                         ',
      '│   ⚡ Technologies: HTML, CSS, JS, Django, React, SQLite, Gemini API     ',
      '│   🔗 Repository: https://github.com/3pkm/AdvisorOP                       ',
      '└─────────────────────────────────────────────────────────────────────────────┘',
      '',
      '',
      '┌─────────────────────────────────────────────────────────────────────────────┐',
      '│  INVESTMENT-HANDELLER                                                    ',
      '├─────────────────────────────────────────────────────────────────────────────┤',
      '│   A comprehensive tool for tracking investments, performing financial    ',
      '│   calculations, and managing investment portfolios efficiently.          ',
      '│                                                                         ',
      '│   ⚡ Technologies: Django, DjangoAuth, Bootstrap, SQLite, Chart.js       ',
      '│   🔗 Repository: https://github.com/3pkm/Investment-Handeller            ',
      '└─────────────────────────────────────────────────────────────────────────────┘',
      '',
      '',
      '┌─────────────────────────────────────────────────────────────────────────────┐',
      '│  AUTOCOMPELETE                                                           ',
      '├─────────────────────────────────────────────────────────────────────────────┤',
      '│   A Windows automation tool that allows users to create custom          ',
      '│   keywords linked to commands/scripts for multi-step task automation.   ',
      '│                                                                         ',
      '│   ⚡ Technologies: Python, Batch Scripting, tkinter, pyinstaller        ',
      '│   🔗 Repository: https://github.com/3pkm/Autocompelete                  ',
      '└─────────────────────────────────────────────────────────────────────────────┘',
      '',
      '',
      '┌─────────────────────────────────────────────────────────────────────────────┐',
      '│  REAL-TIME MULTI-MODAL THREAT DETECTION SYSTEM                          ',
      '├─────────────────────────────────────────────────────────────────────────────┤',
      '│   Advanced surveillance system addressing rising violent attacks and     ',
      '│   human monitoring limitations through AI-powered threat detection.     ',
      '│                                                                         ',
      '│   ⚡ Technologies: Angular, SCSS, Python, TensorFlow, EfficientNetV2,   ',
      '│      YOLO V11                                                           ',
      '│   🔗 Live Demo: https://aryan-dani.github.io/Threat_Detection_System/   ',
      '│      dashboard                                                          ',
      '└─────────────────────────────────────────────────────────────────────────────┘',
      '',
      '',
      '💡 Tip: Click any 🔗 link to open the project in a new tab!'
     ],

     skills: () => [
      'Technical Skills:',
      '',
      '💻 Frontend:',
      '   • React, Angular',
      '   • TypeScript, JavaScript (ES6+)',
      '   • HTML5, CSS3, Sass/SCSS',
      '   • Tailwind CSS, Bootstrap',
      '   • Vite',
      '',
      '🔧 Backend:',
      '   • Python, Django',
      '   • RESTful APIs',
      '',
      '🗄️ Database:',
      '   • MySQL',
     ],

     contact: () => [
      'Let\'s connect! 📫',
      '',
      '📧 Email (fastest response): jas.prakhar@gmail.com',
      '💼 LinkedIn (professional inquiries): https://bit.ly/47bREhS',
      '🐙 GitHub (code collaboration): https://github.com/3pkm',
      '',
      'I\'m always open to interesting conversations and collaboration opportunities!',
     ],

     experience: () => [
      'Professional Experience:',
      '',
      '🏢 Senior Frontend Developer | TechCorp (2022-Present)',
      '   • Led development of customer-facing web applications',
      '   • Improved performance by 40% through optimization',
      '   • Mentored junior developers and conducted code reviews',
      '   • Implemented modern CI/CD pipelines',
      '',
      '💼 Full-Stack Developer | StartupXYZ (2020-2022)',
      '   • Built entire product from MVP to production',
      '   • Implemented CI/CD pipelines and testing strategies',
      '   • Collaborated with design and product teams',
      '   • Scaled application to serve 10k+ users',
      '',
      '🎓 Junior Developer | WebAgency (2019-2020)',
      '   • Developed responsive websites for various clients',
      '   • Learned modern development practices and workflows',
      '   • Contributed to internal tool development',
      '   • Gained experience with multiple tech stacks'
     ],

     ls: (path?: string) => {
      const currentPath = path || currentDirectory;
      if (currentPath === '/home/user') {
      return [
       'total 4',
       'drwxr-xr-x  2 user user 4096 Jan 15 12:30 games/',
       '-rw-r--r--  1 user user  124 Jan 15 12:30 about.txt',
       '-rw-r--r--  1 user user  256 Jan 15 12:30 projects.txt',
       '-rw-r--r--  1 user user   89 Jan 15 12:30 resume.txt'
      ];
      } else if (currentPath === '/home/user/games') {
      return [
       'total 2',
       '-rw-r--r--  1 user user   45 Jan 15 12:30 guess.txt',
       '-rw-r--r--  1 user user   32 Jan 15 12:30 quiz.txt'
      ];
      }
      return ['Directory not found'];
     },

     pwd: () => [currentDirectory],

     whoami: () => ['user', '', 'Current user: portfolio visitor', 'Access level: guest'],

     cd: (dir?: string) => {
      if (!dir || dir === '~' || dir === '/home/user') {
      setCurrentDirectory('/home/user');
      return [`Changed directory to /home/user`];
      } else if (dir === 'games') {
      setCurrentDirectory('/home/user/games');
      return [`Changed directory to /home/user/games`];
      } else if (dir === '..' && currentDirectory === '/home/user/games') {
      setCurrentDirectory('/home/user');
      return [`Changed directory to /home/user`];
      }
      return [`Directory not found: ${dir}}`];
    },

    cat: (filename?: string) => {
      if (!filename) {
      return ['Usage: cat [filename]', 'Available files: about.txt, projects.txt, resume.txt'];
      }
      
      const files: Record<string, string[]> = {
      'about.txt': ['Learn more about me with the "about" command'],
      'projects.txt': ['View my projects with the "projects" command'],
      'resume.txt': [
        '📄 Resume',
        '==================',
        'Download my full resume:',
        '🔗 https://example.com/resume.pdf',
        '',
        'Or use the "resume" command for more options'
      ],
      'guess.txt': ['Number guessing game - use "games" command to play'],
      'quiz.txt': ['Tech quiz game - use "games" command to play']
      };

      return files[filename] || [`File not found: ${filename}`];
    },

    history: () => {
      if (commandHistory.length === 0) {
      return ['No command history available'];
      }
      return commandHistory.map((cmd, index) => `${index + 1}  ${cmd}`);
    },

    resume: () => [
      '📄 Resume Options:',
      '',
      '1. 📱 Online Version:',
      '   View my interactive resume: https://yourwebsite.com/resume',
      '',
      '2. 📥 Download PDF:',
      '   Download link: https://example.com/resume.pdf',
      '',
      '3. 🔍 Quick Summary:',
      '   Use the "experience" and "skills" commands',
      '',
      '💡 Tip: The PDF version includes detailed project descriptions',
      '   and references from previous employers.'
    ],

    theme: (themeName?: string) => {
      const themes = ['default', 'matrix', 'retro'];
      if (!themeName) {
      return [
        'Available themes:',
        '  • default - Classic terminal theme',
        '  • matrix  - Green matrix-style theme',
        '  • retro   - Vintage amber theme',
        '',
        `Current theme: ${theme}`,
        'Usage: theme [theme-name]'
      ];
      }
      
      if (themes.includes(themeName)) {
      setTheme(themeName as any);
      return [`Theme changed to: ${themeName}`];
      }
      
      return [`Unknown theme: ${themeName}`, `Available themes: ${themes.join(', ')}`];
    },

    matrix: () => {
      setTheme('matrix');
      return [
      '🟢 Entering the Matrix...',
      '',
      '01001000 01100101 01101100 01101100 01101111',
      '01010111 01101111 01110010 01101100 01100100',
      '',
      'Wake up, Neo...',
      'The Matrix has you...',
      'Follow the white rabbit.',
      '',
      '🔓 Access granted to the real world.',
      'Theme switched to Matrix mode.'
      ];
    },

    banner: () => asciiArt.split('\n').filter(line => line.trim()),

    games: () => [
      '🎮 Interactive Games:',
      '',
      '1. 🎯 Number Guessing Game',
      '   I\'m thinking of a number between 1-100',
      '   Type "guess [number]" to play!',
      '',
      '2. 🧠 Tech Quiz',
      '   Test your programming knowledge',
      '   Type "quiz" to start!',
      '',
      '3. 🎲 Random Developer Fact',
      '   Type "fact" for a fun programming fact',
      '',
      'More games coming soon!'
    ],

    weather: () => [
      '🌤️  Current Weather (Demo):',
      '',
      '📍 Location: San Francisco, CA',
      '🌡️  Temperature: 72°F (22°C)',
      '☁️  Condition: Partly Cloudy',
      '💨 Wind: 8 mph NW',
      '💧 Humidity: 65%',
      '',
      '🔮 Note: This is demo data. For real weather,',
      '   integrate with a weather API!'
    ],

    social: () => [
      '🔗 Social Media & Links:',
      '',
      '💼 Professional:',
      '  LinkedIn: https://linkedin.com/in/yourprofile',
      '  GitHub: https://github.com/yourusername',
      '  Portfolio: https://yourwebsite.com',
      '',
      '🌐 Social:',
      '  Twitter: https://twitter.com/yourhandle',
      '  Instagram: @yourhandle',
      '  Blog: https://yourblog.com',
      '',
      '📺 Content:',
      '  YouTube: Your Channel',
      '  Dev.to: @yourusername',
      '  Medium: @yourusername',
      '',
      'Click any link to visit!'
    ],

    clear: () => {
      setHistory([]);
      return [];
    },

    cls: () => {
      setHistory([]);
      return [];
    },

    // Easter eggs and special commands
    guess: (number?: string) => {
      const targetNumber = 42; // Could be randomized
      if (!number) {
      return ['🎯 Guess a number between 1-100!', 'Usage: guess [number]'];
      }
      const guess = parseInt(number);
      if (isNaN(guess)) {
      return ['Please enter a valid number!'];
      }
      if (guess === targetNumber) {
      return ['🎉 Congratulations! You guessed it!', `The number was ${targetNumber}!`];
      } else if (guess < targetNumber) {
      return ['📈 Too low! Try a higher number.'];
      } else {
      return ['📉 Too high! Try a lower number.'];
      }
    },

    quiz: () => [
      '🧠 Tech Quiz Question #1:',
      '',
      'What does "API" stand for?',
      '',
      'A) Application Programming Interface',
      'B) Advanced Programming Integration',
      'C) Automated Process Integration',
      'D) Application Process Interface',
      '',
      'Type your answer (A, B, C, or D):'
    ],

    fact: () => {
      const facts = [
      'The first computer bug was an actual bug found in 1947!',
      'JavaScript was created in just 10 days by Brendan Eich.',
      'The term "debugging" comes from removing actual bugs from computers.',
      'Python is named after Monty Python\'s Flying Circus.',
      'The first programming language was Fortran, created in 1957.',
      'Git was created by Linus Torvalds in just 2 weeks!'
      ];
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      return ['🤓 Fun Programming Fact:', '', randomFact];
    }
    };

  // Enhanced command execution with aliases
  const executeCommand = useCallback((cmd: string) => {
    const [baseCmd, ...args] = cmd.trim().split(' ');
    const trimmedCmd = baseCmd.toLowerCase();
    
    // Command aliases
    const aliases: Record<string, string> = {
      'cls': 'clear',
      'dir': 'ls',
      'type': 'cat'
    };
    
    const actualCmd = aliases[trimmedCmd] || trimmedCmd;
    
    let output: string | string[];
    
    if (actualCmd in commands) {
      output = (commands as any)[actualCmd](...args);
    } else {
      output = [
        `Command not found: ${cmd}`,
        'Type "help" for available commands.',
        '',
        'Did you mean one of these?',
        ...getCommandSuggestions(trimmedCmd)
      ];
    }

    if (actualCmd !== 'clear' && actualCmd !== 'cls') {
      const newLine: TerminalLine = {
        id: Date.now().toString(),
        command: cmd,
        output,
        timestamp: new Date()
      };

      setHistory(prev => [...prev, newLine]);
    }
  }, [currentDirectory, theme]);

  // Command suggestion system
  const getCommandSuggestions = (input: string): string[] => {
    return allCommands
      .filter(cmd => cmd.includes(input))
      .slice(0, 3)
      .map(cmd => `  • ${cmd}`);
  };

  // Tab completion
  const handleTabCompletion = () => {
    const matches = allCommands.filter(cmd => cmd.startsWith(input.toLowerCase()));
    if (matches.length === 1) {
      setInput(matches[0]);
    } else if (matches.length > 1) {
      setSuggestions(matches);
      setTimeout(() => setSuggestions([]), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    executeCommand(input);
    setCommandHistory(prev => {
      const newHistory = [...prev, input];
      localStorage.setItem('terminal-command-history', JSON.stringify(newHistory));
      return newHistory;
    });
    setHistoryIndex(-1);
    setInput('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
      return;
    }

    // Command history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }

    // Keyboard shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case 'c':
          e.preventDefault();
          setInput('');
          break;
        case 'l':
          e.preventDefault();
          executeCommand('clear');
          break;
      }
    }
  };

  // Auto-focus and scroll management
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Welcome message with ASCII art
  useEffect(() => {
    const welcomeOutput = [
      ...asciiArt.split('\n').filter(line => line.trim()),
      '',
      '╔═══════════════════════════════════════════╗',
      '║            Welcome to my Portfolio       ',
      '║                                           ',
      '║  Type "help" to see available commands    ',
      '║  Use Tab for autocomplete                 ',
      '║  Use ↑↓ arrow keys to navigate history   ',
      '╚═══════════════════════════════════════════╝',
      ''
    ];

    const welcomeLine: TerminalLine = {
      id: 'welcome',
      command: '',
      output: welcomeOutput,
      timestamp: new Date()
    };

    setHistory([welcomeLine]);
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  };

  // Theme-based styling
  const getThemeClasses = () => {
    switch (theme) {
      case 'matrix':
        return 'bg-black text-green-400';
      case 'retro':
        return 'bg-black text-amber-400';
      default:
        return 'bg-terminal-bg text-terminal-text';
    }
  };

  return (
    <div 
      className={`h-screen font-mono p-2 sm:p-4 overflow-hidden relative scan-lines ${getThemeClasses()}`}
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Interactive Terminal Portfolio"
    >
      <div className="h-full border border-terminal-prompt terminal-border-glow rounded-sm bg-card/5 backdrop-blur-sm flex flex-col">
        {/* Terminal Header */}
        <div className="p-2 sm:p-4 border-b border-terminal-prompt/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-terminal-red"></div>
              <div className="w-3 h-3 rounded-full bg-terminal-amber"></div>
              <div className="w-3 h-3 rounded-full bg-terminal-prompt"></div>
            </div>
            <div className="text-terminal-prompt text-xs sm:text-sm">
              portfolio@terminal ~ {getCurrentTime()} | Theme: {theme}
            </div>
          </div>
        </div>
        
        {/* Terminal Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 pb-2"
          >
            {history.map((line) => (
              <TerminalOutput 
                key={line.id} 
                command={line.command}
                output={line.output}
                timestamp={line.timestamp}
                theme={theme}
                onTyping={() => {
                  if (terminalRef.current) {
                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                  }
                }}
              />
            ))}
          </div>
          
          {/* Command Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-2 sm:px-4 pb-2">
              <div className="text-terminal-prompt/70 text-sm">
                Suggestions: {suggestions.join(', ')}
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="border-t border-terminal-prompt/20 p-2 sm:p-4 flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="text-terminal-prompt terminal-glow mr-2 whitespace-nowrap">
                user@portfolio:{currentDirectory.split('/').pop()}$
              </span>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none outline-none text-terminal-text terminal-glow"
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="Terminal command input"
                />
                <span 
                  className="text-terminal-cursor cursor-blink absolute top-0" 
                  style={{ left: `${input.length}ch` }}
                >
                  █
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
export type BriefSection = {
    id: string;
    title: string;
    content: string;
    icon: string;
    color: string;
  };

  function normalizeHeading(text: string): string {
    return text
      .toUpperCase()
      .replace(/[*#_`:]/g, '')
      .replace(/&/g, 'AND')
      .replace(/\s+/g, ' ')
      .trim();
  }

  export function parseBrief(briefText: string): BriefSection[] {
    const sections: BriefSection[] = [];

    const sectionConfig = [
      {
        title: 'DECISION BEING MADE',
        icon: '🎯',
        color: 'blue',
        id: 'decision'
      },
      {
        title: 'OPTIONS CONSIDERED',
        icon: '🔀',
        color: 'purple',
        id: 'options'
      },
      {
        title: 'TRADEOFFS',
        icon: '⚖️',
        color: 'indigo',
        id: 'tradeoffs'
      },
      {
        title: 'RECOMMENDED DECISION',
        icon: '✅',
        color: 'green',
        id: 'recommendation'
      },
      {
        title: 'DECISION OWNER',
        icon: '👤',
        color: 'orange',
        id: 'owner'
      },
      {
        title: 'RISKS & WATCHOUTS',
        icon: '⚠️',
        color: 'red',
        id: 'risks'
      },
      {
        title: 'NEXT 3 ACTIONS',
        icon: '📋',
        color: 'teal',
        id: 'actions'
      },
    ];

    // Split by section headings
    const lines = briefText.split('\n');
    let currentSection: BriefSection | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      const normalizedLine = normalizeHeading(trimmedLine);

      // Check if this line is a section header. Match on a normalized form so
      // punctuation drift ("RISKS AND WATCHOUTS") and stray markdown still
      // resolve to the right section, and require the line to be roughly the
      // length of the heading so prose mentioning it isn't mistaken for one.
      const matchedConfig = sectionConfig.find(config => {
        const normalizedTitle = normalizeHeading(config.title);
        return (
          normalizedLine.includes(normalizedTitle) &&
          normalizedLine.length <= normalizedTitle.length + 10
        );
      });

      if (matchedConfig) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          id: matchedConfig.id,
          title: matchedConfig.title,
          content: '',
          icon: matchedConfig.icon,
          color: matchedConfig.color,
        };
      } else if (currentSection && trimmedLine) {
        // Add content to current section
        currentSection.content += line + '\n';
      }
    }

    // Push the last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

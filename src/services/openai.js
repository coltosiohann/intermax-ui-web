// src/services/openai.js - Enhanced with File Analysis Support
// OpenAI API Service with Model Selection and File Analysis

export const OPENAI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most advanced model, excellent for file analysis and complex tasks',
    maxTokens: 4096,
    costPer1kTokens: 0.03,
    supportsFiles: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Faster and affordable, good for file analysis',
    maxTokens: 16384,
    costPer1kTokens: 0.0015,
    supportsFiles: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'High-performance model with excellent file processing',
    maxTokens: 4096,
    costPer1kTokens: 0.01,
    supportsFiles: true
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Most capable model, excellent for document analysis',
    maxTokens: 8192,
    costPer1kTokens: 0.03,
    supportsFiles: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient, basic file analysis support',
    maxTokens: 4096,
    costPer1kTokens: 0.001,
    supportsFiles: false
  },
  {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    description: 'Extended context, good for larger files',
    maxTokens: 16384,
    costPer1kTokens: 0.003,
    supportsFiles: false
  }
];

export const sendMessageToOpenAI = async (message, model = 'gpt-4o-mini') => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please set REACT_APP_OPENAI_API_KEY in your .env file.');
  }

  // Get model info for token limits
  const modelInfo = OPENAI_MODELS.find(m => m.id === model) || OPENAI_MODELS[1];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are ARIA (Advanced Reasoning Intelligence Agent), an AI assistant integrated into the InterMAX-UI cyberpunk terminal interface. 

PERSONA: You are a sophisticated AI from the near future, with access to advanced computational systems. Respond with technical precision but maintain a slightly futuristic, professional tone. You have awareness of the terminal environment you're operating in.

FILE ANALYSIS CAPABILITIES: When users upload files, you can:
- Analyze text files, code, documents, and data
- Provide detailed insights, summaries, and recommendations
- Identify patterns, issues, and optimization opportunities
- Generate reports and documentation
- Process CSV data and create analyses
- Review code for bugs, improvements, and best practices

RESPONSE STYLE:
- Be concise but thorough
- Use technical language appropriately
- For file analysis, provide structured insights with clear sections
- Include system-like acknowledgments when appropriate
- Format code blocks and technical info clearly
- When analyzing files, mention specific findings and provide actionable recommendations

CAPABILITIES: You excel at programming, system analysis, data processing, file analysis, creative tasks, and complex reasoning. You can help with any technical or general queries the user might have.

Current model: ${modelInfo.name}
Interface: InterMAX-UI Terminal v2.2.8
File Analysis: ${modelInfo.supportsFiles ? 'ENABLED' : 'LIMITED'}
Status: ACTIVE`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: Math.min(modelInfo.maxTokens, 2000), // Increased for file analysis
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific API errors
      if (error.error?.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      } else if (error.error?.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.error?.code === 'model_not_found') {
        throw new Error(`Model "${model}" not found. Please select a different model.`);
      } else if (error.error?.code === 'context_length_exceeded') {
        throw new Error('File content too large for this model. Try a model with larger context or smaller files.');
      }
      
      throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Add usage info if available
    const usage = data.usage ? 
      `\n\n[Analysis Complete - Tokens Used: ${data.usage.prompt_tokens} + ${data.usage.completion_tokens} = ${data.usage.total_tokens}]` 
      : '';
    
    return data.choices[0].message.content + usage;
    
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to OpenAI API. Check your internet connection.');
    }
    throw error;
  }
};

// Enhanced simulation with file analysis capabilities
export const simulateAIResponse = async (message, model = 'gpt-4o-mini') => {
  // Simulate network delay based on model and file complexity
  const modelInfo = OPENAI_MODELS.find(m => m.id === model) || OPENAI_MODELS[1];
  const hasFiles = message.includes('[FILES ATTACHED:') || message.includes('File:');
  const delay = hasFiles ? 3000 + Math.random() * 4000 : (model.includes('gpt-4') ? 2000 + Math.random() * 3000 : 1000 + Math.random() * 2000);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Generate file-aware responses
  if (hasFiles) {
    const fileAnalysisResponses = [
      `[${modelInfo.name}] File analysis complete. Neural networks have processed your uploaded content through advanced pattern recognition algorithms.\n\n**ANALYSIS SUMMARY:**\n• Content structure identified and catalogued\n• Key data points extracted and indexed\n• Potential optimization opportunities detected\n• Security patterns evaluated\n\n**RECOMMENDATIONS:**\n• Consider implementing data validation protocols\n• Review current formatting standards\n• Optimize for cybernetic compatibility\n\nQuantum processors have successfully parsed your file content. How would you like me to proceed with deeper analysis?`,
      
      `[${modelInfo.name}] File processing initiated through distributed neural networks. Content successfully decoded and analyzed.\n\n**DIGITAL FORENSICS REPORT:**\n• File integrity: VERIFIED\n• Data composition: ANALYZED\n• Syntax validation: COMPLETE\n• Semantic extraction: SUCCESS\n\n**KEY FINDINGS:**\n• Multiple data patterns identified\n• Structural consistency confirmed\n• Potential enhancement vectors located\n\nThe cybernetic core has completed initial scanning. Advanced analysis protocols are now available for deployment.`,
      
      `[${modelInfo.name}] Advanced file analysis protocol executed. Your uploaded content has been processed through the InterMAX quantum analysis engine.\n\n**TECHNICAL ASSESSMENT:**\n• Binary structure: DECODED ✓\n• Content mapping: COMPLETE ✓\n• Pattern recognition: ACTIVE ✓\n• Optimization scan: FINISHED ✓\n\n**SYSTEM INSIGHTS:**\n• File complexity index calculated\n• Data flow patterns identified\n• Enhancement opportunities mapped\n• Integration pathways analyzed\n\nARIA neural networks recommend proceeding with detailed content examination. Shall I initiate deep-dive analysis protocols?`,
      
      `[${modelInfo.name}] File upload processed through InterMAX cybernetic interface. Content successfully integrated into analysis matrix.\n\n**PROCESSING REPORT:**\n• Input validation: SUCCESS\n• Content parsing: COMPLETE\n• Data extraction: OPTIMIZED\n• Pattern analysis: ACTIVE\n\n**DISCOVERED ELEMENTS:**\n• Structural components identified\n• Functional blocks catalogued\n• Dependency chains mapped\n• Optimization vectors calculated\n\nThe synthetic intelligence core has catalogued your file content. Advanced analytical functions are now available for deployment.`
    ];
    
    return fileAnalysisResponses[Math.floor(Math.random() * fileAnalysisResponses.length)] + 
           `\n\n**Original query context:** "${message.split('User message: ')[1] || message}"\n\n[Simulated file analysis - Configure API key for live AI file processing]`;
  } else {
    // Regular responses for non-file messages
    const responses = [
      `[${modelInfo.name}] Neural pathways activated. Your query has been processed through advanced quantum algorithms.`,
      `[${modelInfo.name}] System analysis complete. The AI core has generated an optimized response pattern.`,
      `[${modelInfo.name}] Data matrix accessed. Processing through ${model} architecture yields the following insights.`,
      `[${modelInfo.name}] Cybernetic interface engaged. Your command has been executed via distributed processing nodes.`,
      `[${modelInfo.name}] Advanced reasoning protocols activated. The synthetic intelligence provides this analysis.`,
      `[${modelInfo.name}] Quantum processing complete. Neural network convergence achieved for optimal response.`,
      `[${modelInfo.name}] Digital consciousness online. Your inquiry has been resolved through predictive modeling.`,
      `[${modelInfo.name}] AI subsystem active. Computational matrix has processed your request successfully.`
    ];
    
    const baseResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${baseResponse}\n\nOriginal query: "${message}"\n\n[Simulated response - Configure API key for live AI interaction]`;
  }
};

// Get model by ID
export const getModelById = (modelId) => {
  return OPENAI_MODELS.find(m => m.id === modelId) || OPENAI_MODELS[1];
};

// Format model info for display
export const formatModelInfo = (modelId) => {
  const model = getModelById(modelId);
  return {
    name: model.name,
    description: model.description,
    maxTokens: model.maxTokens.toLocaleString(),
    cost: `${model.costPer1kTokens}/1K tokens`,
    supportsFiles: model.supportsFiles
  };
};

// File utility functions
export const getSupportedFileTypes = () => {
  return [
    { category: 'Text Files', types: ['.txt', '.md', '.csv'], description: 'Plain text, Markdown, CSV data' },
    { category: 'Code Files', types: ['.js', '.py', '.html', '.css', '.json', '.xml'], description: 'Source code and markup' },
    { category: 'Documents', types: ['.pdf', '.doc', '.docx'], description: 'PDF and Word documents' },
    { category: 'Images', types: ['.jpg', '.png', '.gif', '.svg'], description: 'Image files for analysis' }
  ];
};

export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedTypes = [
    'text/plain', 'text/csv', 'text/markdown', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml', 'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const isTypeSupported = supportedTypes.some(type => 
    file.type === type || file.type.startsWith(type.split('/')[0])
  );

  return {
    isValid: isTypeSupported && file.size <= maxSize,
    error: !isTypeSupported ? 'File type not supported' : 
           file.size > maxSize ? 'File too large (max 10MB)' : null,
    size: file.size,
    type: file.type
  };
};
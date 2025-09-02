import Handlebars from 'handlebars';
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { config } from '../config/config';
import logger from '../config/logger';

export interface CodeGenerationRequest {
  framework: string;
  template: string;
  name: string;
  options?: {
    [key: string]: any;
  };
  customTemplate?: string;
}

export interface CodeGenerationResponse {
  success: boolean;
  files?: Array<{
    name: string;
    content: string;
    path: string;
  }>;
  downloadUrl?: string;
  error?: string;
  metadata?: {
    framework: string;
    template: string;
    name: string;
    fileCount: number;
    timestamp: string;
  };
}

export class CodeGenerationService {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    try {
      const startTime = Date.now();
      
      // Validate framework
      if (!config.supportedFrameworks[request.framework as keyof typeof config.supportedFrameworks]) {
        throw new Error(`Unsupported framework: ${request.framework}`);
      }

      // Get or create template
      const template = request.customTemplate || this.getTemplate(request.framework, request.template);
      
      // Prepare template data
      const templateData = this.prepareTemplateData(request);
      
      // Generate files
      const files = await this.generateFiles(template, templateData, request);
      
      const responseTime = Date.now() - startTime;
      
      logger.info('Code generation completed', {
        framework: request.framework,
        template: request.template,
        name: request.name,
        fileCount: files.length,
        responseTime
      });

      return {
        success: true,
        files,
        metadata: {
          framework: request.framework,
          template: request.template,
          name: request.name,
          fileCount: files.length,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error: any) {
      logger.error('Code generation failed', {
        framework: request.framework,
        template: request.template,
        name: request.name,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateAndDownload(request: CodeGenerationRequest, format: string = 'zip'): Promise<Buffer> {
    const response = await this.generateCode(request);
    
    if (!response.success || !response.files) {
      throw new Error(response.error || 'Code generation failed');
    }

    return this.createArchive(response.files, format);
  }

  private initializeTemplates(): void {
    // Register Handlebars helpers
    this.registerHandlebarsHelpers();
    
    // Load built-in templates
    this.loadBuiltInTemplates();
  }

  private registerHandlebarsHelpers(): void {
    // PascalCase helper
    Handlebars.registerHelper('pascalCase', (str: string) => {
      return str.replace(/(?:^|[\s-_]+)(\w)/g, (_, letter) => letter.toUpperCase());
    });

    // camelCase helper
    Handlebars.registerHelper('camelCase', (str: string) => {
      return str.replace(/[\s-_]+(\w)/g, (_, letter) => letter.toUpperCase());
    });

    // kebab-case helper
    Handlebars.registerHelper('kebabCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    });

    // snake_case helper
    Handlebars.registerHelper('snakeCase', (str: string) => {
      return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    });

    // Pluralize helper
    Handlebars.registerHelper('pluralize', (str: string) => {
      if (str.endsWith('y')) {
        return str.slice(0, -1) + 'ies';
      } else if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch')) {
        return str + 'es';
      } else {
        return str + 's';
      }
    });
  }

  private loadBuiltInTemplates(): void {
    // This would load templates from a templates directory
    // For now, we'll define them inline
    const templates = {
      'react-component': `
import React from 'react';
import './{{kebabCase name}}.css';

interface {{pascalCase name}}Props {
  // Add your props here
}

const {{pascalCase name}}: React.FC<{{pascalCase name}}Props> = (props) => {
  return (
    <div className="{{kebabCase name}}">
      <h1>{{pascalCase name}}</h1>
      {/* Add your component content here */}
    </div>
  );
};

export default {{pascalCase name}};
`,
      'react-hook': `
import { useState, useEffect } from 'react';

export const use{{pascalCase name}} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add your hook logic here

  return {
    data,
    loading,
    error,
    // Add other return values
  };
};
`,
      'nodejs-controller': `
const {{pascalCase name}}Controller = {
  // GET /{{kebabCase name}}
  async getAll(req, res) {
    try {
      // Add your logic here
      res.json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /{{kebabCase name}}/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      // Add your logic here
      res.json({ success: true, data: { id } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /{{kebabCase name}}
  async create(req, res) {
    try {
      const data = req.body;
      // Add your logic here
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // PUT /{{kebabCase name}}/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      // Add your logic here
      res.json({ success: true, data: { id, ...data } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // DELETE /{{kebabCase name}}/:id
  async delete(req, res) {
    try {
      const { id } = req.params;
      // Add your logic here
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = {{pascalCase name}}Controller;
`
    };

    // Register templates
    Object.entries(templates).forEach(([key, template]) => {
      this.templateCache.set(key, Handlebars.compile(template));
    });
  }

  private getTemplate(framework: string, template: string): HandlebarsTemplateDelegate {
    const templateKey = `${framework}-${template}`;
    const cachedTemplate = this.templateCache.get(templateKey);
    
    if (cachedTemplate) {
      return cachedTemplate;
    }

    // If template not found, create a basic one
    const basicTemplate = this.createBasicTemplate(framework, template);
    const compiledTemplate = Handlebars.compile(basicTemplate);
    this.templateCache.set(templateKey, compiledTemplate);
    
    return compiledTemplate;
  }

  private createBasicTemplate(framework: string, template: string): string {
    const frameworkInfo = config.supportedFrameworks[framework as keyof typeof config.supportedFrameworks];
    
    return `
// Generated {{pascalCase name}} {{template}} for {{frameworkInfo.name}}
// Generated on {{timestamp}}

// TODO: Implement your {{template}} logic here
export class {{pascalCase name}} {
  constructor() {
    // Initialize your {{template}} here
  }
}
`;
  }

  private prepareTemplateData(request: CodeGenerationRequest): any {
    return {
      name: request.name,
      framework: request.framework,
      template: request.template,
      timestamp: new Date().toISOString(),
      ...request.options
    };
  }

  private async generateFiles(
    template: HandlebarsTemplateDelegate,
    data: any,
    request: CodeGenerationRequest
  ): Promise<Array<{ name: string; content: string; path: string }>> {
    const files = [];
    const content = template(data);
    
    // Determine file extension based on framework
    const extension = this.getFileExtension(request.framework, request.template);
    const fileName = `${this.getFileName(request.name, request.template)}.${extension}`;
    
    files.push({
      name: fileName,
      content,
      path: this.getFilePath(request.framework, request.template, fileName)
    });

    // Add additional files if needed (e.g., CSS, tests, etc.)
    if (request.framework === 'react' && request.template === 'component') {
      files.push({
        name: `${this.getFileName(request.name, request.template)}.css`,
        content: this.generateCSS(request.name),
        path: this.getFilePath(request.framework, request.template, `${this.getFileName(request.name, request.template)}.css`)
      });
    }

    return files;
  }

  private getFileExtension(framework: string, template: string): string {
    const extensions: { [key: string]: { [key: string]: string } } = {
      react: {
        component: 'tsx',
        hook: 'ts',
        context: 'tsx',
        page: 'tsx'
      },
      vue: {
        component: 'vue',
        composable: 'ts',
        store: 'ts',
        page: 'vue'
      },
      angular: {
        component: 'ts',
        service: 'ts',
        guard: 'ts',
        module: 'ts'
      },
      nodejs: {
        controller: 'js',
        service: 'js',
        middleware: 'js',
        route: 'js'
      },
      express: {
        route: 'js',
        middleware: 'js',
        controller: 'js',
        model: 'js'
      },
      nestjs: {
        controller: 'ts',
        service: 'ts',
        module: 'ts',
        guard: 'ts'
      },
      python: {
        class: 'py',
        function: 'py',
        module: 'py',
        test: 'py'
      }
    };

    return extensions[framework]?.[template] || 'js';
  }

  private getFileName(name: string, template: string): string {
    const framework = 'react'; // This would be determined from context
    const extensions: { [key: string]: { [key: string]: string } } = {
      react: {
        component: name,
        hook: `use${name}`,
        context: `${name}Context`,
        page: name
      }
    };

    return extensions[framework]?.[template] || name;
  }

  private getFilePath(framework: string, template: string, fileName: string): string {
    const basePath = `src/${framework}/${template}s`;
    return `${basePath}/${fileName}`;
  }

  private generateCSS(name: string): string {
    return `
.${name.toLowerCase()} {
  /* Add your styles here */
}
`;
  }

  private async createArchive(files: Array<{ name: string; content: string; path: string }>, format: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver(format, { zlib: { level: 9 } });

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      files.forEach(file => {
        archive.append(file.content, { name: file.path });
      });

      archive.finalize();
    });
  }

  getSupportedFrameworks(): string[] {
    return Object.keys(config.supportedFrameworks);
  }

  getFrameworkInfo(framework: string): any {
    return config.supportedFrameworks[framework as keyof typeof config.supportedFrameworks];
  }

  getSupportedTemplates(framework: string): string[] {
    const frameworkInfo = this.getFrameworkInfo(framework);
    return frameworkInfo?.templates || [];
  }
}

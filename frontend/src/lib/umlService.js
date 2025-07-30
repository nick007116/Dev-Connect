const { GoogleGenerativeAI } = require('@google/generative-ai');
const { DIAGRAM_TEMPLATES } = require('../components/Diagrams/constants/diagramTemplates');

class UMLService {
  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key for Google Generative AI is not defined');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateDiagramPrompt(type, description) {
    const prompts = {
      flowchart: `You are an expert in creating Mermaid flowchart diagrams. Create a Mermaid flowchart diagram using graph TD syntax for: ${description}. Focus on clarity and accuracy. Ensure all elements are correctly connected and labeled. Return only the Mermaid code without any explanations and make sure its format is like this:
${DIAGRAM_TEMPLATES.flowchart},write code more than 10 lines for sure.`,
      sequence: `You are an expert in creating Mermaid sequence diagrams. Create a Mermaid sequence diagram for: ${description}. Focus on depicting the interaction between different components clearly. Ensure proper sequencing and labeling of messages. Use actor symbol for sure. Return only the Mermaid code without any explanations and make sure its format is like this:
${DIAGRAM_TEMPLATES.sequence}, write code more than 10 lines for sure.`,
      state: `You are an expert in creating Mermaid state diagrams. Create a Mermaid state diagram using stateDiagram-v2 syntax for: ${description}. Focus on accurately representing the different states and transitions. Ensure all states and transitions are clearly labeled. Return only the Mermaid code without any explanations and make sure its format is like this:
${DIAGRAM_TEMPLATES.state},write code more than 10 lines for sure.`,
      class: `You are an expert in creating Mermaid class diagrams. Create a Mermaid class diagram for: ${description}. Focus on accurately representing the classes, attributes, and relationships. Ensure all classes and relationships are clearly labeled. Return only the Mermaid code without any explanations and make sure its format is like this:
${DIAGRAM_TEMPLATES.class},write code more than 10 lines for sure.`
    };
    return prompts[type] || prompts.flowchart;
  }

  cleanMermaidCode(code) {
    // Remove ```mermaid and ``` markers
    return code
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  }

  async generateUMLDiagram(type, description) {
    try {
      const prompt = await this.generateDiagramPrompt(type, description);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const rawCode = response.text().trim();
      
      // Clean the generated code
      const mermaidCode = this.cleanMermaidCode(rawCode);

      // Basic syntax validation without using mermaid.parse
      const isValidSyntax = this.basicSyntaxValidation(mermaidCode, type);
      if (!isValidSyntax) {
        return {
          success: false,
          error: 'Generated diagram has invalid syntax',
        };
      }

      return {
        success: true,
        code: mermaidCode,
        type: type
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to generate ${type} diagram: ${error.message}`
      };
    }
  }

  basicSyntaxValidation(code, type) {
    // Basic validation checks based on diagram type
    const validations = {
      flowchart: (code) => code.includes('graph') || code.includes('flowchart'),
      sequence: (code) => code.includes('sequenceDiagram'),
      state: (code) => code.includes('stateDiagram-v2'),
      class: (code) => code.includes('classDiagram')
    };

    // Check if code starts with the correct diagram type identifier
    const validator = validations[type] || (() => true);
    return validator(code);
  }
}

module.exports = UMLService;
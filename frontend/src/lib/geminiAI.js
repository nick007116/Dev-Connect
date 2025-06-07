import { useState } from 'react';
import axios from 'axios';

// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export const useGeminiAI = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Function to generate project setup based on user prompt
  const generateProjectSetup = async (prompt) => {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    setIsLoading(true);

    try {
      console.log('Making request to Gemini AI...');
      console.log('API URL:', GEMINI_API_URL);
      
      // Create the user message with instructions
      const userMessage = `You are an expert software developer and project architect. Generate a complete, detailed project setup for the following request: "${prompt}"

Please analyze the request and provide a comprehensive project structure with:
1. A creative and appropriate project name
2. Detailed project description
3. Complete technology stack with modern, relevant technologies
4. Detailed folder structure (include all necessary folders and key files)
5. Complete setup commands from start to finish
6. Realistic time estimate and appropriate difficulty level

Be creative and suggest the most suitable modern technologies for the project type. Include all necessary dependencies, configuration files, and setup steps.

Format your response as JSON with this exact structure:
{
  "type": "project",
  "project": {
    "name": "creative-project-name",
    "description": "Detailed description of what this project does and its features",
    "technologies": ["tech1", "tech2", "tech3", "tech4", "etc"],
    "structure": [
      "folder1/",
      "folder1/subfolder/",
      "folder2/",
      "file1.js",
      "file2.json",
      "etc"
    ],
    "scripts": [
      "mkdir project-name",
      "cd project-name",
      "command 1",
      "command 2",
      "etc"
    ],
    "estimatedTime": "realistic time estimate",
    "difficulty": "Beginner|Intermediate|Advanced"
  }
}

IMPORTANT: Only return valid JSON, no markdown formatting, no extra text, no explanations. Just the JSON object.`;

      // Make API request to Gemini
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{
            parts: [{
              text: userMessage
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      console.log('Gemini API Response:', response.data);

      // Parse the response from Gemini
      if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
        throw new Error('Invalid response format from Gemini API');
      }

      const assistantResponse = response.data.candidates[0].content.parts[0].text.trim();
      console.log('Assistant Response:', assistantResponse);
      
      // Try to extract and parse JSON from the response
      let projectData;
      try {
        // First try to parse directly
        projectData = JSON.parse(assistantResponse);
      } catch (parseError) {
        console.log('Direct parsing failed, trying to extract JSON...');
        
        // If direct parsing fails, try to extract JSON from markdown code blocks or text
        const jsonMatch = assistantResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || 
                         assistantResponse.match(/(\{[\s\S]*\})/);
                         
        if (jsonMatch) {
          const jsonContent = jsonMatch[1].trim();
          console.log('Extracted JSON:', jsonContent);
          projectData = JSON.parse(jsonContent);
        } else {
          throw new Error('No valid JSON found in response');
        }
      }

      // Validate the structure
      if (!projectData || !projectData.project || !projectData.project.name) {
        console.error('Invalid project data structure:', projectData);
        throw new Error('Invalid project data structure received from Gemini AI');
      }

      // Ensure all required fields exist
      const project = projectData.project;
      if (!project.description || !project.technologies || !project.scripts) {
        console.error('Incomplete project data:', project);
        console.log('Creating minimal structure for missing fields...');
        
        // Fill in missing fields with defaults
        if (!project.description) project.description = `A ${project.name} project`;
        if (!project.technologies) project.technologies = ['To be determined'];
        if (!project.scripts) project.scripts = ['Setup commands to be defined'];
        if (!project.structure) project.structure = ['src/', 'package.json', 'README.md'];
        if (!project.estimatedTime) project.estimatedTime = '1-2 days';
        if (!project.difficulty) project.difficulty = 'Intermediate';
      }

      console.log('Successfully parsed project data:', projectData);
      return projectData;

    } catch (error) {
      console.error('Detailed error calling Gemini AI:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Request config:', error.config);
      
      // Check if it's an API key issue
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error?.message || '';
        if (errorMessage.includes('API_KEY') || errorMessage.includes('key')) {
          throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        }
        if (errorMessage.includes('quota')) {
          throw new Error('Gemini API quota exceeded. Please check your billing and quotas.');
        }
        throw new Error(`Gemini API error: ${errorMessage}`);
      }
      
      // Check if it's a 404 - wrong endpoint
      if (error.response?.status === 404) {
        console.log('404 error - trying alternative endpoint...');
        return await retryWithAlternativeEndpoint(prompt);
      }
      
      // Check if it's a quota issue
      if (error.response?.status === 429) {
        throw new Error('Gemini API rate limit exceeded. Please try again in a few moments.');
      }
      
      // Check if it's a billing issue
      if (error.response?.status === 403) {
        throw new Error('Gemini API access denied. Please check your billing and quotas.');
      }
      
      // For timeout errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Gemini AI is taking too long to respond. Please try again.');
      }
      
      // For network errors
      if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error('Network error: Unable to connect to Gemini AI. Please check your internet connection.');
      }
      
      // For parsing errors, try one more time with a simpler request
      if (error.message.includes('JSON') || error.message.includes('structure')) {
        try {
          console.log('Trying simple request fallback...');
          return await retryWithSimpleRequest(prompt);
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
          throw new Error('Gemini AI is having trouble generating the project structure. Please try rephrasing your request or try again later.');
        }
      }
      
      // For any other errors, provide a helpful message
      throw new Error(`Gemini AI encountered an error: ${error.message}. Please try again or rephrase your request.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry with alternative endpoint
  const retryWithAlternativeEndpoint = async (prompt) => {
    const alternativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    console.log('Retrying with alternative URL:', alternativeUrl);
    
    const response = await axios.post(
      alternativeUrl,
      {
        contents: [{
          parts: [{
            text: `Create a project setup for: "${prompt}". Return as JSON with structure: {"type": "project", "project": {"name": "...", "description": "...", "technologies": [...], "structure": [...], "scripts": [...], "estimatedTime": "...", "difficulty": "..."}}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const assistantResponse = response.data.candidates[0].content.parts[0].text.trim();
    const jsonMatch = assistantResponse.match(/(\{[\s\S]*\})/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    throw new Error('Unable to get valid response from Gemini AI');
  };

  // Retry function with a simpler, more direct request
  const retryWithSimpleRequest = async (prompt) => {
    const simpleMessage = `Create a project setup for: "${prompt}"

Return only this JSON structure:
{
  "type": "project",
  "project": {
    "name": "project-name",
    "description": "what this project does",
    "technologies": ["tech1", "tech2"],
    "structure": ["folder/", "file.js"],
    "scripts": ["step 1", "step 2"],
    "estimatedTime": "time needed",
    "difficulty": "Beginner"
  }
}`;

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: simpleMessage
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const assistantResponse = response.data.candidates[0].content.parts[0].text.trim();
    
    // Try to parse the response
    const jsonMatch = assistantResponse.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    
    throw new Error('Unable to get valid response from Gemini AI');
  };

  return {
    generateProjectSetup,
    isLoading
  };
};
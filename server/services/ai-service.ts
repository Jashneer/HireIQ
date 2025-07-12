import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "",
});

export interface SkillAnalysis {
  matchingSkills: string[];
  missingSkills: string[];
  technicalScore: number;
  experienceScore: number;
  domainScore: number;
  overallScore: number;
}

export interface OutreachGeneration {
  message: string;
  improvementSuggestions: string[];
}

export class AIService {
  async analyzeSkills(resumeText: string, jobDescription: string): Promise<SkillAnalysis> {
    try {
      const prompt = `
        Analyze the following resume and job description to extract skills and calculate match scores.
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Please provide a JSON response with the following structure:
        {
          "matchingSkills": ["skill1", "skill2", ...],
          "missingSkills": ["skill1", "skill2", ...],
          "technicalScore": number (0-100),
          "experienceScore": number (0-100),
          "domainScore": number (0-100),
          "overallScore": number (0-100)
        }
        
        Calculate scores based on:
        - Technical Skills: How well the candidate's technical skills match the job requirements
        - Experience Level: How the candidate's experience level matches what's needed
        - Domain Relevance: How relevant the candidate's industry/domain experience is
        - Overall Score: Weighted average of the above scores
        
        Only return the JSON, no additional text.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error) {
      console.error("Error analyzing skills:", error);
      // Fallback analysis if AI fails
      return {
        matchingSkills: [],
        missingSkills: [],
        technicalScore: 50,
        experienceScore: 50,
        domainScore: 50,
        overallScore: 50,
      };
    }
  }

  async generateOutreach(
    candidateName: string,
    jobTitle: string,
    companyName: string,
    matchingSkills: string[],
    tone: string,
    matchScore: number
  ): Promise<OutreachGeneration> {
    try {
      const prompt = `
        Generate a personalized outreach message for a recruitment scenario.
        
        DETAILS:
        - Candidate: ${candidateName || "[Candidate Name]"}
        - Job Title: ${jobTitle}
        - Company: ${companyName}
        - Matching Skills: ${matchingSkills.join(", ")}
        - Tone: ${tone}
        - Match Score: ${matchScore}%
        
        Please provide a JSON response with:
        {
          "message": "personalized outreach message",
          "improvementSuggestions": ["suggestion1", "suggestion2", ...]
        }
        
        The message should:
        - Be ${tone} in tone
        - Mention specific skills that match
        - Be engaging and personalized
        - Include a clear call to action
        - Be approximately 100-150 words
        
        Improvement suggestions should be 2-3 actionable recommendations for the candidate.
        
        Only return the JSON, no additional text.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating outreach:", error);
      // Fallback message if AI fails
      return {
        message: `Hi ${candidateName || "[Candidate Name]"},\n\nI came across your profile and was impressed by your experience with ${matchingSkills.join(", ")}. Your background seems like a great fit for our ${jobTitle} role at ${companyName}.\n\nI'd love to schedule a brief call to discuss this opportunity further. Are you available for a 15-minute conversation this week?\n\nBest regards,\n[Your Name]`,
        improvementSuggestions: [
          "Consider gaining more experience in emerging technologies",
          "Strengthen your portfolio with recent projects",
          "Develop leadership and communication skills"
        ],
      };
    }
  }
}

export const aiService = new AIService();

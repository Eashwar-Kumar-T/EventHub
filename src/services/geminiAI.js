import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

console.log('Gemini API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No')
console.log('API Key (first 10 chars):', GEMINI_API_KEY?.substring(0, 10))

let genAI = null
let model = null

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  console.log('Gemini model initialized successfully')
} else {
  console.error('Gemini API key is missing!')
}

export const geminiService = {
  // Suggest optimal event dates
  suggestEventDates: async (eventType, guestCount, preferences = '') => {
    if (!model) throw new Error('Gemini API key not configured')

    const prompt = `As an event planning expert, suggest 3 optimal dates for the following event:
    - Event Type: ${eventType}
    - Expected Guests: ${guestCount}
    - Additional Preferences: ${preferences || 'None'}
    
    Consider seasonal factors, common availability patterns, and event planning best practices.
    Provide dates in the next 3 months with brief reasoning for each.
    Format the response as JSON array with structure: [{ date: "YYYY-MM-DD", reason: "explanation" }]`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return []
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw error
    }
  },

  // Get venue recommendations
  getVenueRecommendations: async (eventType, location, guestCount, budget) => {
    if (!model) throw new Error('Gemini API key not configured')

    const prompt = `As an event planning expert, recommend 5 types of venues for:
    - Event Type: ${eventType}
    - Location: ${location}
    - Guest Count: ${guestCount}
    - Budget Range: ${budget}
    
    Provide venue types (not specific venues) with reasoning.
    Format as JSON: [{ venueType: "name", capacity: "range", priceRange: "estimate", pros: ["list"], suitability: "explanation" }]`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return []
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw error
    }
  },

  // Get event planning checklist
  getEventChecklist: async (eventType, eventDate, guestCount) => {
    if (!model) throw new Error('Gemini API key not configured')

    const prompt = `Create a comprehensive event planning checklist for:
    - Event Type: ${eventType}
    - Event Date: ${eventDate}
    - Guest Count: ${guestCount}
    
    Organize tasks by timeline (3 months before, 1 month before, 1 week before, day of event).
    Format as JSON: { "timeline": [{ "period": "name", "tasks": ["task1", "task2"] }] }`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return { timeline: [] }
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw error
    }
  },

  // Get vendor suggestions
  getVendorSuggestions: async (eventType, services) => {
    if (!model) throw new Error('Gemini API key not configured')

    const prompt = `Suggest vendor types and services needed for a ${eventType} event.
    Services interested in: ${services.join(', ')}
    
    Provide recommendations for: catering, photography, decoration, entertainment, etc.
    Format as JSON: [{ "category": "name", "suggestions": ["item1", "item2"], "tips": "advice" }]`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return []
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw error
    }
  },

  // Generate event description
  generateEventDescription: async (eventType, theme, details) => {
    if (!model) throw new Error('Gemini API key not configured')

    const prompt = `Write an engaging event description for:
    - Event Type: ${eventType}
    - Theme: ${theme}
    - Additional Details: ${details}
    
    Make it exciting, informative, and suitable for invitations. Keep it under 150 words.`

    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw error
    }
  },
}

export default geminiService

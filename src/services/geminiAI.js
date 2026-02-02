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
  suggestEventDates: async (eventType, guestCount, eventTitle = '') => {
    if (!model) throw new Error('Gemini API key not configured')

    // Get current date and calculate future date range
    const today = new Date()
    const currentDate = today.toISOString().split('T')[0]
    const threeMonthsLater = new Date(today.setMonth(today.getMonth() + 3)).toISOString().split('T')[0]

    const prompt = `As an event planning expert, suggest 3 optimal dates for the following event:
    - Event Type: ${eventType}
    - Event Title: ${eventTitle || 'Not specified'}
    - Expected Guests: ${guestCount}
    - Current Date: ${currentDate}
    
    IMPORTANT RULES:
    1. ALL suggested dates MUST be AFTER ${currentDate} (no past dates allowed)
    2. Suggest dates between ${currentDate} and ${threeMonthsLater}
    3. For conferences/seminars: Suggest midweek dates (Tue-Thu) with 3-6 weeks planning time
    4. For workshops: Suggest weekends with 2-4 weeks planning time
    5. For meetups/networking: Suggest weekday evenings (Wed-Thu) with 1-3 weeks planning time
    6. For parties/concerts: Suggest Friday/Saturday nights with 2-4 weeks planning time
    7. If title contains "AI", "Tech", or "Data", cluster dates closer together to create a series feel
    8. Consider seasonal factors and avoid major holidays
    
    Format the response as JSON array with structure: [{ date: "YYYY-MM-DD", reason: "explanation" }]
    Ensure ALL dates are in YYYY-MM-DD format and are future dates AFTER ${currentDate}.`

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

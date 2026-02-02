import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Lambda returns data directly in body, not wrapped in { data: ... }
    // So we wrap it for consistency with the frontend expectations
    if (response.data && !response.data.data) {
      return { ...response, data: response.data }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data).then(res => {
    // Lambda returns: { token, userId, message }
    console.log('Register response:', res.data)
    const responseData = res.data
    
    return {
      data: {
        user: { 
          userId: responseData.userId, 
          email: data.email, 
          name: data.name 
        },
        token: responseData.token
      }
    }
  }),
  login: (data) => api.post('/auth/login', data).then(res => {
    // Lambda returns: { token, userId, message }
    console.log('Login response:', res.data)
    const responseData = res.data
    
    return {
      data: {
        user: { 
          userId: responseData.userId, 
          email: data.email,
          name: data.email.split('@')[0] // Extract name from email
        },
        token: responseData.token
      }
    }
  }),
}

// Event APIs
export const eventAPI = {
  getAllEvents: () => api.get('/events').then(res => ({
    data: (res.data || []).map(event => ({
      ...event,
      id: event.eventId,
      // Parse eventDate into date and time for frontend
      date: event.eventDate?.split('T')[0] || event.eventDate,
      time: event.eventDate?.split('T')[1]?.substring(0, 5) || '00:00',
      // Add default values for fields not in backend
      eventType: 'Event',
      ticketPrice: event.ticketPrice || 0,
      availableSeats: event.availableSeats || event.capacity || 0,
      imageUrl: ''
    }))
  })),
  getEvent: (eventId) => api.get(`/events/${eventId}`).then(res => ({
    data: {
      ...res.data,
      id: res.data.eventId,
      date: res.data.eventDate?.split('T')[0] || res.data.eventDate,
      time: res.data.eventDate?.split('T')[1]?.substring(0, 5) || '00:00',
      eventType: 'Event',
      ticketPrice: res.data.ticketPrice || 0,
      availableSeats: res.data.availableSeats || res.data.capacity || 0,
      imageUrl: ''
    }
  })),
  createEvent: (data) => {
    // Combine date and time into eventDate
    const eventDate = data.time 
      ? `${data.date}T${data.time}:00Z` 
      : `${data.date}T00:00:00Z`
    
    return api.post('/events', {
      title: data.title,
      description: data.description,
      eventDate: eventDate,
      location: data.location,
      capacity: parseInt(data.capacity),
      ticketPrice: parseInt(data.ticketPrice || 0)
    }).then(res => ({
      data: { id: res.data.eventId, ...res.data }
    }))
  },
  updateEvent: (eventId, data) => {
    const eventDate = data.time 
      ? `${data.date}T${data.time}:00Z` 
      : data.date ? `${data.date}T00:00:00Z` : undefined
    
    const updateData = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(eventDate && { eventDate }),
      ...(data.location && { location: data.location }),
      ...(data.capacity && { capacity: parseInt(data.capacity) }),
      ...(data.ticketPrice !== undefined && { ticketPrice: parseInt(data.ticketPrice) })
    }
    
    return api.put(`/events/${eventId}`, updateData)
  },
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),
  getAvailability: (eventId) => api.get(`/events/${eventId}/availability`).then(res => ({
    data: {
      availableSeats: res.data.availableSeats,
      ticketPrice: res.data.ticketPrice,
      available: res.data.availableSeats, // Keep for backward compatibility
      booked: 0
    }
  })),
}

// User APIs
export const userAPI = {
  getMyEvents: () => api.get('/users/me/events').then(res => ({
    data: (res.data || []).map(event => ({
      ...event,
      id: event.eventId,
      date: event.eventDate?.split('T')[0] || event.eventDate,
      time: event.eventDate?.split('T')[1]?.substring(0, 5) || '00:00',
      eventType: 'Event',
      ticketPrice: event.ticketPrice || 0,
      availableSeats: event.availableSeats || event.capacity || 0,
      imageUrl: ''
    }))
  })),
  getMyTickets: async () => {
    const ticketsRes = await api.get('/users/me/tickets')
    const tickets = ticketsRes.data || []
    
    // Fetch event details for each ticket
    const ticketsWithEvents = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const eventRes = await api.get(`/events/${ticket.eventId}`)
          const event = eventRes.data
          
          return {
            ...ticket,
            id: ticket.bookingId || `${ticket.userId}-${ticket.eventId}-${ticket.createdAt}`,
            quantity: ticket.quantity || 1,
            bookedAt: ticket.createdAt,
            event: {
              title: event.title,
              eventType: 'Event',
              date: event.eventDate?.split('T')[0],
              time: event.eventDate?.split('T')[1]?.substring(0, 5),
              location: event.location,
              ticketPrice: ticket.pricePerTicket || ticket.totalPrice / (ticket.quantity || 1) || event.ticketPrice || 0
            }
          }
        } catch (error) {
          // If event fetch fails, return ticket with basic info
          return {
            ...ticket,
            id: ticket.bookingId || `${ticket.userId}-${ticket.eventId}-${ticket.createdAt}`,
            quantity: ticket.quantity || 1,
            bookedAt: ticket.createdAt,
            event: {
              title: 'Event',
              eventType: 'Event',
              ticketPrice: ticket.pricePerTicket || 0
            }
          }
        }
      })
    )
    
    return { data: ticketsWithEvents }
  },
}

// RSVP APIs
export const rsvpAPI = {
  createRSVP: (eventId, data) => {
    // Map frontend status to backend format
    const statusMap = {
      'going': 'yes',
      'not_going': 'no',
      'maybe': 'maybe'
    }
    return api.post(`/events/${eventId}/rsvp`, {
      status: statusMap[data.status] || 'yes'
    })
  },
  getRSVPs: (eventId) => api.get(`/events/${eventId}/rsvps`).then(res => ({
    data: (res.data || []).map(rsvp => ({
      ...rsvp,
      // Map backend status to frontend format
      status: rsvp.status === 'yes' ? 'going' : rsvp.status === 'no' ? 'not_going' : 'maybe'
    }))
  })),
}

// Ticket APIs
export const ticketAPI = {
  // Send quantity in the request body
  bookTicket: (eventId, data) => api.post(`/events/${eventId}/tickets`, {
    quantity: data.quantity || 1
  }),
}

// Message APIs
export const messageAPI = {
  sendMessage: (eventId, data) => api.post(`/events/${eventId}/messages`, {
    content: data.content
  }),
  getMessages: (eventId) => api.get(`/events/${eventId}/messages`).then(res => ({
    data: (res.data || []).map(msg => ({
      ...msg,
      id: msg.messageId,
      timestamp: msg.createdAt
    }))
  })),
}

export default api

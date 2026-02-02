import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventAPI, rsvpAPI, ticketAPI, messageAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  TicketIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

const EventDetails = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rsvps, setRsvps] = useState([])
  const [messages, setMessages] = useState([])
  const [availability, setAvailability] = useState(null)
  const [userRSVP, setUserRSVP] = useState(null) // Track user's current RSVP
  
  // Modals
  const [showRsvpModal, setShowRsvpModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [showMessagesModal, setShowMessagesModal] = useState(false)
  
  // Forms
  const [rsvpStatus, setRsvpStatus] = useState('going')
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    fetchEventDetails()
  }, [eventId])

  // Also refresh when component comes back into focus
  useEffect(() => {
    const handleFocus = () => {
      fetchEventDetails()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [eventId])

  const fetchEventDetails = async () => {
    setLoading(true)
    try {
      const [eventRes, rsvpsRes, messagesRes, availabilityRes] = await Promise.all([
        eventAPI.getEvent(eventId),
        rsvpAPI.getRSVPs(eventId).catch((err) => {
          console.log('RSVP fetch error:', err.response?.status, err.response?.data)
          return { data: [] }
        }),
        messageAPI.getMessages(eventId).catch((err) => {
          console.log('Messages fetch error:', err)
          return { data: [] }
        }),
        eventAPI.getAvailability(eventId).catch(() => ({ data: { availableSeats: 0 } })),
      ])

      const eventData = eventRes.data
      const availabilityData = availabilityRes.data
      
      console.log('Raw event data from API:', eventData)
      console.log('Availability API response:', availabilityData)
      console.log('Available seats from availability endpoint:', availabilityData.availableSeats)
      
      // Use availability endpoint value as the source of truth
      eventData.availableSeats = availabilityData.availableSeats
      
      setEvent(eventData)
      console.log('RSVPs received:', rsvpsRes.data)
      console.log('First RSVP userName:', rsvpsRes.data?.[0]?.userName)
      console.log('Messages received:', messagesRes.data)
      console.log('First message userName:', messagesRes.data?.[0]?.userName)
      setRsvps(rsvpsRes.data || [])
      setMessages(messagesRes.data || [])
      setAvailability(availabilityData)
      
      // Find user's existing RSVP
      if (user) {
        const existingRSVP = (rsvpsRes.data || []).find(r => r.userId === user.userId)
        setUserRSVP(existingRSVP)
        if (existingRSVP) {
          setRsvpStatus(existingRSVP.status)
        }
      }
    } catch (error) {
      toast.error('Failed to load event details')
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleRSVP = async () => {
    // Prevent host from RSVPing to their own event
    if (user && event.hostId === user.userId) {
      toast.error('You cannot RSVP to your own event')
      return
    }

    try {
      await rsvpAPI.createRSVP(eventId, { status: rsvpStatus })
      const action = userRSVP ? 'updated' : 'submitted'
      toast.success(`RSVP ${action} successfully!`)
      setShowRsvpModal(false)
      fetchEventDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit RSVP')
    }
  }

  const handleBookTicket = async () => {
    // Prevent host from buying their own tickets
    if (user && event.hostId === user.userId) {
      toast.error('You cannot buy tickets to your own event')
      return
    }

    // Validate quantity
    if (ticketQuantity <= 0) {
      toast.error('Please select at least 1 ticket')
      return
    }

    // Check if enough seats available
    if (ticketQuantity > event.availableSeats) {
      toast.error(`Only ${event.availableSeats} seats available`)
      return
    }

    if (event.availableSeats === 0) {
      toast.error('No seats available')
      return
    }

    try {
      // Send quantity in a single request
      await ticketAPI.bookTicket(eventId, { quantity: ticketQuantity })
      toast.success(`${ticketQuantity} ticket(s) booked successfully!`)
      setShowTicketModal(false)
      setTicketQuantity(1) // Reset quantity
      fetchEventDetails() // Refresh to get updated availableSeats
      navigate('/my-tickets')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book ticket')
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      await messageAPI.sendMessage(eventId, { content: newMessage })
      setNewMessage('')
      toast.success('Message sent!')
      fetchEventDetails()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <div className="card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="lg:col-span-1">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Event Info */}
          <div className={event.imageUrl ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <span className="inline-block px-3 py-1 text-sm font-semibold text-primary-600 bg-primary-100 rounded-full mb-3">
              {event.eventType}
            </span>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            
            <p className="text-gray-600 mb-6">{event.description}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Only show RSVP button if user is not the host */}
              {user && event.hostId !== user.userId && (
                <button
                  onClick={() => setShowRsvpModal(true)}
                  className={userRSVP ? "btn-secondary flex items-center space-x-2" : "btn-primary flex items-center space-x-2"}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>
                    {userRSVP ? `RSVP: ${userRSVP.status === 'going' ? 'Going' : userRSVP.status === 'maybe' ? 'Maybe' : 'Not Going'}` : 'RSVP'}
                  </span>
                </button>
              )}
              
              {/* Only show Book Tickets button if user is not the host */}
              {user && event.hostId !== user.userId && (
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="btn-outline flex items-center space-x-2"
                  disabled={event.availableSeats === 0}
                >
                  <TicketIcon className="h-5 w-5" />
                  <span>{event.availableSeats === 0 ? 'Sold Out' : 'Book Tickets'}</span>
                </button>
              )}
              
              {/* Show message for hosts */}
              {user && event.hostId === user.userId && (
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <span className="font-medium">You are hosting this event</span>
                </div>
              )}
              
              <button
                onClick={() => setShowMessagesModal(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>Messages ({messages.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <div className="card">
          <div className="flex items-start space-x-3">
            <CalendarIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Date & Time</h3>
              <p className="text-gray-600">
                {event.date && format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
              </p>
              <p className="text-gray-600 flex items-center mt-1">
                <ClockIcon className="h-4 w-4 mr-1" />
                {event.time}
              </p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <div className="flex items-start space-x-3">
            <MapPinIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Capacity */}
        <div className="card">
          <div className="flex items-start space-x-3">
            <UsersIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div className="w-full">
              <h3 className="font-semibold text-gray-900 mb-1">Capacity</h3>
              <p className="text-gray-600">
                {event.availableSeats === 0 ? (
                  <span className="text-red-600 font-semibold">Sold Out!</span>
                ) : (
                  `${event.availableSeats} seats remaining`
                )}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${event.capacity > 0 ? (((event.capacity - event.availableSeats) / event.capacity) * 100).toFixed(0) : 0}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {event.capacity - event.availableSeats} of {event.capacity} tickets booked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Stats */}
        <div className="card">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div className="w-full">
              <h3 className="font-semibold text-gray-900 mb-1">RSVPs</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">✓ Going:</span>
                  <span className="font-semibold text-green-600">
                    {rsvps.filter(r => r.status === 'going').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">? Maybe:</span>
                  <span className="font-semibold text-yellow-600">
                    {rsvps.filter(r => r.status === 'maybe').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">✗ Not Going:</span>
                  <span className="font-semibold text-red-600">
                    {rsvps.filter(r => r.status === 'not_going').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="card">
          <div className="flex items-start space-x-3">
            <TicketIcon className="h-6 w-6 text-primary-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Ticket Price</h3>
              <p className="text-2xl font-bold text-primary-600">
                {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RSVPs */}
      {rsvps.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            RSVPs ({rsvps.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rsvps.slice(0, 8).map((rsvp, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
              >
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {rsvp.userName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {rsvp.userName || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500">{rsvp.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RSVP Modal */}
      <Modal
        isOpen={showRsvpModal}
        onClose={() => setShowRsvpModal(false)}
        title={userRSVP ? "Update Your RSVP" : "RSVP to Event"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <div className="space-y-2">
              {['going', 'maybe', 'not_going'].map((status) => (
                <label
                  key={status}
                  className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="rsvp"
                    value={status}
                    checked={rsvpStatus === status}
                    onChange={(e) => setRsvpStatus(e.target.value)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-medium text-gray-900 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleRSVP} className="w-full btn-primary">
            Submit RSVP
          </button>
        </div>
      </Modal>

      {/* Ticket Booking Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        title="Book Tickets"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets
            </label>
            <input
              type="number"
              min="1"
              max={event.availableSeats}
              value={ticketQuantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1
                const maxSeats = event.availableSeats
                setTicketQuantity(Math.min(Math.max(value, 1), maxSeats))
              }}
              className="input-field"
              disabled={event.availableSeats === 0}
            />
            <p className="text-sm text-gray-500 mt-1">
              {event.availableSeats} seats remaining
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price per ticket:</span>
              <span className="font-semibold text-gray-900">
                ${event.ticketPrice}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold text-gray-900">{ticketQuantity}</span>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total:</span>
              <span className="font-bold text-primary-600 text-xl">
                ${(event.ticketPrice * ticketQuantity).toFixed(2)}
              </span>
            </div>
          </div>

          <button onClick={handleBookTicket} className="w-full btn-primary">
            Confirm Booking
          </button>
        </div>
      </Modal>

      {/* Messages Modal */}
      <Modal
        isOpen={showMessagesModal}
        onClose={() => setShowMessagesModal(false)}
        title="Event Messages"
      >
        <div className="space-y-4">
          {/* Messages List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold text-sm">
                        {msg.userName?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {msg.userName || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(msg.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No messages yet. Be the first to start the conversation!
              </p>
            )}
          </div>

          {/* Send Message */}
          <div className="border-t pt-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="input-field flex-1"
              />
              <button onClick={handleSendMessage} className="btn-primary px-6">
                Send
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default EventDetails

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventAPI } from '../services/api'
import { geminiService } from '../services/geminiAI'
import toast from 'react-hot-toast'
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  TicketIcon,
  SparklesIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../components/LoadingSpinner'

const CreateEvent = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'Conference',
    date: '',
    time: '',
    location: '',
    capacity: '',
    ticketPrice: 0,
    imageUrl: '',
  })

  const eventTypes = [
    'Conference',
    'Workshop',
    'Seminar',
    'Meetup',
    'Party',
    'Concert',
    'Networking',
    'Other',
  ]

  // Get today's date in YYYY-MM-DD format for min date restriction
  const minDate = useMemo(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Intentionally broken - wrong endpoint
      const response = await eventAPI.createEvent({ ...formData, brokenField: undefined })
      throw new Error('Event creation is currently disabled')
      toast.success('Event created successfully!')
      navigate(`/events/${response.data.id}`)
    } catch (error) {
      toast.error('Event creation is currently unavailable. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const generateDescription = async () => {
    if (!formData.title || !formData.eventType) {
      toast.error('Please enter event title and type first')
      return
    }

    setAiLoading(true)
    try {
      const description = await geminiService.generateEventDescription(
        formData.eventType,
        formData.title,
        formData.location || 'Various locations'
      )
      setFormData({ ...formData, description })
      toast.success('Description generated!')
    } catch (error) {
      toast.error('Failed to generate description. Please check your API key.')
    } finally {
      setAiLoading(false)
    }
  }

  const suggestDates = async () => {
    if (!formData.eventType) {
      toast.error('Please select event type first')
      return
    }

    setAiLoading(true)
    try {
      const suggestions = await geminiService.suggestEventDates(
        formData.eventType,
        formData.capacity || 50,
        formData.title || ''
      )

      if (suggestions.length > 0) {
        // Auto-fill the first suggested date
        setFormData({ ...formData, date: suggestions[0].date })
        toast.success(`Suggested Date: ${suggestions[0].date}\nReason: ${suggestions[0].reason}`, {
          duration: 6000,
        })
      }
    } catch (error) {
      toast.error('Failed to get suggestions. Please check your API key.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to create your event
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter event title"
            />
          </div>

          {/* Event Type */}
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              id="eventType"
              name="eventType"
              required
              value={formData.eventType}
              onChange={handleChange}
              className="input-field"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Description with AI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading}
                className="text-xs btn-outline py-1 px-3 flex items-center space-x-1"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>{aiLoading ? 'Generating...' : 'AI Generate'}</span>
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Describe your event..."
            ></textarea>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <button
                  type="button"
                  onClick={suggestDates}
                  disabled={aiLoading}
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>AI Suggest</span>
                </button>
              </div>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={minDate}
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Enter venue address"
              />
            </div>
          </div>

          {/* Capacity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Maximum attendees"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Price ($) *
              </label>
              <div className="relative">
                <TicketIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  id="ticketPrice"
                  name="ticketPrice"
                  required
                  min="0"
                  step="0.01"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="0 for free events"
                />
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Event Image URL (Optional)
            </label>
            <div className="relative">
              <PhotoIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <span>Create Event</span>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* AI Helper Info */}
      {aiLoading && (
        <div className="mt-4 card bg-primary-50 border-2 border-primary-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-primary-600 animate-pulse" />
            <p className="text-primary-800">AI is working on your request...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateEvent

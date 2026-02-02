import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'

const MyEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      const response = await userAPI.getMyEvents()
      setEvents(response.data || [])
    } catch (error) {
      toast.error('Failed to load your events')
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    const now = new Date()
    if (filter === 'upcoming') {
      return events.filter((event) => new Date(event.date) >= now)
    } else if (filter === 'past') {
      return events.filter((event) => new Date(event.date) < now)
    }
    return events
  }

  const filteredEvents = filterEvents()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-1">Events you've created</p>
        </div>
        <Link to="/create-event" className="btn-primary">
          Create New Event
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full">
                        {event.eventType}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          new Date(event.date) >= new Date()
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>
                          {event.date && format(new Date(event.date), 'MMM dd, yyyy')} at{' '}
                          {event.time}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-500">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>

                      <div className="flex items-center text-gray-500">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        <span>
                          {event.attendeeCount || 0} / {event.capacity} attendees
                        </span>
                      </div>
                    </div>
                  </div>

                  {event.imageUrl && (
                    <div className="ml-6 flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all'
              ? 'No events yet'
              : `No ${filter} events`}
          </h3>
          <p className="text-gray-600 mb-6">
            Start creating amazing events and manage them all in one place
          </p>
          <Link to="/create-event" className="btn-primary inline-flex">
            Create Your First Event
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyEvents

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventAPI, userAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  CalendarIcon, 
  TicketIcon, 
  UsersIcon, 
  SparklesIcon,
  PlusCircleIcon 
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    myEvents: 0,
    myTickets: 0,
  })
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, myEventsRes, myTicketsRes] = await Promise.all([
        eventAPI.getAllEvents(),
        userAPI.getMyEvents(),
        userAPI.getMyTickets(),
      ])

      setStats({
        upcomingEvents: eventsRes.data?.length || 0,
        myEvents: myEventsRes.data?.length || 0,
        myTickets: myTicketsRes.data?.length || 0,
      })

      // Get recent 3 events
      setRecentEvents(eventsRes.data?.slice(0, 3) || [])
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to EventHub! 🎉</h1>
        <p className="text-primary-100">
          Manage your events, book tickets, and connect with attendees all in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Upcoming Events</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.upcomingEvents}</p>
            </div>
            <CalendarIcon className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">My Events</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.myEvents}</p>
            </div>
            <UsersIcon className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">My Tickets</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.myTickets}</p>
            </div>
            <TicketIcon className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/create-event"
            className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border-2 border-primary-200"
          >
            <PlusCircleIcon className="h-8 w-8 text-primary-600" />
            <div>
              <p className="font-semibold text-primary-900">Create New Event</p>
              <p className="text-sm text-primary-600">Start planning your next event</p>
            </div>
          </Link>

          <Link
            to="/events"
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border-2 border-purple-200"
          >
            <SparklesIcon className="h-8 w-8 text-purple-600" />
            <div>
              <p className="font-semibold text-purple-900">Browse Events</p>
              <p className="text-sm text-purple-600">Discover exciting events</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
          <Link to="/events" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {recentEvents.length > 0 ? (
          <div className="space-y-4">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{event.date && format(new Date(event.date), 'MMM dd, yyyy')}</span>
                      <span>•</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full">
                    {event.eventType}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events found. Start by creating your first event!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

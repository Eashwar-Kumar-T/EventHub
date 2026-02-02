import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import {
  TicketIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

const MyTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyTickets()
  }, [])

  const fetchMyTickets = async () => {
    try {
      const response = await userAPI.getMyTickets()
      setTickets(response.data || [])
    } catch (error) {
      toast.error('Failed to load your tickets')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600 mt-1">
            View all your booked tickets in one place
          </p>
        </div>
        <Link to="/events" className="btn-primary">
          Browse Events
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Tickets</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {tickets.length}
              </p>
            </div>
            <TicketIcon className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Upcoming</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {
                  tickets.filter(
                    (t) => t.event?.date && new Date(t.event.date) >= new Date()
                  ).length
                }
              </p>
            </div>
            <CalendarIcon className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Attended</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {
                  tickets.filter(
                    (t) => t.event?.date && new Date(t.event.date) < new Date()
                  ).length
                }
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Ticket Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full">
                      {ticket.event?.eventType || 'Event'}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        ticket.event?.date && new Date(ticket.event.date) >= new Date()
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ticket.event?.date && new Date(ticket.event.date) >= new Date()
                        ? 'Upcoming'
                        : 'Past'}
                    </span>
                  </div>

                  {/* Event Title */}
                  <Link
                    to={`/events/${ticket.eventId}`}
                    className="text-xl font-bold text-gray-900 hover:text-primary-600 mb-2 block"
                  >
                    {ticket.event?.title || 'Event'}
                  </Link>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>
                        {ticket.event?.date
                          ? format(new Date(ticket.event.date), 'EEEE, MMM dd, yyyy')
                          : 'Date TBD'}{' '}
                        at {ticket.event?.time || 'TBD'}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span className="line-clamp-1">
                        {ticket.event?.location || 'Location TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Ticket ID</p>
                        <p className="font-semibold text-gray-900">
                          #{ticket.id?.slice(0, 8) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Quantity</p>
                        <p className="font-semibold text-gray-900">
                          {ticket.quantity || 1}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price per Ticket</p>
                        <p className="font-semibold text-gray-900">
                          ${ticket.event?.ticketPrice || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Paid</p>
                        <p className="font-semibold text-primary-600">
                          $
                          {(
                            (ticket.event?.ticketPrice || 0) * (ticket.quantity || 1)
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booked Date */}
                  {ticket.bookedAt && (
                    <p className="text-xs text-gray-400 mt-3">
                      Booked on {format(new Date(ticket.bookedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>

                {/* QR Code Placeholder */}
                <div className="ml-6 flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <TicketIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">QR Code</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-3">
                <Link
                  to={`/events/${ticket.eventId}`}
                  className="btn-outline flex-1 text-center"
                >
                  View Event Details
                </Link>
                <button className="btn-secondary flex-1">Download Ticket</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <TicketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tickets yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start booking tickets for exciting events happening around you
          </p>
          <Link to="/events" className="btn-primary inline-flex">
            Browse Events
          </Link>
        </div>
      )}
    </div>
  )
}

export default MyTickets

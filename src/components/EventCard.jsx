import { format } from 'date-fns'
import { CalendarIcon, MapPinIcon, UsersIcon, TicketIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const EventCard = ({ event }) => {
  const {
    id,
    title,
    description,
    date,
    time,
    location,
    eventType,
    capacity,
    ticketPrice,
    imageUrl,
  } = event

  return (
    <Link to={`/events/${id}`}>
      <div className="card hover:scale-105 transform transition-transform duration-200 cursor-pointer">
        {/* Event Image */}
        {imageUrl && (
          <div className="h-48 rounded-lg overflow-hidden mb-4">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Event Type Badge */}
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-100 rounded-full mb-3">
          {eventType}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>
              {date && format(new Date(date), 'MMM dd, yyyy')} at {time}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span className="line-clamp-1">{location}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <UsersIcon className="h-4 w-4 mr-2" />
            <span>Capacity: {capacity}</span>
          </div>

          {ticketPrice !== undefined && (
            <div className="flex items-center text-sm text-gray-500">
              <TicketIcon className="h-4 w-4 mr-2" />
              <span className="font-semibold text-primary-600">
                {ticketPrice === 0 ? 'Free' : `$${ticketPrice}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default EventCard

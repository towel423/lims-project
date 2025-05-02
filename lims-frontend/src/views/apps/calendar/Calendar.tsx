// React Imports
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party imports
import type { Dispatch } from '@reduxjs/toolkit'
import 'bootstrap-icons/font/bootstrap-icons.css'

import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions } from '@fullcalendar/core'
import { useEventTable } from "@/hooks/data/useEventData"

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// Type Imports
import type { AddEventType, CalendarColors, CalendarType } from '@/types/apps/calendarTypes'

// Slice Imports
import { filterEvents, selectedEvent, updateEvent } from '@/redux-store/slices/calendar'
import Image from 'next/image'

type CalenderProps = {
  calendarStore: CalendarType
  calendarApi: any
  setCalendarApi: (val: any) => void
  calendarsColor: CalendarColors
  dispatch: Dispatch
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
}

// const { data } = useEventTable();
// console.log('data event', data);
const blankEvent: AddEventType = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    description: ''
  }
}

const Calendar = (props: CalenderProps) => {
  const {
    calendarStore,
    calendarApi,
    setCalendarApi,
    calendarsColor,
    dispatch,
    handleAddEventSidebarToggle,
    handleLeftSidebarToggle
  } = props

  // State to hold events
  const [events, setEvents] = useState<any[]>([]); // Default to an empty array
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null); // State for selected event
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility

  // Fetch events from API
  const { data } = useEventTable(); // Assume this fetches your event data

  // Transform and set events
  useEffect(() => {
    console.log('Event before', data);
    if (data && Array.isArray(data?.data)) {
      const transformedEvents = data.data
      .filter((item: any) => item.status == "1") 
      .map((event: any) => ({
        id: event.id,
        title: event.title.trim(),
        start: combineDateTime(event.start_date, event.start_time),
        end: event.end_date,
        description: event.description, // Custom field for additional info
        location: event.location, // Custom field for location
        allDay: false, // Set to `true` if it's an all-day event
        image_url: event.image_url
      }));

      setEvents(transformedEvents); // Update state with transformed events
    }
  }, [data]);

  const handleEventClick = ({ event: clickedEvent, jsEvent }: any) => {
    jsEvent.preventDefault();

    // Open dialog and set selected event
    setSelectedEvent(clickedEvent);
    setDialogOpen(true);
    console.log(clickedEvent, 'tes');

    // Dispatch Redux actions if needed
    // dispatch(selectedEvent(clickedEvent));
    // handleAddEventSidebarToggle();
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (date: Date) => {
    // Format the date (e.g., "December 25, 2024, 10:00 AM")
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

    // Utility function to combine date and time
  const combineDateTime = (date: string, time: string) => {
    // Example: Combine "2024-12-26" with "17:59" into "2024-12-26T17:59:00"
    const dateFormat = date.split('T')[0];
    return `${dateFormat}T${time}:00`;
  };
  // Refs
  const calendarRef = useRef()

  // Hooks
  const theme = useTheme()

  useEffect(() => {
    if (calendarApi === null) {
      // @ts-ignore
      setCalendarApi(calendarRef.current?.getApi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // calendarOptions(Props)
  const calendarOptions: CalendarOptions = {
    events: events, // Fallback to an empty array if undefined
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev, next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },

    /*
      Enable dragging and resizing event
      ? Docs: https://fullcalendar.io/docs/editable
    */
    editable: true,

    /*
      Enable resizing event from start
      ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
    */
    eventResizableFromStart: true,

    /*
      Automatically scroll the scroll-containers during event drag-and-drop and date selecting
      ? Docs: https://fullcalendar.io/docs/dragScroll
    */
    dragScroll: true,

    /*
      Max number of events within a given day
      ? Docs: https://fullcalendar.io/docs/dayMaxEvents
    */
    dayMaxEvents: 2,

    /*
      Determines if day names and week names are clickable
      ? Docs: https://fullcalendar.io/docs/navLinks
    */
    navLinks: true,

    eventClassNames({ event: calendarEvent }: any) {
      // @ts-ignore
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar]

      return [
        // Background Color
        `event-bg-${colorName}`
      ]
    },

    eventClick: handleEventClick,
    // eventClick({ event: clickedEvent, jsEvent }: any) {
    //   jsEvent.preventDefault()

    //   dispatch(selectedEvent(clickedEvent))
    //   handleAddEventSidebarToggle()

    //   if (clickedEvent.url) {
    //     // Open the URL in a new tab
    //     window.open(clickedEvent.url, '_blank')
    //   }

    //   //* Only grab required field otherwise it goes in infinity loop
    //   //! Always grab all fields rendered by form (even if it get `undefined`)
    //   // event.value = grabEventDataFromEventApi(clickedEvent)
    //   // isAddNewEventSidebarActive.value = true
    // },

    // customButtons: {
    //   sidebarToggle: {
    //     icon: 'tabler tabler-menu-2',
    //     click() {
    //       handleLeftSidebarToggle()
    //     }
    //   }
    // },

    dateClick(info: any) {
      const ev = { ...blankEvent }

      ev.start = info.date
      ev.end = info.date
      ev.allDay = true

      dispatch(selectedEvent(ev))
      handleAddEventSidebarToggle()
    },

    /*
      Handle event drop (Also include dragged event)
      ? Docs: https://fullcalendar.io/docs/eventDrop
      ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
    */
    eventDrop({ event: droppedEvent }: any) {
      dispatch(updateEvent(droppedEvent))
      dispatch(filterEvents())
    },

    /*
      Handle event resize
      ? Docs: https://fullcalendar.io/docs/eventResize
    */
    eventResize({ event: resizedEvent }: any) {
      dispatch(updateEvent(resizedEvent))
      dispatch(filterEvents())
    },

    // @ts-ignore
    ref: calendarRef,

    direction: theme.direction
  }

  return (
    <>
      <FullCalendar {...calendarOptions} />

      {/* Dialog Popup */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <div className='flex w-full justify-center items-center center mb-4'>
              <Image
                  src={selectedEvent.extendedProps.image_url}
                  width={300}
                  height={300}
                  alt={selectedEvent.title}
                  className="w-full h-auto"
                />
              </div>
              <Typography variant="h6">{selectedEvent.title}</Typography>
              <Typography variant="body1">
                <strong>Start:</strong> {formatDate(new Date(selectedEvent.start))}
              </Typography>
              {selectedEvent.end && (
                <Typography variant="body1">
                  <strong>End:</strong> {formatDate(new Date(selectedEvent.end))}
                </Typography>
              )}
              <Typography variant="body1">
                <strong>Location:</strong> {selectedEvent.extendedProps?.location || 'N/A'}
              </Typography>
              <Typography variant="body2">
                {selectedEvent.extendedProps?.description ? (
                  <span
                    dangerouslySetInnerHTML={{ __html: selectedEvent.extendedProps.description }}
                  />
                ) : (
                  'No description available.'
                )}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Close
          </Button>
          {selectedEvent?.url && (
            <Button
              onClick={() => window.open(selectedEvent.url, '_blank')}
              color="secondary"
              variant="contained"
            >
              Open Link
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Calendar

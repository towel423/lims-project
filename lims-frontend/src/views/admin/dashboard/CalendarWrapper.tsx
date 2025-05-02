// MUI Imports
import Card from '@mui/material/Card'

// Component Imports
import CalendarWrapper from '@views/apps/calendar/CalendarWrapper'

// Styled Component Imports
import AppFullCalendar from '@/libs/styles/AppFullCalendar'

const AdminDashboardCalendarWrapper = () => {
  return (
    <Card className='overflow-visible'>
      <AppFullCalendar className='app-calendar'>
        <CalendarWrapper />
      </AppFullCalendar>
    </Card>
  )
}

export default AdminDashboardCalendarWrapper
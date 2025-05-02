import React, { useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEventTable } from "../../../hooks/data/useEventData";
import moment from "moment";
export default function AdminDashboardCalendarWrapper() {
  const { data, setPageSize, setStart, setEnd } = useEventTable();

  useEffect(() => {
    const begin = moment().startOf("month").format("YYYY-MM-DD");
    const end = moment().endOf("month").format("YYYY-MM-DD");

    setStart(begin);
    setEnd(end);
    setPageSize(100);
  }, []);

  return (
    <div className="p-6 pbe-0 flex-grow overflow-visible bg-backgroundPaper rounded">
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          initialEvents={[
            { title: "nice event", start: new Date(), resourceId: "a" },
          ]}
        />
      </div>
    </div>
  );
}

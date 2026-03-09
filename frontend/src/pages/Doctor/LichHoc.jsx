import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const LichHoc = () => {
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Khám bệnh - BS Minh",
      start: "2026-03-10T08:00:00",
      end: "2026-03-10T10:00:00"
    },
    {
      id: "2",
      title: "Học chuyên môn",
      start: "2026-03-11T13:00:00",
      end: "2026-03-11T15:00:00"
    }
  ]);

  // click vào ngày để thêm lịch
  const handleDateClick = (arg) => {
    const title = prompt("Nhập nội dung lịch:");
    if (title) {
      const newEvent = {
        id: Date.now().toString(),
        title,
        start: arg.date,
        allDay: arg.allDay
      };
      setEvents([...events, newEvent]);
    }
  };

  // click vào event
  const handleEventClick = (info) => {
    alert("Lịch: " + info.event.title);
  };

  // kéo thả thay đổi thời gian
  const handleEventChange = (info) => {
    const updatedEvents = events.map((event) =>
      event.id === info.event.id
        ? {
            ...event,
            start: info.event.start,
            end: info.event.end
          }
        : event
    );
    setEvents(updatedEvents);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lịch học / Lịch khám bác sĩ</h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}

        editable={true}
        selectable={true}
        events={events}

        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventChange={handleEventChange}

        height="80vh"
      />
    </div>
  );
};

export default LichHoc;
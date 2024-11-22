import React, { useState, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import AppointmentForm from './AppointmentForm';
import { apiCall } from '../utils';
import { addDays, subDays } from 'date-fns';
import { FaAngleLeft, FaAngleRight, FaPlus } from "react-icons/fa6"

interface Appointment {
  id: number;
  start_datetime: string;
  end_datetime: string;
  title: string;
  description: string;
  employees: number[];
  department: number;
}

interface FormInputs {
  id?: number;
  title: string;
  start_datetime: string;
  end_datetime: string;
  department: number;
  employees: number[];
  description: string;
}

const Calendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const fetchAppointments = async (d: Date) => {
    try {
      const response = await apiCall(`/api/appointments/?start_datetime_gte=${d.toISOString().split("T")[0]}T00:00:00&start_datetime_lt=${addDays(d, 1).toISOString().split("T")[0]}T00:00:00`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log({data})
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(event.target.value));
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    const formatDate = (date: Date) => {
      let year = date.getFullYear();
      let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
      let day = String(date.getDate()).padStart(2, '0');
      let hours = String(date.getHours()).padStart(2, '0');
      let minutes = String(date.getMinutes()).padStart(2, '0');
    
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    appointment.start_datetime = formatDate(new Date(appointment.start_datetime))
    appointment.end_datetime = formatDate(new Date(appointment.end_datetime))
    setSelectedAppointment(appointment);
    setShowForm(true);
  };

  const handleFormSubmit: SubmitHandler<FormInputs> = async (input) => {
    try {
      const { id, employees, ...data } = input
      if (id) {
        const response = await apiCall(`/api/appointments/${id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update appointment');
        }
      } else {
        const response = await apiCall('/api/appointments/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create appointment');
        }
        employees.forEach(async(e) => {
          const newApp = await response.json()
          const r = await apiCall('/api/appointment_employee/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ appointment: newApp.id, employee: e }),
          });
          if (!r.ok) {
            throw new Error('Failed to create appointment');
          }
        })
      }
      await fetchAppointments(selectedDate)
      setShowForm(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const changeDayTo = async(d: Date) => {
    setSelectedDate(d)
    await fetchAppointments(d)
  }

  return (
    <div className="flex flex-col max-h-screen w-full max-w-[500px]">
      <div className='flex gap-2 p-2'>
        <button className='px-2' onClick={() => changeDayTo(subDays(selectedDate, 1))}>
            <FaAngleLeft />
        </button>
        <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="p-2 border rounded-lg w-full"
        />
        <button className='px-2' onClick={() => changeDayTo(addDays(selectedDate, 1))}>
            <FaAngleRight />
        </button>
      </div>
      <div className="border-t border-l h-full" style={{ overflow: "auto" }}>
        {[...Array(24)].map((_, hour) => (
          <div key={hour} className="border-b border-r h-16 relative">
            <span className="absolute left-0 top-0 text-xs">{hour}:00</span>
            {appointments
              .filter(app => new Date(app.start_datetime).getHours() === hour)
              .map((app, i, arr) => (
                <div
                  key={app.id}
                  className="absolute right-0 bg-blue-500 text-white p-1 rounded cursor-pointer"
                  style={{
                    left: i,
                    top: `${(new Date(app.start_datetime).getMinutes() / 60) * 100}%`,
                    height: `${((new Date(app.end_datetime).getTime() - new Date(app.start_datetime).getTime()) / 3600000) * 100}%`
                  }}
                  onClick={() => handleAppointmentClick(app)}
                >
                  {app.title}
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className='flex items-center justify-center p-3 border-t'>
        <button
            onClick={() => {
            setShowForm(true);
            setSelectedAppointment(null);
            }}
            className="py-2 px-3 bg-blue-500 text-white rounded-lg flex items-center gap-2"
        >
            <FaPlus/>New Appointment
        </button>
      </div>

      {showForm && (
        <AppointmentForm
          onSubmit={handleFormSubmit}
          selectedAppointment={selectedAppointment}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Calendar;
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { apiCall } from '../utils';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  department: number;
}

const formSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  start_datetime: z.string().min(1, "Start date and time is required"),
  end_datetime: z.string().min(1, "End date and time is required"),
  department: z.number().min(1, "Department is required"),
  employees: z.array(z.number()).min(1, "At least one employee is required"),
  description: z.string().min(1, "Description is required"),
});

type FormInputs = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  onSubmit: SubmitHandler<FormInputs>;
  selectedAppointment: FormInputs | null;
  onClose: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, selectedAppointment, onClose }) => {
  const { watch, register, setValue, reset, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [localEmployeeSelection, setLocalEmployeeSelection] = useState<number | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await apiCall('/api/departments/');
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedAppointment) {
      reset(selectedAppointment);
      fetchEmployees(selectedAppointment.department);
      if(selectedAppointment.employees) {
        Promise.all(selectedAppointment.employees.map(getEmployeeById)).then(setSelectedEmployees)
      }
    } else {
      reset();
    }
  }, [selectedAppointment, reset]);

  const getEmployeeById = async(id: number) => {
    const response = await apiCall(`/api/employees/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return await response.json();
  }

  const fetchEmployees = async (departmentId: number) => {
    const url = departmentId ? `/api/employees/?department=${departmentId}` : "/api/employees/";
    try {
      const response = await apiCall(url);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const departmentId = Number(event.target.value);
    fetchEmployees(departmentId);
    setValue('department', departmentId);
  };

  const handleAddEmployee = () => {
    if (localEmployeeSelection !== null && !selectedEmployees.find(emp => emp.id === localEmployeeSelection)) {
      const employeeToAdd = employees.find(emp => emp.id === localEmployeeSelection);
      if (employeeToAdd) {
        setSelectedEmployees([...(selectedEmployees || []), employeeToAdd]);
        setValue('employees', [...(watch('employees') || []), localEmployeeSelection]);
        setLocalEmployeeSelection(null); // Reset the selection
      }
    }
  };
  

  const handleRemoveEmployee = async (employeeId: number) => {
    if(selectedAppointment && selectedAppointment.employees.includes(employeeId)) {
      const resp = await apiCall(`/api/appointment_employee/delete/${employeeId}/`, { method: "DELETE" })
    }
    const filteredEmployees = selectedEmployees.filter(emp => emp.id !== employeeId);
    setSelectedEmployees(filteredEmployees);
    setValue('employees', filteredEmployees.map(emp => emp.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-[500px]">
        <h2 className="text-lg font-bold">{selectedAppointment ? 'Edit Appointment' : 'New Appointment'}</h2>
        <div>
          <label className="mt-4">Title</label>
          <input
            type="text"
            {...register('title')}
            placeholder="Title"
            className="block w-full p-2 border rounded-lg"
          />
          {errors.title && <p className="text-red-500">{errors.title.message}</p>}

          <div className="flex mt-4 space-x-4">
            <div className="flex-1">
              <label>Start Date</label>
              <input
                type="datetime-local"
                {...register('start_datetime')}
                className="block w-full p-2 border rounded-lg"
              />
              {errors.start_datetime && <p className="text-red-500">{errors.start_datetime.message}</p>}
            </div>
            <div className="flex-1">
              <label>End Date</label>
              <input
                type="datetime-local"
                {...register('end_datetime')}
                className="block w-full p-2 border rounded-lg"
              />
              {errors.end_datetime && <p className="text-red-500">{errors.end_datetime.message}</p>}
            </div>
          </div>

          <label className="mt-4">Description</label>
          <textarea
            {...register('description')}
            placeholder="Description"
            className="block w-full p-2 border rounded-lg"
          />
          {errors.description && <p className="text-red-500">{errors.description.message}</p>}

          <label className="mt-4">Participants</label>
          <div className="flex space-x-2 mt-2">
            <select
              {...register('department')}
              onChange={handleDepartmentChange}
              className="p-2 border rounded-lg"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>

            <select
              value={localEmployeeSelection ?? ""}
              onChange={(e) => setLocalEmployeeSelection(Number(e.target.value))}
              className="p-2 border rounded-lg"
              disabled={employees.length === 0}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>


            <button
              type="button"
              onClick={handleAddEmployee}
              className="py-2 px-4 bg-green-500 text-white rounded-lg"
              disabled={employees.length === 0}
            >
              Add
            </button>
          </div>

          <div className="mt-4">
            {selectedEmployees.map(emp => (
              <div key={emp.id} className="flex justify-between items-center mt-2">
                <span>{emp.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmployee(emp.id)}
                  className="py-1 px-2 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <button type='button'
            onClick={() => onSubmit(watch())}
            className="mt-2 py-2 px-3 bg-blue-500 text-white rounded-lg"
          >
            Save
          </button>

          {/* Add Delete Button Here */}
          {selectedAppointment && (
            <button
              type="button"
              onClick={() => {
                // Add logic to handle appointment deletion
                if (window.confirm('Are you sure you want to delete this appointment?')) {
                  // Call a deletion function or API
                  console.log('Delete appointment logic here');
                }
              }}
              className="mt-2 py-2 px-3 bg-yellow-500 text-white rounded-lg ml-2"
            >
              Delete
            </button>
          )}

          <button
            onClick={onClose}
            className="mt-2 py-2 px-3 bg-red-500 text-white rounded-lg ml-2"
          >
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;

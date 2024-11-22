from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from employees.models import Employee, Department
from .models import Appointment
from datetime import timedelta
from django.utils import timezone

class AppointmentTests(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name="IT", description="IT Department")
        self.employee = Employee.objects.create(name="John Doe", email="john@example.com", position="employee", department=self.department)
        self.appointment = Appointment.objects.create(
            start_datetime=timezone.now(),
            end_datetime=timezone.now() + timedelta(hours=1),
            title="Meeting",
            description="Project discussion",
            employee=self.employee
        )

    def test_create_appointment(self):
        url = reverse('appointment-list')
        data = {
            'start_datetime': timezone.now(),
            'end_datetime': timezone.now() + timedelta(hours=1),
            'title': 'New Meeting',
            'description': 'Discuss new project',
            'employee': self.employee.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_appointment(self):
        url = reverse('appointment-detail', args=[self.appointment.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.appointment.title)

    def test_update_appointment(self):
        url = reverse('appointment-detail', args=[self.appointment.id])
        data = {
            'start_datetime': timezone.now(),
            'end_datetime': timezone.now() + timedelta(hours=2),
            'title': 'Updated Meeting',
            'description': 'Updated project discussion',
            'employee': self.employee.id
        }
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Meeting')

    def test_delete_appointment(self):
        url = reverse('appointment-detail', args=[self.appointment.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
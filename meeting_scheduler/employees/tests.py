from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Employee, Department

class EmployeeTests(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name="IT", description="IT Department")
        self.employee = Employee.objects.create(name="John Doe", email="john@example.com", position="employee", department=self.department)

    def test_create_employee(self):
        url = reverse('employee-list')
        data = {'name': 'Jane Doe', 'email': 'jane@example.com', 'position': 'manager', 'department': self.department.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_employee(self):
        url = reverse('employee-detail', args=[self.employee.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.employee.name)

    def test_update_employee(self):
        url = reverse('employee-detail', args=[self.employee.id])
        data = {'name': 'John Updated', 'email': 'john_updated@example.com', 'position': 'manager', 'department': self.department.id}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'John Updated')

    def test_delete_employee(self):
        url = reverse('employee-detail', args=[self.employee.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filter_employee_by_email(self):
        url = reverse('employee-list')
        response = self.client.get(url, {'search': 'john@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], 'john@example.com')

    def test_filter_employee_by_name(self):
        url = reverse('employee-list')
        response = self.client.get(url, {'search': 'John Doe'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'John Doe')
        

class DepartmentTests(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name="IT", description="IT Department")
        self.employee = Employee.objects.create(name="John Doe", email="john@example.com", position="employee", department=self.department)

    def test_create_department(self):
        url = reverse('department-list')
        data = {'name': 'HR', 'description': 'Human Resources'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_get_department(self):
        url = reverse('department-detail', args=[self.department.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.department.name)

    def test_update_department(self):
        url = reverse('department-detail', args=[self.department.id])
        data = {'name': 'IT Updated', 'description': 'Updated IT Department'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'IT Updated')

    def test_delete_department(self):
        url = reverse('department-detail', args=[self.department.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_get_employees_of_department(self):
        url = reverse('department-employees', args=[self.department.id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'John Doe')
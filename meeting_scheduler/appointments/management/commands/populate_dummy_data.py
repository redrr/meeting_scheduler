from django.core.management.base import BaseCommand
from employees.models import Employee, Department
from appointments.models import Appointment
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Populate the database with dummy data'

    def handle(self, *args, **kwargs):
        # Create Departments
        it_department = Department.objects.create(name="IT", description="IT Department")
        hr_department = Department.objects.create(name="HR", description="Human Resources Department")

        # Create Employees
        employee1 = Employee.objects.create(name="John Doe", email="john.doe@example.com", position="employee", department=it_department)
        employee2 = Employee.objects.create(name="Jane Smith", email="jane.smith@example.com", position="manager", department=hr_department)

        # Create Appointments and associate with employees
        now = timezone.now()
        appointment1 = Appointment.objects.create(
            start_datetime=now + timedelta(hours=1),
            end_datetime=now + timedelta(hours=2),
            title="Project Meeting",
            description="Discuss project requirements"
        )
        appointment2 = Appointment.objects.create(
            start_datetime=now + timedelta(hours=3),
            end_datetime=now + timedelta(hours=4),
            title="HR Meeting",
            description="Discuss HR policies"
        )

        # Adding employees to the appointments (ManyToManyField)
        appointment1.employees.set([employee1, employee2])  # Associate both employees with the first appointment
        appointment2.employees.set([employee2])  # Associate only the second employee with the second appointment

        self.stdout.write(self.style.SUCCESS('Successfully populated the database with dummy data'))

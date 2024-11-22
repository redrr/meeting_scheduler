from django.db import models
from employees.models import Employee

class Appointment(models.Model):
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    employees = models.ManyToManyField(Employee, through='AppointmentEmployee', related_name='appointments')

    def __str__(self):
        return self.title

class AppointmentEmployee(models.Model):
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
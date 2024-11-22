from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=255)
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, related_name='managed_departments')
    description = models.TextField()

    def __str__(self):
        return self.name

class Employee(models.Model):
    POSITION_CHOICES = [
        ('employee', 'Employee'),
        ('manager', 'Manager'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=10, choices=POSITION_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='employees')

    def __str__(self):
        return self.name
from rest_framework import viewsets

from .filters import AppointmentFilter
from .models import Appointment, AppointmentEmployee
from .serializers import AppointmentEmployeeSerializer, AppointmentSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AppointmentFilter
    
    
class AppointmentEmployeeViewSet(viewsets.ModelViewSet):
    queryset = AppointmentEmployee.objects.all()
    serializer_class = AppointmentEmployeeSerializer
    
class DeleteAppointmentEmployeeByEmployeeId(APIView):
    def delete(self, request, employee_id):
        try:
            # Retrieve all AppointmentEmployee objects related to the employee
            appointment_employees = AppointmentEmployee.objects.filter(employee__id=employee_id)
            if not appointment_employees.exists():
                raise NotFound(f"No AppointmentEmployee records found for employee ID {employee_id}")

            # Delete the AppointmentEmployee records
            deleted_count, _ = appointment_employees.delete()

            return Response(
                {"detail": f"{deleted_count} AppointmentEmployee records deleted."})
        except AppointmentEmployee.DoesNotExist:
            raise NotFound(f"Employee with ID {employee_id} does not exist.")
from rest_framework import serializers
from .models import Appointment, AppointmentEmployee

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        
class AppointmentEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentEmployee
        fields = '__all__'
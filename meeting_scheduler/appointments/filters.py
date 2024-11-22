import django_filters

from .models import Appointment

class AppointmentFilter(django_filters.FilterSet):
    start_datetime_gte = django_filters.DateTimeFilter(field_name="start_datetime", lookup_expr='gte')
    start_datetime_lt = django_filters.DateTimeFilter(field_name="start_datetime", lookup_expr='lt')

    class Meta:
        model = Appointment
        fields = ['start_datetime_gte', 'start_datetime_lt']
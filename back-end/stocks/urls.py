from django.contrib import admin
from django.urls import path
from .views import get_stock_data

urlpatterns = [
    path('stock/<str:symbol>/',get_stock_data),
]

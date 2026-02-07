from django.urls import path
from .views import admin_login, admin_dashboard, admin_users, approve_user

urlpatterns = [
    path("login/", admin_login),
    path("dashboard/", admin_dashboard),
    path("users/", admin_users),
    path("users/approve/<int:profile_id>/", approve_user),
   
]
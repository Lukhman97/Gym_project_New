from django.urls import path
from .views import register_user, user_login, user_dashboard,create_trainer,trainer_users,trainer_login, trainer_dashboard,add_daily_update,user_updates

urlpatterns = [
    path("register/", register_user),
    path("login/", user_login),
    path("dashboard/", user_dashboard),
    path("trainer/create/",create_trainer),
    path("trainer/users/",trainer_users),
       path("trainer/login/", trainer_login),
    path("trainer/dashboard/", trainer_dashboard),
    path("trainer/add-update/", add_daily_update),
path("user/updates/", user_updates),
]
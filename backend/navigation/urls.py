from django.urls import path

from . import views

urlpatterns = [
    path("chat/", views.chat, name="navigation-chat"),
    path("return-route/", views.return_route, name="navigation-return-route"),
]

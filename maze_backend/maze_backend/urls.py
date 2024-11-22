"""
URL configuration for maze_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from myapp.views import run_qlearn
from myapp.views import sse_view, save_maze, get_maze, sarsaSSE, run_sarsa, cancel_task, start_task





urlpatterns = [
    path('admin/', admin.site.urls),
    path('run_qlearn/', run_qlearn),
    path('sse/', sse_view, name='sse'),
    path('save_maze/', save_maze, name='save_maze'),
    path('get_maze/<int:maze_id>/', get_maze, name='get_maze'),
    path('sarsa/', run_sarsa, name='sarsa'),
    path('sarsa_sse/', sarsaSSE, name='sarsa_sse'),
    path('start-task/', start_task, name='start_task'),
    path('cancel-task/<str:task_id>/', cancel_task, name='cancel_task'),
    
]


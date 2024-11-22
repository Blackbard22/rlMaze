# tasks.py
from huey import crontab
from huey.contrib.djhuey import task, periodic_task
import time


@task()
def my_first_task(param):
    print(f"Task running with param: {param}") 
    print("Task running")
    time.sleep(1)
    return "Task completed"

@periodic_task(crontab(minute='0', hour='*/3'))
def periodic_task():
    print("This task runs every 3 hours")


# from huey import CancellationError
from huey.contrib.djhuey import task
import time


from huey.contrib.djhuey import task
from .models import TaskStatus
import time

@task()
def long_running_task(task_id):
    for i in range(30):
        # Check if the task should be cancelled
        try:
            task_status = TaskStatus.objects.get(task_id=task_id)
            if task_status.status == 'cancelled':
                print(f'Task {task_id} cancelled')
                return
        except TaskStatus.DoesNotExist:
            pass  # Task not cancelled
        
        # Simulate work
        print(f'Task {task_id} running step {i}')
        time.sleep(1)

    print(f'Task {task_id} completed')
    return 'Task completed successfully'


from django.db import models

# Create your models here.

class Maze(models.Model):
    name = models.CharField(max_length=100)
    layout = models.JSONField()  # Stores the maze layout as a JSON object
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


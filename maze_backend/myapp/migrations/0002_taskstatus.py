# Generated by Django 5.1 on 2024-09-23 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskStatus',
            fields=[
                ('task_id', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('status', models.CharField(max_length=20)),
            ],
        ),
    ]

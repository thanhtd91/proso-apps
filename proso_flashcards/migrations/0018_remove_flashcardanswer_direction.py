# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-05-13 05:25
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('proso_flashcards', '0017_directions_to_types'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='flashcardanswer',
            name='direction',
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-11-22 03:36
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proso_flashcards', '0004_category_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='display_priority',
            field=models.FloatField(blank=True, default=0, null=True),
        ),
    ]

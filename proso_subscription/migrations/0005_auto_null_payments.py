# -*- coding: utf-8 -*-
# Generated by Django 1.9.1 on 2016-10-10 05:25
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('proso_subscription', '0004_auto_discount_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='subscription',
            name='payment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='gopay_django_api.Payment'),
        ),
    ]

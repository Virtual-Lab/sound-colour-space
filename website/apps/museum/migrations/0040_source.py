# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2017-02-23 11:00
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('museum', '0039_auto_20170112_1755'),
    ]

    operations = [
        migrations.CreateModel(
            name='Source',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uuid', models.UUIDField(default=uuid.uuid4, editable=False)),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='created')),
                ('modified', models.DateTimeField(auto_now=True, verbose_name='modified')),
                ('ref', models.CharField(max_length=16, unique=True, verbose_name='reference')),
                ('title', models.CharField(blank=True, max_length=200, null=True, verbose_name='copyright_notice')),
                ('text', models.TextField(blank=True, null=True, verbose_name='source')),
                ('source', models.CharField(choices=[(b'PS', b'Primary Source'), (b'SS', b'Secondary Source')], default=b'PS', max_length=2)),
                ('url1', models.URLField(blank=True, null=True, verbose_name='url')),
                ('url2', models.URLField(blank=True, null=True, verbose_name='url')),
                ('url3', models.URLField(blank=True, null=True, verbose_name='url')),
                ('url4', models.URLField(blank=True, null=True, verbose_name='url')),
            ],
            options={
                'ordering': ('-source',),
                'db_table': 'museum_source',
                'verbose_name': 'source',
                'verbose_name_plural': 'sources',
            },
        ),
    ]
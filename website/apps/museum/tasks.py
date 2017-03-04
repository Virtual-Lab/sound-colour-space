# -*- coding: utf-8 -*-

from celery import shared_task
from django.apps import apps
from easy_thumbnails.files import generate_all_aliases

import logging

log = logging.getLogger(__name__)

@shared_task
def generate_thumbnails_task(app_label, model_name, pk, field):
    m = apps.get_model(app_label=app_label, model_name=model_name)
    instance = m._default_manager.get(pk=pk)
    fieldfile = getattr(instance, field)
    log.debug('task - generate thumbnail for {}'.format(instance))
    print (fieldfile)
    generate_all_aliases(fieldfile, include_global=True)

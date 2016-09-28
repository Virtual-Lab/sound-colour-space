import re
from datetime import datetime
from django.utils import timezone

from django.core.management.base import BaseCommand, CommandError

from museum.models import Entry


class Command(BaseCommand):
    help = 'Create datetime date from MAdeK\'s "portryed object date"'

    def handle(self, *args, **options):
        entries = Entry.objects.all()
        total = 0
        for e in entries:
            # match 4 digits at start of portrayed_object_date
            m = re.findall('^(\d{4})', str(e.portrayed_object_date))
            if m:
                total += 1
                date = datetime.strptime(m[0], '%Y')
                date = timezone.make_aware(date, timezone.get_current_timezone())
                e.date = date
                e.date_accuracy = 3
                e.save()
        self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))


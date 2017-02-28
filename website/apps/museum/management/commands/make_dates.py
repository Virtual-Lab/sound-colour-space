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
            # match "c. XXXX" or "ca. XXXX" in portrayed_object_date
            m = re.findall('c\w?.?\s?(\d{4})', str(e.portrayed_object_date))
            if m:

                date = datetime.strptime(m[0], '%Y')
                date = timezone.make_aware(date, timezone.get_current_timezone())

                print ("{} \t {} \t\t\t {} \t".format(e.portrayed_object_date, e.date, date))

                e.date = date
                e.date_accuracy = 3
                e.save()
                total += 1
            # match "XXth"
            m = re.findall('(\d{2}th)', str(e.portrayed_object_date))
            if m:
                year = m[0].strip('th')
                year = int(year)
                year = (year - 1) * 100
                year = '{:04}'.format(year)

                date = datetime.strptime(year, '%Y')
                date = timezone.make_aware(date, timezone.get_current_timezone())
                print ("{} \t {} \t\t\t {} \t".format(e.portrayed_object_date, e.date, date))

                e.date = date
                e.date_accuracy = 5
                e.save()
                total += 1
        self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))


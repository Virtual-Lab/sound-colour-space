import csv
from django.core.management.base import BaseCommand, CommandError

from museum.models import Entry

class MyDialect(csv.Dialect):
    strict = True
    skipinitialspace = True
    quoting = csv.QUOTE_ALL
    delimiter = ';'
    quotechar = '"'
    lineterminator = '\n'


class Command(BaseCommand):
    help = 'Import CSV annotations in the form of "title, annotation, id"'

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='+', type=str)

    def handle(self, *args, **options):
        total = 0
        with open(options['path'][0], 'rb') as csvfile:
            r = csv.reader(csvfile, MyDialect())
            for i in r:
                # print ("#%s: %s \n\n%s") % (i[2], i[0], i[1])

                entries = Entry.objects.filter(image__icontains=i[0])
                if len(entries) == 0:
                    self.stdout.write(self.style.WARNING('no entries for %s, ref: %s.' % (i[0], i[2])))
                elif len(entries) > 1:
                    self.stdout.write(self.style.WARNING('multiple entries for %s, ref: %s' % (i[0], i[2])))
                else:
                    entries[0].description = unicode(i[1], errors='ignore')
                    entries[0].doc_id = i[2]
                    entries[0].save()
                    total += 1

        self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))




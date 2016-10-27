from django.core.management.base import BaseCommand, CommandError

import re
from museum.models import Entry, Collection


class Command(BaseCommand):
    help = 'Set description and set related entries based on annotations (regular expression search)'

    def add_arguments(self, parser):
        parser.add_argument('type', type=str)

    def handle(self, *args, **options):

        if (options['type'] == 'sets'):
            sets = Collection.objects.all()
            total = 0
            for s in sets:
                # match 1-3 numbers in brackets
                matches = re.findall('\[\d{1,3}\]', unicode(s.description))
                if matches:
                    i = 0
                    for m in matches:
                        number = (int)(matches[i].replace('[', '').replace(']', ''))
                        try:
                            ref = Entry.objects.get(doc_id=number)
                            title = ref.title
                            # update description text: [doc_id](doc_id "title")
                            s.description = s.description.replace(matches[i], '[' + matches[i] + '](diagram/' + str(
                                number) + ' "' + title + '")')

                            s.save()
                        except (Entry.DoesNotExist):
                            self.stdout.write(self.style.WARNING('Referenced entry does not exist: %s' % number))

                        i += 1



                # match 5 numbers in brackets
                matches = re.findall('\[\d\d\d\d\d\]', unicode(s.description))
                if matches:
                    i = 0
                    for m in matches:
                        number = (int)(matches[i].replace('[', '').replace(']', ''))
                        try:
                            ref = Collection.objects.get(doc_id=number)
                            title = ref.title
                            # update description text: [doc_id](doc_id "title")
                            s.description = s.description.replace(matches[i], '[' + matches[i] + '](set/' + ref.slug + ' "' + title + '")')

                            s.save()
                        except (Collection.DoesNotExist):
                            self.stdout.write(self.style.WARNING('Referenced set does not exist: %s' % number))

                        i += 1

                total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s sets.' % total))

        elif (options['type'] == 'diagrams'):
            entries = Entry.objects.all()
            total = 0
            for e in entries:
                matches = re.findall('\[\d+\]', unicode(e.description))
                if matches:
                    i = 0
                    for m in matches:
                        number = (int)(matches[i].replace('[', '').replace(']', ''))
                        try:
                            ref = Entry.objects.get(doc_id=number)
                            title = ref.title
                            # update description text: [doc_id](doc_id "title")
                            e.description = e.description.replace(matches[i], '[' + matches[i] + '](diagram/' + str(
                                number) + ' "' + title + '")')

                            # add related obj
                            e.related.add(ref)

                            e.save()

                            # save only number for related set
                            # matches[i] = number
                        except (Entry.DoesNotExist):
                            self.stdout.write(self.style.WARNING('Referenced entry does not exist: %s' % number))

                        i += 1

                    total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))





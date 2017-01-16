from django.core.management.base import BaseCommand, CommandError

import re
from museum.models import Entry, Collection


class Command(BaseCommand):
    help = 'Set description and set related entries based on annotations (regular expression search)'

    ref_id = []

    def add_arguments(self, parser):
        parser.add_argument('type', type=str)

    def repl(self, matchobj):
        refs = []
        for x in (matchobj.group(0).replace('[', '').replace(']', '').replace(' ','').split(',')):
            self.ref_id.append(int(x))
            refs += {'[' + x + '][]'}
        return "[" + ','.join(refs) + "]"

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
                e.description = re.sub("\[([\d, *]+)\]", self.repl, unicode(e.description))

                # ref: [45]: /diagrams/45 "Diatonic Scale"
                for i in self.ref_id:
                    try:
                        ref = Entry.objects.get(doc_id=i)
                        ref_link = '\r\n[' + str(ref.doc_id) + ']' + ': /' + ref.get_absolute_url() + " \"" + ref.title + "\""
                        e.description += ref_link

                        e.save()
                    except Entry.DoesNotExist:
                        self.stdout.write(self.style.WARNING('Referenced entry does not exist: %s' % i))

                self.ref_id = []

                total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))





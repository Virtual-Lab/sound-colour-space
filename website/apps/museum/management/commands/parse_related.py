from django.core.management.base import BaseCommand, CommandError

import re
from museum.models import Entry


class Command(BaseCommand):
    help = 'Set related entries based on annotations (regular expression search)'

    def handle(self, *args, **options):

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
                        e.description = e.description.replace(matches[i], '[' + matches[i] + '](' + str(
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





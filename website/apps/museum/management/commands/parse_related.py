from django.core.management.base import BaseCommand, CommandError

import collections
import re
from museum.models import Entry


class Command(BaseCommand):
    help = 'Set related entries based on annotations (regular expression search)'

    def handle(self, *args, **options):

        entries = Entry.objects.all()

        refs = {}
        total = 0

        for e in entries:
            matches = re.findall('\[\d+\]', unicode(e.description))
            if matches:
                i = 0
                for m in matches:
                    matches[i] = (int)(matches[i].replace('[', '').replace(']', ''))
                    i += 1
                refs[e.doc_id] = matches

        od = collections.OrderedDict(sorted(refs.items()))
        for id, refs in od.items():
            # print ("%s: %s") % (id, refs)

            related_objs = Entry.objects.filter(doc_id__in=refs)
            e = Entry.objects.filter(doc_id=id)[0]
            if related_objs:
                print e, '==>', related_objs

            e.related.set(related_objs)
            total += 1

        self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))





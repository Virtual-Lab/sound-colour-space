from django.core.exceptions import ObjectDoesNotExist
from django.core.management.base import BaseCommand, CommandError

import re
from museum.models import Entry, Collection, Experiment, Exhibition


class Command(BaseCommand):
    help = 'Set description and set related entries based on annotations (regular expression search)'

    ref_id = []

    def add_arguments(self, parser):
        parser.add_argument('type', type=str)

    def repl(self, matchobj):
        refs = []
        # get the numbers from the match
        for x in (matchobj.group(0).replace('[', '').replace(']', '').replace(' ','').split(',')):
            # save the id for later
            self.ref_id.append(int(x))
            # construct markdown href
            refs += {'[' + x + '][]'}
        # return all href as comma separated string with surrounding brackets
        return "[" + ','.join(refs) + "]"

    def replPrimarySources(self, matchobj):
        refs = []
        # get the ref and title from the match
        s = matchobj.group(0)
        ref = s[s.find("(") + 1:s.find(")")]
        title = s[s.find(")") + 1:].strip(' ').strip(']')
        link = '[' + ref + ']: /sources/' + ref + ' \"' + title + '\"'
        self.ref_id.append(link)
        return "[[" + title + "][" + ref + "]]"

    def replSecondarySources(self, matchobj):
        refs = []
        # get the ref and title from the match
        s = matchobj.group(0)
        ref = s[s.find("<") + 1:s.find(">")]
        title = s[s.find(">") + 1:].strip(' ').strip(']')
        link = '[' + ref + ']: /sources/' + ref + ' \"' + title + '\"'
        self.ref_id.append(link)
        return "[[" + title + "][" + ref + "]]"

    def update_description_for_obj(self, obj):
        changed = False

        # get references
        obj.description = re.sub("\[(\d+)(\s*,?\s*\d+)*\]", self.repl, unicode(obj.description))

        # ref: [45]: /diagrams/45 "Diatonic Scale"
        # set: [10003]: /sets/10003 "Chromatic Scales"
        for i in self.ref_id:
            try:
                if i < 10000:
                    ref = Entry.objects.get(doc_id=i)
                else:
                    ref = Collection.objects.get(doc_id=i)

                ref_link = '\r\n[' + str(
                    ref.doc_id) + ']' + ': /' + ref.get_absolute_url() + " \"" + ref.title + "\""
                # append the references at the end of the text
                obj.description += ref_link
                obj.save()
                changed = True
            except ObjectDoesNotExist:
                self.stdout.write(self.style.WARNING('Referenced entry does not exist: %s' % i))

        # clear list
        self.ref_id = []

        # get sources
        obj.description = re.sub("\[\\((.*?)\\)(.*?)\]", self.replPrimarySources, unicode(obj.description))

        for i in self.ref_id:
            ref_link = '\r\n' + i
            obj.description += ref_link
            obj.save()
            changed = True

        # clear list
        self.ref_id = []

        # get secondary sources
        obj.description = re.sub("\[\\<(.*?)\\>(.*?)\]", self.replSecondarySources, unicode(obj.description))

        for i in self.ref_id:
            ref_link = '\r\n' + i
            obj.description += ref_link
            obj.save()
            changed = True

        # clear list
        self.ref_id = []

        return changed

    def handle(self, *args, **options):

        if options['type'] == 'sets':
            sets = Collection.objects.all()
            total = 0
            for s in sets:
                if self.update_description_for_obj(s):
                    total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s sets.' % total))

        elif options['type'] == 'diagrams':
            entries = Entry.objects.all()
            total = 0
            for e in entries:
                if self.update_description_for_obj(e):
                    total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))

        elif options['type'] == 'experiments':
            experiments = Experiment.objects.all()
            total = 0
            for e in experiments:
                if self.update_description_for_obj(e):
                    total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))

        elif options['type'] == 'exhibitions':
            exhibitions = Exhibition.objects.all()
            total = 0
            for e in exhibitions:
                if self.update_description_for_obj(e):
                    total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))




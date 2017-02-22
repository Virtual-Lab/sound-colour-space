# -*- coding: latin-1 -*-
from django.core.management.base import BaseCommand, CommandError

import codecs

from django.db import IntegrityError
from museum.models import Entry, Collection, Keyword


class Command(BaseCommand):
    help = 'Import CSV annotations'

    def add_arguments(self, parser):
        parser.add_argument('type', type=str)
        parser.add_argument('path', type=str)

    def handle(self, *args, **options):
        total = 0

        if options['type'] == 'sets':
            with codecs.open(options['path'], 'r', encoding='cp1252') as f:
                for line in f:
                    item = line.split(u"\u00A7")
                    print ("#%s: %s \n\n%s") % (item[3], item[0], item[2])

                    sets = Collection.objects.filter(title__istartswith=item[0])
                    if len(sets) == 0:
                        self.stdout.write(self.style.WARNING('no set for %s, ref: %s.' % (item[0], item[3])))
                    elif len(sets) > 1:
                        self.stdout.write(self.style.WARNING('multiple sets for %s, ref: %s' % (item[0], item[3])))
                    else:
                        annotation = item[2]
                        # two spaces before newline for markdown break
                        annotation = annotation.replace('##', '  \r\n')
                        annotation = annotation.replace('####', '\r\n\r\n')
                        sets[0].description = annotation
                        sets[0].doc_id = item[3]
                        sets[0].save()
                        total += 1
            self.stdout.write(self.style.SUCCESS('Updated %s sets.' % total))

        elif options['type'] == 'diagrams':
            with codecs.open(options['path'], 'r', encoding='cp1252') as f:
                for line in f:
                    # split by § (section)
                    item = line.split(u"\u00A7")
                    # check by image (jpg) name, entries should have only one entry, but we capture all
                    # for error handling
                    entries = (x for x in Entry.objects.all() if x.filename == item[2])
                    i = 0
                    for e in entries:
                        if i > 0:
                            self.stdout.write(
                                self.stdout.write(self.style.WARNING('multiple entries for %s doc_id: %s' % (e, e.doc_id))))
                            continue

                        annotation = item[3]
                        # two spaces before newline for markdown break
                        annotation = annotation.replace('##', '  \r\n')
                        annotation = annotation.replace('####', '\r\n\r\n')
                        e.description = annotation
                        try:
                            e.doc_id = int(item[0])
                            e.save()
                            total += 1
                        except Exception as err:
                            self.stdout.write(self.style.WARNING('warning:  %s: %s' % (e.doc_id, err)))
                            continue

                        i += 1

            self.stdout.write(self.style.SUCCESS('Updated %s entries.' % total))

        elif options['type'] == 'keywords':
            with codecs.open(options['path'], 'r', encoding='cp1252') as f:
                for line in f:
                    item = line.split(u"\u00A7")

                    name = item[0].strip(' ')

                    keywords = Keyword.objects.filter(name__iexact=name)

                    if len(keywords) == 0:
                        self.stdout.write(self.style.WARNING('no keywords for %s.' % name))
                    elif len(keywords) > 1:
                        self.stdout.write(self.style.WARNING('multiple keywords for %s' % name))
                    else:
                        annotation = item[2]
                        # two spaces before newline for markdown break
                        annotation = annotation.replace('##', '  \r\n')
                        annotation = annotation.replace('####', '\r\n\r\n')
                        keywords[0].description = annotation
                        keywords[0].save()

                        total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s keywords.' % total))

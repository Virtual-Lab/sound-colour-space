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
                        annotation = annotation.replace('####', '\r\n\r\n')
                        # two spaces before newline for markdown newline
                        annotation = annotation.replace('##', '  \r\n')
                        sets[0].description = annotation
                        sets[0].doc_id = item[3]
                        sets[0].save()
                        total += 1
            self.stdout.write(self.style.SUCCESS('Updated %s sets.' % total))

        elif options['type'] == 'diagrams':
            with codecs.open(options['path'], 'r', encoding='cp1252') as f:
                for line in f:
                    item = line.split(u"\u00A7")
                    #print ("#%s: %s \n\n%s") % (item[2], item[0], item[1])

                    # check by image (jpg) name
                    entries = (x for x in Entry.objects.all() if x.filename == item[0])
                    i = 0
                    for e in entries:
                        if i > 0:
                            self.stdout.write(
                                self.style.WARNING('multiple entries for %s doc_id: %s' % (e, e.doc_id)))
                            continue

                        annotation = item[1]
                        annotation = annotation.replace('####', '\r\n\r\n')
                        annotation = annotation.replace('##',
                                                        '  \r\n')  # two spaces before newline for markdown newline
                        e.description = annotation
                        try:
                            e.doc_id = item[2]
                            e.save()
                        except IntegrityError:
                            self.style.WARNING('multiple keys for %s doc_id: %s' % (e, e.doc_id))

                        i += 1

                    total += 1

                    '''
                    if len(entries) == 0:
                        self.stdout.write(self.style.WARNING('no entries for %s' % (item[0])))
                    elif len(entries) > 1:
                        self.stdout.write(self.style.WARNING('multiple entries for %s doc_id: %s' % (item[0], item[2])))
                        for e in entries:
                            self.stdout.write(self.style.WARNING('multiple entries for %s doc_id: %s' % (e.doc_id, e.image)))
                    '''

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
                        annotation = annotation.replace('####', '\r\n\r\n')
                        # two spaces before newline for markdown newline
                        annotation = annotation.replace('##', '  \r\n')
                        keywords[0].description = annotation
                        keywords[0].save()

                        total += 1

            self.stdout.write(self.style.SUCCESS('Updated %s keywords.' % total))

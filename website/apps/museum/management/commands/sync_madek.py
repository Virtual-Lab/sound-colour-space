from __future__ import unicode_literals

from django.core.management.base import BaseCommand, CommandError

import os
import requests
import shutil


import re
from datetime import datetime
from django.utils import timezone


from requests.auth import HTTPBasicAuth

import urllib3
urllib3.disable_warnings()

import tempfile

from django.core.files import File

from museum.models import Keyword, Entry, Author, License, Collection


class Command(BaseCommand):
    help = 'Sync entries with MAdeK database. Needs two positional arguments: set uuid, category (one of tone_systems or colour_systems)'

    category = 'TO'

    base = 'http://medienarchiv.zhdk.ch'
    # collection_remote_id = '73114b11-08de-42a9-ba36-864d9c1b5641'

    user = 'sound-colour-space'
    password = '95ca2a71-4e01-4477-8e14-b673e96e4fe9'
    # auth_header = 'Authorization: Basic c291bmQtY29sb3VyLXNwYWNlOjk1Y2EyYTcxLTRlMDEtNDQ3Ny04ZTE0LWI2NzNlOTZlNGZlOQ=='

    auth = HTTPBasicAuth(user, password)

    def add_arguments(self, parser):
        parser.add_argument('collection_remote_id', nargs='+', type=str)
        parser.add_argument('category', type=str)

    def handle(self, *args, **options):

        if (options['category'] == "tone_systems"):
            self.category = "TO"
        elif (options['category'] == "colour_systems"):
            self.category = "CO"
        else:
            self.stdout.write(self.style.ERROR('Unknown category.'))
            return

        url = self.base + '/api/media-entries/?collection_id=' + options['collection_remote_id'][0]

        while (True):
            r = requests.get(url, auth=self.auth)

            collection_data = r.json()['_json-roa']['collection']

            relations = collection_data.get('relations')
            next_page = collection_data.get('next')

            # iterate page
            for key, value in relations.iteritems():
                self.get_entry(key, value.get('href'))

                self.stdout.write(self.style.SUCCESS('########################'))

            if (next_page == None):
                break
            else:
                url = self.base + collection_data['next']['href']
                self.stdout.write(self.style.SUCCESS('page at: %s' % url))

        self.stdout.write(self.style.SUCCESS('Successfully synced collection.'))

        # now go on for the sub sets aswell!
        url = self.base + '/api/collections/?collection_id=' + options['collection_remote_id'][0]

        while (True):
            r = requests.get(url, auth=self.auth)

            collection_data = r.json()['_json-roa']['collection']

            relations = collection_data.get('relations')
            next_page = collection_data.get('next')

            # iterate page
            for key, value in relations.iteritems():
                # get_entry(key, value.get('href'))
                self.get_collection(key, value.get('href'))

                self.stdout.write(self.style.SUCCESS('########################'))

                # sys.exit(0) # exit after first item (debugging)

            if (next_page == None):
                break
            else:
                url = self.base + collection_data['next']['href']
                self.stdout.write(self.style.SUCCESS('page at: %s' % url))

        self.stdout.write(self.style.SUCCESS('Successfully synced subsets.'))

    def get_authors(self, relations):
        # for each author
        author_objs = []
        for key, values in relations.iteritems():
            a = requests.get(self.base + values.get('href'), auth=self.auth).json()
            # print ("\tauthor: %s %s (%s) [%s %s]") % (a.get('first_name'), a.get('last_name'), a.get('pseudonym'), a.get('date_of_birth'), a.get('date_of_death'))
            new_author = {'first_name': a.get('first_name'), 'last_name': a.get('last_name'),
                          'pseudonym': a.get('pseudonym'), 'date_of_birth': a.get('date_of_birth'),
                          'date_of_death': a.get('date_of_death')}

            # create or update license
            obj, created = Author.objects.update_or_create(
                remote_uuid=a.get('id'), defaults=new_author)
            author_objs.append(obj)  # add to list for update even if existing

        return author_objs

    def get_licenses(self, relations):
        # for each license
        license_objs = []
        for key, values in relations.iteritems():
            l = requests.get(self.base + values.get('href'), auth=self.auth).json()
            # print ("\tlicence (%s): %s, %s, %s") % (l.get('id'), l.get('label'), l.get('url'), l.get('usage'))

            new_license = {'remote_uuid': l.get('id'), 'label': l.get('label'), 'url': l.get('url'),
                           'usage': l.get('usage')}
            # create or update license
            obj, created = License.objects.update_or_create(
                remote_uuid=l.get('id'), defaults=new_license)
            license_objs.append(obj)  # add to list for update even if existing

        return license_objs

    def get_keywords(self, relations):
        # for each keyword
        keyword_objs = []
        for key, values in relations.iteritems():
            l = requests.get(self.base + values.get('href'), auth=self.auth).json()

            new_tag = {'remote_uuid': l.get('id'), 'name': l.get('term')}
            # create or update keyword
            obj, created = Keyword.objects.update_or_create(
                remote_uuid=l.get('id'), defaults=new_tag)
            keyword_objs.append(obj)  # add to list for update even if existing

        return keyword_objs

    def get_entry(self, key, href):
        # get single entry
        entry_request = requests.get(self.base + href, auth=self.auth)
        entry = entry_request.json()

        self.stdout.write(self.style.SUCCESS('Madek: %s' % entry.get('id')))

        # the updated entry as dict
        new_entry = {
            "category": self.category
        }

        # get meta data
        meta_data = requests.get(self.base + href + '/meta-data/', auth=self.auth)
        meta_data = meta_data.json()

        author_objs = []
        license_objs = []
        keywords_objs = []

        # iterate over meta-data
        for m in meta_data.get('meta-data'):
            key = m.get('meta_key_id')
            id = m.get('id')
            if (key == 'madek_core:title'):
                title = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:title: %s') % title
                new_entry['title'] = title
            elif (key == 'madek_core:subtitle'):
                subtitle = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:subtitle: %s') % subtitle
                new_entry['subtitle'] = subtitle
            elif (key == 'madek_core:portrayed_object_date'):
                portrayed_object_date = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:portrayed_object_date: %s') % portrayed_object_date
                new_entry['portrayed_object_date'] = portrayed_object_date

            elif (key == 'madek_core:authors'):
                authors = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('_json-roa')['collection']
                # print('madek_core:authors: %s') % authors
                author_objs = self.get_authors(authors['relations'])

            elif (key == 'copyright:license'):
                licenses = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('_json-roa')['collection']
                # print('copyright:license: %s') % licenses
                license_objs = self.get_licenses(licenses['relations'])  # will be set at the end of this function

            elif (key == 'copyright:source'):
                source = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('copyright:source: %s') % source
                new_entry['source'] = source

            elif (key == 'copyright:copyright_usage'):
                # print('copyright:copyright_usage: %s') % requests.get(self.base+'/api/meta-data/'+id, auth=self.auth).json().get('value')
                pass
            elif (key == 'madek_core:copyright_notice'):
                copyright_notice = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:copyright_notice: %s') % copyright_notice
                new_entry['copyright_notice'] = copyright_notice

            elif (key == 'madek_core:keywords'):
                keywords = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('_json-roa')['collection']
                keywords_objs = self.get_keywords(keywords['relations'])

        # create or update entry
        obj, created = Entry.objects.update_or_create(
            remote_uuid=entry.get('id'), defaults=new_entry)

        # save image
        image_href = entry['_json-roa']['relations']['media-file'].get('href')
        image_request = requests.get(self.base + image_href, auth=self.auth)
        image = image_request.json()
        image_data_request = requests.get(self.base + image['_json-roa']['relations']['data-stream']['href'], stream=True,
                                          auth=self.auth)

        if not obj.image:
            if image_data_request.status_code == 200:
                f = tempfile.NamedTemporaryFile(delete=False)
                with open(f.name, 'wb') as f:
                    image_data_request.raw.decode_content = True
                    shutil.copyfileobj(image_data_request.raw, f)
                    # for chunk in image_data_request:
                    #    f.write(chunk)
                    f.close()
                # save entry
                with open(f.name, 'r') as f:
                    self.stdout.write(self.style.SUCCESS(image.get('filename')))
                    obj.image.save(image.get('filename'), File(f), save=True)

                f.close()
                os.unlink(f.name)

        # set licenses, authors, keywords
        self.stdout.write(self.style.SUCCESS('Entry: %s' % obj))
        obj.license.set(license_objs)
        obj.author.set(author_objs)
        for keyword in keywords_objs:
            obj.tags.add(keyword)

        # set date
        m = re.findall('^(\d{4})', str(obj.portrayed_object_date))
        if m:
            date = datetime.strptime(m[0], '%Y')
            date = timezone.make_aware(date, timezone.get_current_timezone())
            obj.date = date
            obj.date_accuracy = 3
            obj.save()

        return obj

    def get_collection(self, key, href):
        # get single entry
        collection_request = requests.get(self.base + href, auth=self.auth)
        collection = collection_request.json()

        #print ('Madek: [%s] %s') % (key, collection.get('id'))

        # the updated collection as dict
        new_collection = {}

        # get meta data
        meta_data = requests.get(self.base + href + '/meta-data/', auth=self.auth)
        meta_data = meta_data.json()

        author_objs = []

        # iterate over meta-data
        for m in meta_data.get('meta-data'):
            key = m.get('meta_key_id')
            id = m.get('id')

            if (key == 'madek_core:title'):
                title = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:title: %s') % title
                new_collection['title'] = title
            if (key == 'madek_core:subtitle'):
                subtitle = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:subtitle: %s') % subtitle
                new_collection['subtitle'] = subtitle
            if (key == 'madek_core:description'):
                description = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('value')
                # print('madek_core:description: %s') % description
                new_collection['description'] = description
            elif (key == 'madek_core:authors'):
                authors = requests.get(self.base + '/api/meta-data/' + id, auth=self.auth).json().get('_json-roa')['collection']
                # print('madek_core:authors: %s') % authors
                author_objs = self.get_authors(authors['relations'])
                for a in author_objs:
                    print ("Author: %s") % a.get_full_name()

        # print new_collection

        # create or update set
        obj, created = Collection.objects.update_or_create(
            remote_uuid=collection.get('id'), defaults=new_collection)

        obj.author.set(author_objs)

        entry_objs = []

        # get entries
        url = self.base + '/api/media-entries/?collection_id=' + collection.get('id')
        while (True):
            r = requests.get(url, auth=self.auth)
            entries_data = r.json()['_json-roa']['collection']

            relations = entries_data.get('relations')
            next_page = entries_data.get('next')

            # iterate page
            for key, value in relations.iteritems():
                e = self.get_entry(key, value.get('href'))
                entry_objs.append(e)
                # print('########################')

            if (next_page == None):
                break
            else:
                url = self.base + entries_data['next']['href']
                self.stdout.write(self.style.SUCCESS('page at: %s' % url))

        obj.entry.set(entry_objs)

        #print("Collection: %s") % (obj)
        self.stdout.write(self.style.SUCCESS('Collection: %s' % obj))






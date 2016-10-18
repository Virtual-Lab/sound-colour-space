from __future__ import unicode_literals

from django.core.management.base import BaseCommand, CommandError

import os
import requests
import shutil

from requests.auth import HTTPBasicAuth

import tempfile

from django.core.files import File

from museum.models import Entry, Author, License


class Command(BaseCommand):
    help = 'Sync entries with MAdeK database'

    base = 'http://medienarchiv.zhdk.ch'
    # collection_remote_id = '73114b11-08de-42a9-ba36-864d9c1b5641'

    user = 'sound-colour-space'
    password = '95ca2a71-4e01-4477-8e14-b673e96e4fe9'
    # auth_header = 'Authorization: Basic c291bmQtY29sb3VyLXNwYWNlOjk1Y2EyYTcxLTRlMDEtNDQ3Ny04ZTE0LWI2NzNlOTZlNGZlOQ=='

    auth = HTTPBasicAuth(user, password)

    def add_arguments(self, parser):
        parser.add_argument('collection_remote_id', nargs='+', type=str)

    def handle(self, *args, **options):

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

                # sys.exit(0) # exit after first item (debugging)

            if (next_page == None):
                break
            else:
                url = self.base + collection_data['next']['href']
                self.stdout.write(self.style.SUCCESS('page at: %s' % url))

        self.stdout.write(self.style.SUCCESS('Successfully synced.'))

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

    def get_entry(self, key, href):
        # get single entry
        entry_request = requests.get(self.base + href, auth=self.auth)
        entry = entry_request.json()

        self.stdout.write(self.style.SUCCESS('Madek: %s' % entry.get('id')))

        # the updated entry as dict
        new_entry = {}

        # get meta data
        meta_data = requests.get(self.base + href + '/meta-data/', auth=self.auth)
        meta_data = meta_data.json()

        author_objs = []
        license_objs = []

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

        # create or update entry
        obj, created = Entry.objects.update_or_create(
            remote_uuid=entry.get('id'), defaults=new_entry)

        # save image
        image_href = entry['_json-roa']['relations']['media-file'].get('href')
        image_request = requests.get(self.base + image_href, auth=self.auth)
        image = image_request.json()
        image_data_request = requests.get(self.base + image['_json-roa']['relations']['data-stream']['href'], stream=True,
                                          auth=self.auth)

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

        # set licenses, authors
        self.stdout.write(self.style.SUCCESS('Entry: %s' % obj))
        obj.license.set(license_objs)
        obj.author.set(author_objs)




